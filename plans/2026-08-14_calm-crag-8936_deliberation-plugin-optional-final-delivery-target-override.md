# Plan 2026-08-14: Deliberation delivery target acceptance fix

Complete only the missing operator override, durable target consumption, and acceptance evidence on top of the preserved Deliberation sender work.

## Current State

- Preserve the uncommitted sender lifecycle, KM contract refresh, plugin registration, and docs edits already present in `extensions/deliberation/**` and `docs/plugins/reference/deliberation.md`; they are not the override implementation.
- `extensions/deliberation/openclaw.plugin.json` and `extensions/deliberation/src/config.ts` still have no `deliveryTarget` config.
- `extensions/deliberation/src/km-client.ts` still sends caller intake unchanged and types ready/reservation envelopes with only `sourceTarget`.
- `extensions/deliberation/src/final-adapter.ts` still sends and records `deliveryEnvelope.sourceTarget`.
- The current `extensions/deliberation/contracts/km-wire-v1.json` still lacks the optional intake `deliveryTarget` and required effective envelope `deliveryTarget`; its provenance still identifies `quick-mist-0149`.
- `plans/checkpoints/quick-dune-0250.evidence.md` confirms the parent has no historical RED or verification evidence to reuse.

## Contract Gate

1. Import the preceding KM-owner-approved contract mirror and provenance update into the existing worktree before changing override tests or product code.
2. Verify the accepted schema defines the exact optional intake `deliveryTarget`, required durable ready/reservation envelope `deliveryTarget`, canonical identity constraints, and default-to-`sourceTarget` semantics.
3. If the accepted mirror is unavailable, keep this task blocked and record the missing owner revision; do not infer the wire shape, edit KM-owned mirrors by hand, or claim acceptance completion.

## Implementation

1. Use `skill:tdd` to add the failing adapter test below plus focused config and KM-client RED assertions; record command, assertion failure, and unchanged production state in `plans/checkpoints/calm-crag-8936.red-green-proof.md`.
2. Add optional `deliveryTarget` to the manifest and runtime config by reusing the existing strict Discord route schema and canonical `encodeSourceIdentity` validation. Keep `sources`, `processingSource`, overlap checks, and restricted-session behavior unchanged.
3. In `createKmClient`, encode the parsed operator route once. Reject a caller-supplied `deliveryTarget` before transport, then append the operator value only when configured; omission must emit no override so KM applies its contract default.
4. Update closed ready/reservation parsers and types to require and validate the KM-returned durable `deliveryEnvelope.deliveryTarget` exactly as defined by the accepted mirror. Do not read mutable config in the final adapter.
5. In `createFinalDeliveryAdapter`, parse the durable `deliveryTarget`, map it to the fake/Discord provider destination, and reuse the identical encoded value for `invoke` and every `completeDelivery` outcome. Keep `sourceTarget` as provenance only.
6. Extend focused tests: config omission/valid B/malformed route/unknown keys/manifest parity; KM omission/configured injection/caller rejection/missing or malformed durable target; adapter and plugin source-A-to-B delivery with identical invocation/completion evidence; same-source default supplied by KM; unchanged hook admission and processing route behavior.
7. Add contract assertions for the accepted intake/envelope fields without modifying their KM-owned definitions, and retain `sole-send.test.ts` proof that no second sender path exists.
8. Update `docs/plugins/reference/deliberation.md` config example and behavior text: optional operator route, same-source default, durable reservation authority, and no inbound/model/reviewer override.
9. Capture fresh GREEN output in the same proof file, run verification and fresh `skill:autoreview`, then write `plans/checkpoints/calm-crag-8936.evidence.md` with exact command-to-result pairs and the explicit statement that all Discord delivery used fakes.
10. Run `skill:validate-implementation`, ensure all three acceptance findings are covered by code/proof/final note, then invoke `skill:save-learning` as the implementation session's last action.

## Files to Modify

| File | Change |
| --- | --- |
| `extensions/deliberation/openclaw.plugin.json` | Add optional strict route-shaped config. |
| `extensions/deliberation/src/config.ts` | Parse and expose the optional operator route. |
| `extensions/deliberation/src/config.test.ts` | Prove omission, validation, unknown-key rejection, and manifest parity. |
| `extensions/deliberation/src/km-client.ts` | Inject trusted config and require the durable effective target. |
| `extensions/deliberation/src/km-client.test.ts` | Prove injection authority and closed envelope parsing. |
| `extensions/deliberation/src/final-adapter.ts` | Deliver and record only the reserved effective target. |
| `extensions/deliberation/src/final-adapter.test.ts` | Prove source A to target B and evidence consistency. |
| `extensions/deliberation/src/plugin.test.ts` | Prove fake Discord receives B and default envelopes still route to source. |
| `extensions/deliberation/src/contract.test.ts` | Assert accepted mirror fields and provenance. |
| `docs/plugins/reference/deliberation.md` | Document config ownership and durable routing semantics. |
| `plans/checkpoints/calm-crag-8936.red-green-proof.md` | Record genuine assertion-level RED and fresh GREEN. |
| `plans/checkpoints/calm-crag-8936.evidence.md` | Record exact final verification commands and outcomes. |

## TDD

Implement the cycle with `skill:tdd`. The parent evidence has no RED to link, and the target override is still absent, so this follow-up must capture a fresh genuine RED before editing the target production files.

**Test file:** `extensions/deliberation/src/final-adapter.test.ts`  
**Run command:** `pnpm test extensions/deliberation/src/final-adapter.test.ts --reporter=verbose`  
**Edit:** Append inside `describe("public final delivery adapter")`; reuse its existing `reservation`, `createFinalDeliveryAdapter`, and Vitest imports.

```ts
it("uses the durable delivery target for the provider and all evidence", async () => {
  const routedReservation = {
    ...reservation,
    deliveryEnvelope: {
      ...reservation.deliveryEnvelope,
      deliveryTarget: "v1:discord:account-b:channel-b",
    },
  };
  const provider = {
    send: vi.fn().mockResolvedValue({ receiptId: "receipt-1", messageId: "message-1" }),
  };
  const km = {
    ready: vi.fn().mockResolvedValue({ items: [{ recordId: "record-1", text: "reply" }] }),
    reserve: vi.fn().mockResolvedValue({ outcome: "reserved", reservation: routedReservation }),
    invoke: vi.fn().mockResolvedValue({}),
    completeDelivery: vi.fn().mockResolvedValue({ state: "SENT" }),
  };

  await createFinalDeliveryAdapter({ km, provider, owner: "owner" }).runOnce();

  expect(provider.send).toHaveBeenCalledWith(
    expect.objectContaining({ accountId: "account-b", channelId: "channel-b" }),
  );
  expect(km.invoke).toHaveBeenCalledWith(
    routedReservation,
    "v1:discord:account-b:channel-b",
    expect.any(String),
  );
  expect(km.completeDelivery).toHaveBeenCalledWith(
    expect.objectContaining({ attemptedTarget: "v1:discord:account-b:channel-b" }),
  );
});
```

| Assertion | RED | GREEN |
| --- | --- | --- |
| Provider route | Receives source account/channel A | Receives durable account/channel B |
| Invocation evidence | Records `sourceTarget` A | Records the identical durable B string |
| Completion evidence | Records `sourceTarget` A | Records the identical durable B string |
| KM/config authority | Override is absent or caller-selected | Only parsed operator config is injected; omission stays absent |

## Verification

1. `pnpm test extensions/deliberation/src/config.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/final-adapter.test.ts extensions/deliberation/src/plugin.test.ts extensions/deliberation/src/contract.test.ts extensions/deliberation/src/sole-send.test.ts extensions/deliberation/src/hooks.test.ts --reporter=verbose`
2. `pnpm test extensions/deliberation --reporter=verbose`
3. `pnpm tsgo:extensions && pnpm tsgo:extensions:test`
4. Use `skill:openclaw-testing` to select and run the smallest changed lint/guard lane; do not substitute the injected registry's generic `npm test` command for repository policy.
5. `git diff --check`
6. Record every exact command, exit result, test count, and proof gap in `plans/checkpoints/calm-crag-8936.evidence.md`; acceptance consumes that note rather than inferring results.

## Available Skills

- `tdd`: mandatory RED/GREEN workflow and proof artifact.
- `task-evidence`: establishes that the parent has no reusable historical proof.
- `openclaw-testing`: selects repository-compliant focused and changed gates.
- `autoreview`: mandatory fresh pre-handoff code review.
- `validate-implementation`: checks acceptance and architecture alignment.
- `save-learning`: mandatory last implementation-session action.

## Dependencies

- Blocking: accepted KM-owner mirror/provenance containing the exact `deliveryTarget` contract. The current worktree does not contain it.
- Tests must use mocked KM and Discord boundaries; no live spool, credentials, or real Discord sends.
- Knowledge search used the deterministic local fallback because the `openclaw-fork-learnings` QMD collection was unavailable; relevant rules require external contract authority and canonical reservation-owned delivery.

---
*Status: DRAFT*
