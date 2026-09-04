# Plan 2026-08-25: Fix deliberation final-delivery idempotency key

Separate KM delivery-attempt identity from the bounded key sent to channel providers.

## Approach

- Keep `deriveProviderAttemptId(attemptId)` returning `provider:<attemptId>` for KM invoke/completion correlation; `extensions/deliberation/src/km-client.ts:1399` and `extensions/deliberation/src/km-client.ts:1464` accept and validate this 1-256 character identity.
- Add `deriveProviderIdempotencyKey(attemptId)` in `extensions/deliberation/src/final-adapter.ts`, using SHA-256 truncated to 24 lowercase hex characters.
- Document beside the helper that 24 hex characters retain 96 bits; collision probability remains negligible for delivery-attempt volume (birthday bound near `2^48` attempts) while satisfying Discord's 25-character nonce limit.
- Derive both values once after reservation: pass the full provider attempt ID only to KM `invoke`/`completeDelivery`, and pass the compact key only to `provider.send`.
- Leave `extensions/discord` unchanged: its 1-25 validation is the native nonce contract (`extensions/discord/src/outbound-adapter.ts:295`).
- Leave `extensions/slack` unchanged: it carries the common field but reports native idempotency as `unsupported` and does not include the key in `chat.postMessage` (`extensions/slack/src/send.ts:525`). Passing the same compact deterministic key is harmless and keeps one provider boundary.

## Implementation

1. Use `skill:tdd` to add the focused regression in `extensions/deliberation/src/final-adapter.test.ts`; run it before production edits and record RED evidence.
2. Import `createHash` from `node:crypto`, add the 24-character derivation helper, and give the KM identity and provider send key explicit adjacent names in `createFinalDeliveryAdapter().runOnce()`.
3. Update deliberation tests that currently expect `deriveProviderAttemptId()` as the outbound key: `final-adapter.test.ts`, `plugin.test.ts`, `orchestration.test.ts`, and `delivery-composition.test.ts`. Keep KM payload assertions expecting `provider:<attemptId>`.
4. Confirm `delivery-probe.test.ts` still proves unchanged KM invocation/completion payloads; do not alter Discord or Slack adapter tests unless verification exposes an unrelated mismatch.
5. Run focused and package-level proof, then `skill:autoreview`; resolve all accepted/actionable findings before handoff.

## Files to Modify

| File                                                       | Change                                                                           |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `extensions/deliberation/src/final-adapter.ts`             | Add compact provider-key derivation and separate it from KM `providerAttemptId`. |
| `extensions/deliberation/src/final-adapter.test.ts`        | Add length, determinism, distinctness, and KM/provider separation coverage.      |
| `extensions/deliberation/src/plugin.test.ts`               | Expect the compact key at Discord and Slack outbound calls.                      |
| `extensions/deliberation/src/orchestration.test.ts`        | Expect compact Discord send key while preserving full KM identity.               |
| `extensions/deliberation/src/delivery-composition.test.ts` | Expect the compact key in the real Discord nonce payload.                        |

## TDD

Implement the TDD cycle with `skill:tdd` and write RED/GREEN evidence to `plans/checkpoints/cool-brook-8631.red-green-proof.md`.

**Test file:** `extensions/deliberation/src/final-adapter.test.ts`  
**RED command:** `pnpm test extensions/deliberation/src/final-adapter.test.ts`  
**Edit:** append this behavior test inside `describe("public final delivery adapter", ...)`, using the existing fixture shape.

```ts
async function captureProviderIdempotencyKey(attemptId: string): Promise<string> {
  const provider = {
    send: vi.fn(async (_params: { idempotencyKey: string }) => ({
      receiptId: "receipt-1",
      messageId: "message-1",
    })),
  };
  const km = {
    ready: vi.fn().mockResolvedValue({
      items: [{ recordId: "record-1", text: "reply", effectiveDeliveryTarget: deliveryTarget }],
    }),
    reserve: vi.fn().mockResolvedValue({
      outcome: "reserved",
      reservation: { ...reservation, attemptId },
    }),
    invoke: vi.fn().mockResolvedValue({}),
    completeDelivery: vi.fn().mockResolvedValue({ state: "SENT" }),
  };

  await createFinalDeliveryAdapter({
    km,
    providers: { discord: provider },
    owner: "owner",
  } as never).runOnce();

  return provider.send.mock.calls[0]![0].idempotencyKey;
}

it("derives a bounded deterministic provider key per delivery attempt", async () => {
  const firstAttempt = "6488c0ba0123456789abcdef01234567";
  const secondAttempt = "f78294f70123456789abcdef01234567";

  const first = await captureProviderIdempotencyKey(firstAttempt);
  const repeated = await captureProviderIdempotencyKey(firstAttempt);
  const second = await captureProviderIdempotencyKey(secondAttempt);

  expect(first).toMatch(/^[0-9a-f]{24}$/); // RED: current key is 41 characters.
  expect(first.length).toBeLessThanOrEqual(25);
  expect(repeated).toBe(first);
  expect(second).not.toBe(first);
});
```

| Assertion                                             | RED                                                                 | GREEN                       |
| ----------------------------------------------------- | ------------------------------------------------------------------- | --------------------------- |
| 24 lowercase hex characters and at most 25 characters | Current `provider:<32 hex>` value fails shape/length.               | Truncated SHA-256 passes.   |
| Same attempt ID produces the same key                 | Already deterministic; retained as regression coverage.             | Hash output remains stable. |
| Different attempt IDs produce different keys          | Existing sample differs; retained across the representation change. | Sample hashes differ.       |

## Verification

1. Focused GREEN: `pnpm test extensions/deliberation/src/final-adapter.test.ts`.
2. Affected extension suites: `pnpm test extensions/deliberation extensions/discord`.
3. Changed lanes: `pnpm changed:lanes --json`, then `pnpm check:changed` per `skill:openclaw-testing`.
4. Build the affected published surface: `pnpm build`.
5. Review hygiene: `git diff --check` and `git diff --numstat`; production LOC growth is limited to the single boundary helper and explicit identity split.
6. Run `skill:autoreview` until no accepted/actionable findings remain.
7. Run `skill:save-learning` last and record the distinction between control-plane attempt identity and provider-constrained idempotency tokens.

_Status: DRAFT_
