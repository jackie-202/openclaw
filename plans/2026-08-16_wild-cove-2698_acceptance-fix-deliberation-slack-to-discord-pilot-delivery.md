# Plan 2026-08-16: Deliberation Slack-to-Discord acceptance fix

*Status: DRAFT - blocked on owner-authored structured KM artifacts*

## Progress

- [x] Phase 0: initialize canonical plan
- [x] Phase 1: inspect preserved implementation state
- [x] Phase 2: load relevant knowledge and contracts
- [x] Phase 3: synthesize implementation and TDD steps

## Analysis

### Existing state

- `extensions/deliberation/src/final-adapter.ts` still accepts one injected provider, parses the destination as a source-identity string, and has no thread field.
- `extensions/deliberation/src/km-client.ts` carries string targets through ready, reservation, invocation, completion, and attempt evidence.
- `extensions/deliberation/index.ts` always loads Discord and calls `sendText` without `threadId`; existing ordering, failure classification, timer serialization, and stop-drain behavior must remain intact.
- Parent evidence contains only a passing contract test, not a behavioral RED; a genuine new RED is required for `wild-cove-2698`.

### Owner contract and runtime boundaries

- `extensions/deliberation/contracts/km-wire-v1.json` and its pinned provenance still define string `deliveryTarget`/`attemptedTarget` values and no thread field. Owner-authored structured artifacts are a hard prerequisite; do not invent or hand-edit the external contract.
- `api.runtime.channel.outbound.loadAdapter("discord")` is the correct plugin boundary. Its `sendText` contract already accepts `threadId`, and `extensions/discord/src/outbound-adapter.ts` routes that value natively.
- No core SDK, Discord plugin, or Slack outbound change is needed.

### Relevant knowledge

- `learnings/architecture/acceptance-fix-owner-contract-gate.md`: provenance integrity does not prove the required future shape; all lifecycle projections must agree before implementation.
- `learnings/architecture/2026-07-28_external-contract-gates-precede-behavioral-tdd.md`: close the owner-contract gate before capturing behavioral RED.
- `learnings/architecture/2026-07-28_wire-protocol-versions-are-not-implementation-generations.md`: preserve KM lifecycle authority and the sole sender path rather than treating `v1` naming as obsolete.
- Knowledge search used deterministic local fallback because QMD collection `openclaw-fork-learnings` was unavailable.

## Available Skills

- `tdd`: capture genuine task-scoped RED/GREEN evidence.
- `task-evidence`: preserve the parent evidence gap without reconstructing history.
- `openclaw-testing`: select focused extension verification.
- `validate-implementation`: check runtime, config, contract, and docs alignment after GREEN.
- `autoreview`: run mandatory fresh review before implementation handoff.
- `save-learning`: save the required final implementation-session learning.

## Approach

Keep source identity and destination identity separate. `sourceTarget` remains the canonical Slack/Discord source string; only the owner-defined delivery target becomes structured. Carry that one structured value unchanged through KM reservation, invocation, completion, and provider dispatch, selecting Discord from the destination rather than the source.

## Implementation

1. Require owner-authored structured `km-wire-v1.json`, cutover fixtures, and matching provenance hashes that define exact fields, bounds, thread optionality, lifecycle placement, and equality. Copy those artifacts without local reinterpretation; run the contract test and stop if any lifecycle projection remains string-based or inconsistent.
2. Invoke `skill:tdd`. Confirm the existing Discord-only characterization remains GREEN, append the Slack-origin/Discord-destination test below, and capture a genuine RED under task `wild-cove-2698` before production edits. Parent task evidence has no reusable behavioral RED.
3. Define one strict `KmDeliveryTarget` parser from the accepted schema in `km-client.ts`; keep `sourceTarget` on `parseSourceIdentity`. Reject unknown fields and compare targets with exact deep equality across ready, reservation, invocation, delivery-attempt, and completion evidence.
4. Align the optional operator override and manifest with the accepted structured Discord target. Send the override only in the trusted reservation request; add no string-target runtime compatibility path for this unshipped shape.
5. Change `createFinalDeliveryAdapter` to accept a destination-keyed provider registry containing only `discord`. Validate the ready target before reservation, require the reservation target to equal it before invocation, and reject malformed, unsupported, or conflicting targets before every provider call with no source fallback.
6. Extend `FinalDeliveryProvider.send` with the accepted optional thread field. In `index.ts`, load the adapter named by the validated destination and call Discord `sendText` once with exact `accountId`, `to: channel:<channelId>`, and `threadId`; preserve receipt/message mapping, attempt identity, failure classification, serialized polling, and stop drain.
7. Add focused KM, adapter, and plugin tests for exact lifecycle equality, Slack-source threaded Discord success, one configured send, receipt binding, unsupported/malformed targets, ready/reservation mismatch, conflict/disabled outcomes, and zero provider calls. Retain existing Discord-only and sole-send coverage rather than duplicating it.
8. Update the Deliberation reference page only where the accepted destination shape, threading, and fail-closed behavior differ. Run focused verification, `validate-implementation`, and fresh `autoreview`; resolve actionable findings. Invoke `save-learning` last in the implementation session.

## Files to Modify

| File | Change |
| --- | --- |
| `extensions/deliberation/contracts/km-wire-v1.json` | Copy the owner-authored structured lifecycle schema. |
| `extensions/deliberation/contracts/cutover-controls-v1.json` | Copy matching structured target fixtures. |
| `extensions/deliberation/contracts/provenance.json` | Pin owner revision and artifact hashes. |
| `extensions/deliberation/src/contract.test.ts` | Assert the accepted target shape at every lifecycle projection. |
| `extensions/deliberation/src/km-client.ts` | Parse and fence one structured target through KM evidence. |
| `extensions/deliberation/src/final-adapter.ts` | Dispatch by destination provider and forward thread identity. |
| `extensions/deliberation/src/config.ts` | Parse the accepted Discord destination override. |
| `extensions/deliberation/openclaw.plugin.json` | Mirror exact config fields and bounds. |
| `extensions/deliberation/index.ts` | Register Discord delivery through the generic outbound runtime and pass `threadId`. |
| `extensions/deliberation/src/{config,km-client,final-adapter,plugin}.test.ts` | Prove schema alignment, fencing, routing, one send, and receipt binding. |
| `docs/plugins/reference/deliberation.md` | Document the structured threaded destination and fail-closed routing. |

Do not change core SDK, Discord, Slack outbound, or `sole-send.test.ts` unless focused regression proof exposes a concrete gap.

## TDD

Implementace TDD cyklu dle skill:tdd. Record proof in `plans/checkpoints/wild-cove-2698.red-green-proof.md` with the commands below; do not relabel the parent’s passing contract test as RED.

**Test file:** `extensions/deliberation/src/final-adapter.test.ts`  
**Run command:** `pnpm test extensions/deliberation/src/final-adapter.test.ts`

Append inside the existing `describe` after the contract gate supplies the exact structured field names:

```ts
it("routes one Slack-origin item to its canonical Discord thread", async () => {
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
  const km = {
    ready: vi.fn().mockResolvedValue({
      items: [{ recordId: "record-1", text: "reply", effectiveDeliveryTarget: target }],
    }),
    reserve: vi.fn(async () => {
      events.push("reserve");
      return {
        outcome: "reserved" as const,
        reservation: {
          ...reservation,
          deliveryEnvelope: {
            sourceTarget: "v1:slack:workspace-a:C123",
            deliveryTarget: target,
          },
        },
      };
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
  expect(discord.send).toHaveBeenCalledOnce();
  expect(discord.send).toHaveBeenCalledWith({
    ...target,
    text: "reply",
    idempotencyKey: "provider:attempt-1",
  });
});
```

| Test | RED before implementation | GREEN after implementation |
| --- | --- | --- |
| Slack source, Discord destination | Current adapter rejects the object target and has no `providers` registry. | Exact `reserve -> invoke -> send -> complete` order and one threaded Discord call. |
| Ready/reservation mismatch | Current adapter does not fence structured values. | Reject before invocation/send; no fallback. |
| Malformed/unsupported destination | Current parser only understands source-identity strings. | Strict rejection with zero provider calls. |
| Lifecycle and receipt evidence | Current KM client accepts string targets only. | Exact structured target, provider attempt, receipt, and message IDs survive completion. |

```bash
TASK_ID=wild-cove-2698 python3 "$HOME/.config/opencode/skills/tdd/scripts/proof-capture.py" red -- pnpm test extensions/deliberation/src/final-adapter.test.ts
TASK_ID=wild-cove-2698 python3 "$HOME/.config/opencode/skills/tdd/scripts/proof-capture.py" green -- pnpm test extensions/deliberation/src/final-adapter.test.ts
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
9. Confirm `plans/checkpoints/wild-cove-2698.red-green-proof.md` contains genuine RED and GREEN sections from the same focused command.

## Resume Gate

- Required input: owner-authored structured contract/fixtures with matching provenance in `extensions/deliberation/contracts/`.
- Resume only when `pnpm test extensions/deliberation/src/contract.test.ts` passes and every target-bearing lifecycle schema uses the same structured shape.
- If those artifacts remain absent or contradict the requested fields, record the blocker instead of inventing a contract or fabricating TDD evidence.

---
*Created: 2026-08-16*  
*Status: DRAFT - blocked on owner-authored structured KM artifacts*
