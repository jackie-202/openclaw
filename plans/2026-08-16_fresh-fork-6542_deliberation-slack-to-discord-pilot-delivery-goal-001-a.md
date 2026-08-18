# Plan 2026-08-16: Deliberation Slack-to-Discord Acceptance Fix

*Status: DRAFT - blocked on accepted structured KM target artifacts*

## Analysis

- `extensions/deliberation/contracts/km-wire-v1.json` and `extensions/deliberation/src/km-client.ts` still represent delivery and attempted targets as `v1:<provider>:<account>:<channel>` strings; no accepted `threadId` field exists.
- `extensions/deliberation/src/final-adapter.ts` accepts one preselected provider, while `extensions/deliberation/index.ts` always loads Discord and omits `threadId`.
- `extensions/discord/src/outbound-adapter.ts` already accepts `threadId`; keep the change inside the Deliberation plugin and its public SDK seam.
- Preserve the completed Discord lifecycle, conflict handling, failure classification, serialized polling, stop drain, and sole-send ownership tests. Do not add Slack outbound delivery.
- `plans/checkpoints/bold-fork-3487.evidence.md` contains only `node scripts/run-vitest.mjs extensions/deliberation/src/contract.test.ts` -> `Test Files  1 passed (1)`; it contains no behavioral RED to reuse.

## Contract Gate

1. Obtain repository-local, owner-authored seq-3 contract and fixture artifacts that define exact target fields, required/optional `threadId`, bounds, lifecycle placement, equality semantics, and provenance hashes. Do not derive these details from the task prose or edit copied owner artifacts by hand.
2. Update the accepted copies in `extensions/deliberation/contracts/` and `provenance.json` only from those artifacts.
3. Extend `extensions/deliberation/src/contract.test.ts` to assert the structured schema at reservation, envelope, invocation, completion, and delivery-attempt projections; run it before behavioral TDD.
4. Stop and record the unresolved dependency if accepted artifacts remain string-based or provenance cannot be verified.

## Available Skills

- `task-evidence`: retain the parent evidence gap; never present its passing contract test as RED proof.
- `tdd`: capture genuine `fresh-fork-6542` RED/GREEN evidence after the contract gate opens.
- `validate-implementation`: verify contract, config, runtime, docs, and test alignment after GREEN.
- `save-learning`: save at least one session learning as the final action before handoff.

## Implementation

1. Use `skill:tdd` to add and capture the focused RED below before changing production code.
2. Replace only final-delivery target parsing with one strict `KmDeliveryTarget` parser derived from the accepted schema. Keep `sourceTarget` on the existing source-identity grammar.
3. Carry the parsed target object unchanged through ready, reservation request/response, invocation, completion, and delivery-attempt evidence. Use exact deep equality for every lifecycle fence and reject unknown keys or malformed values.
4. Change the optional operator override and manifest to the same canonical structured target. Send it only in the trusted reservation request; do not add runtime aliases for the old unshipped route shape.
5. In `createFinalDeliveryAdapter`, validate the ready target before reservation, compare the reserved target before invocation, and select a provider from a destination-keyed registry containing only `discord`. Unsupported or conflicting targets must stop before invocation/send without source fallback.
6. Preserve `reserve -> invoke -> send -> complete`; pass the same target and provider attempt ID through all evidence, and bind the returned receipt/message IDs to successful completion.
7. Forward optional `threadId` unchanged through Deliberation's provider abstraction to Discord `sendText({ to: "channel:<channelId>", accountId, threadId })`.
8. Update focused fixtures and tests for strict target parsing/bounds, Slack-source to threaded Discord delivery, exact lifecycle order/equality, receipt binding, unsupported/malformed targets, reservation mismatch/conflict, and zero provider calls. Retain existing Discord-only and sole-send assertions rather than adding duplicate tests.
9. Update `docs/plugins/reference/deliberation.md` so configuration, wire ownership, threading, and fail-closed behavior match the accepted target shape.
10. Run verification, `validate-implementation`, and the repository-mandated fresh autoreview; resolve actionable findings. Invoke `save-learning` last and save at least one learning file.

## Files to Modify

| File | Change |
| --- | --- |
| `extensions/deliberation/contracts/km-wire-v1.json` | Copy the accepted owner-authored structured target schema. |
| `extensions/deliberation/contracts/cutover-controls-v1.json` | Copy matching structured lifecycle fixtures. |
| `extensions/deliberation/contracts/provenance.json` | Pin the accepted owner revision and hashes. |
| `extensions/deliberation/src/contract.test.ts` | Gate all structured target projections and provenance. |
| `extensions/deliberation/src/config.ts` | Parse the canonical Discord destination override. |
| `extensions/deliberation/openclaw.plugin.json` | Mirror exact target fields and bounds. |
| `extensions/deliberation/src/km-client.ts` | Parse and fence one structured target through the KM lifecycle. |
| `extensions/deliberation/src/final-adapter.ts` | Dispatch by destination provider and preserve exact target evidence. |
| `extensions/deliberation/index.ts` | Register Discord delivery and forward `threadId`. |
| `extensions/deliberation/src/config.test.ts` | Prove runtime/manifest target-schema alignment. |
| `extensions/deliberation/src/km-client.test.ts` | Prove strict parsing and ready/reserve/invoke/complete equality. |
| `extensions/deliberation/src/final-adapter.test.ts` | Prove cross-provider routing, order, and zero-send fencing. |
| `extensions/deliberation/src/plugin.test.ts` | Prove one exact threaded Discord SDK call and receipt binding. |
| `docs/plugins/reference/deliberation.md` | Document canonical destination and threaded pilot behavior. |

Do not modify `extensions/deliberation/src/sole-send.test.ts` unless the implementation breaks its existing assertion; run it as regression proof.

## TDD

Implementace TDD cyklu dle skill:tdd. Because the parent has no genuine behavioral RED, capture a new RED before production edits in `plans/checkpoints/fresh-fork-6542.red-green-proof.md`; do not fabricate or relabel parent evidence.

**Test file:** `extensions/deliberation/src/final-adapter.test.ts`  
**Run command:** `pnpm test extensions/deliberation/src/final-adapter.test.ts`

Append inside the existing `describe` after replacing target optionality/bounds with the accepted contract:

```ts
it("routes one Slack-origin result to its canonical Discord thread", async () => {
  const target = {
    provider: "discord",
    accountId: "delivery-account",
    channelId: "delivery-channel",
    threadId: "delivery-thread",
  };
  const events: string[] = [];
  const discord = {
    send: vi.fn(async () => {
      events.push("send");
      return { receiptId: "receipt-1", messageId: "message-1" };
    }),
  };
  const durableReservation = {
    ...reservation,
    deliveryEnvelope: {
      sourceTarget: "v1:slack:workspace-a:C123",
      deliveryTarget: target,
    },
  };
  const km = {
    ready: vi.fn().mockResolvedValue({
      items: [{ recordId: "record-1", text: "reply", effectiveDeliveryTarget: target }],
    }),
    reserve: vi.fn(async () => {
      events.push("reserve");
      return { outcome: "reserved" as const, reservation: durableReservation };
    }),
    invoke: vi.fn(async () => events.push("invoke")),
    completeDelivery: vi.fn(async () => {
      events.push("complete");
      return { state: "SENT" };
    }),
  };

  await createFinalDeliveryAdapter({
    km,
    providers: { discord },
    owner: "owner",
  } as never).runOnce();

  expect(events).toEqual(["reserve", "invoke", "send", "complete"]);
  expect(discord.send).toHaveBeenCalledTimes(1);
  expect(discord.send).toHaveBeenCalledWith({
    ...target,
    text: "reply",
    idempotencyKey: "provider:attempt-1",
  });
});
```

| Test | RED | GREEN |
| --- | --- | --- |
| Slack source, structured Discord destination | Current adapter rejects the object target and has no `providers` registry. | One Discord call receives exact account/channel/thread after reserve and invoke. |
| Ready/reservation mismatch | Current adapter does not compare structured values. | Reject before invoke/send; no source fallback. |
| Malformed or unsupported target | Current string parser cannot enforce the accepted object schema. | Reject before reservation or provider call, according to where invalid evidence enters. |
| Lifecycle/receipt evidence | Current KM client accepts only string targets. | Exact object target and receipt/message IDs survive reservation through completion. |

Capture RED and GREEN with the same focused command via:

```bash
TASK_ID=fresh-fork-6542 python3 "$HOME/.config/opencode/skills/tdd/scripts/proof-capture.py" red -- pnpm test extensions/deliberation/src/final-adapter.test.ts
TASK_ID=fresh-fork-6542 python3 "$HOME/.config/opencode/skills/tdd/scripts/proof-capture.py" green -- pnpm test extensions/deliberation/src/final-adapter.test.ts
```

## Verification

1. `pnpm test extensions/deliberation/src/contract.test.ts`
2. `pnpm test extensions/deliberation/src/config.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/final-adapter.test.ts extensions/deliberation/src/plugin.test.ts extensions/deliberation/src/sole-send.test.ts`
3. `pnpm tsgo:extensions`
4. `pnpm tsgo:extensions:test`
5. `pnpm lint:extensions -- extensions/deliberation`
6. `pnpm format:check -- extensions/deliberation docs/plugins/reference/deliberation.md`
7. `pnpm docs:check`
8. `git diff --check`
9. Verify `plans/checkpoints/fresh-fork-6542.red-green-proof.md` contains genuine RED and GREEN sections.

## Dependencies

- Accepted structured KM contract/fixtures and provenance must be available inside this repository before implementation.
- No core SDK or Discord adapter change is expected; escalate instead of reaching into core or another plugin.

---
*Created: 2026-08-16*
*Status: DRAFT - blocked on accepted structured KM target artifacts*
