# Plan 2026-08-16: Deliberation Slack-to-Discord Pilot Delivery

Adapt the existing sole final sender to consume KM-owned structured destinations and route the source-only Slack pilot through Discord without adding Slack outbound capability.

*Status: DRAFT - blocked on stable seq-3 contract evidence*

## Progress

- [x] Phase 0: initialize canonical plan
- [x] Phase 1: research proposal, contracts, code, and tests
- [x] Phase 2: incorporate relevant learnings
- [x] Phase 3: synthesize implementation and verification steps

## Analysis

### Codebase Context

- `extensions/deliberation/src/final-adapter.ts` currently parses destination as source identity and performs `ready -> reserve -> invoke -> provider.send -> complete`; provider failure remains a single terminal `FAILED` completion.
- `extensions/deliberation/index.ts` owns the sole real send through `api.runtime.channel.outbound.loadAdapter("discord")`; Discord `sendText` already accepts `threadId` and routes it in `extensions/discord/src/outbound-adapter.ts`.
- `extensions/deliberation/src/km-client.ts` strictly checks envelope provenance and reservation/invocation/completion evidence, but every target is currently a string.
- `extensions/deliberation/src/config.ts` and `openclaw.plugin.json` expose a Discord-only operator override using `{ channel, accountId, target }`; source routes already admit Slack independently.
- `extensions/deliberation/src/sole-send.test.ts` protects intake/KM/guard paths from acquiring a durable sender.

### Contract Evidence

- Blocker: the accessible accepted fixture `extensions/deliberation/contracts/km-wire-v1.json` still defines `deliveryTarget` and `attemptedTarget` as `v1:<provider>:<account>:<channel>` strings and contains no `threadId`.
- No repository-local seq-3 plan, checkpoint, or fixture contains the required exact `{ provider, accountId, channelId, threadId }` wire shape or bounds.
- The proposal path was denied by workspace permissions. Do not inspect `km-system`, infer field bounds, or modify contract/provenance files in this slice.
- Implementation may start only after stable seq-3 owner evidence is present in this repository and its provenance check passes.

### Knowledge Base

- `learnings/architecture/2026-07-28_external-contract-gates-precede-behavioral-tdd.md`: close the external contract gate before behavioral RED.
- `learnings/architecture/deliberation-final-delivery-lifecycle-boundaries.md`: KM owns lifecycle/idempotency; Deliberation owns one provider invocation; channel outbound owns native routing/receipt.
- `learnings/architecture/use-generic-outbound-runtime-adapter-for-cross-plugin-sends.md`: use `api.runtime.channel.outbound.loadAdapter`, never Discord internals.
- `learnings/architecture/deliberation-provider-thread-routing-outside-closed-wire.md`: keep Slack source event/thread identity separate from final destination identity.
- Recall used deterministic local fallback because QMD collection `openclaw-fork-learnings` was unavailable.

## Available Skills

- `tdd`: capture the focused cross-provider RED/GREEN after the contract gate closes.
- `openclaw-testing`: choose focused tests and extension typecheck commands.
- `autoreview`: run the mandatory fresh code review before handoff.
- `save-learning`: save the required final session learning.

## Implementation

1. Stop unless repository-local seq-3 evidence defines the exact structured target schema, field optionality/bounds, placement in ready/reservation/invocation/completion payloads, equality semantics, and updated provenance hashes. Run `extensions/deliberation/src/contract.test.ts` before edits.
2. Use `skill:tdd` to first pin existing Discord characterization: `reserve -> invoke -> send -> complete`, one provider attempt ID, success receipt/message binding, terminal failure evidence, conflict/replay zero-send behavior, and no overlapping service ticks.
3. Add the focused Slack-source/Discord-destination RED in `final-adapter.test.ts`; prove destination provider selection, exact account/channel/thread routing, and no derivation from `sourceTarget`.
4. Replace only delivery-target parsing with the seq-3 structured schema in `km-client.ts`. Keep `sourceTarget` on `parseSourceIdentity`; validate target exact keys and owner-defined bounds, then carry one canonical target value through ready, reservation, invocation, attempt projection, and completion comparisons.
5. Update the operator `deliveryTarget` config and manifest to the same structured Discord pilot shape. Require explicit `accountId` and `channelId`, preserve optionality of `threadId` exactly as seq 3 defines it, and serialize the override only at the KM-owned boundary specified by that contract.
6. Change the final adapter to select from a destination-keyed provider registry containing only `discord`. Validate the ready target before reservation; compare the reserved target before invocation; rely on the KM client to reject mismatched invocation/completion evidence. Unsupported or malformed providers/fields must throw before invocation/send with no source fallback.
7. Pass `threadId` unchanged to Discord `sendText` when present while retaining `to: channel:<channelId>`, explicit `accountId`, the existing result receipt mapping, adapter caching, failure classification, serialized polling, and stop-time drain.
8. Add mocked-KM/plugin coverage for Slack -> Discord success, exact thread, one send, receipt binding, reservation conflict/replay fencing, ready/reservation/invocation/completion target mismatches, malformed/unsupported targets, and ordinary Discord -> Discord behavior. Assert zero Discord and zero Slack provider calls on every pre-send rejection.
9. Strengthen `sole-send.test.ts` to cover intake, hooks/guards, history, routing, and KM paths while permitting the existing final adapter/index ownership only; do not add a Slack outbound adapter or second service.
10. Run focused tests, extension lint/typechecks, formatting, `git diff --check`, and `skill:autoreview`; resolve accepted findings before handoff.

## Files to Modify

| File | Change |
| --- | --- |
| `extensions/deliberation/src/config.ts` | Parse the seq-3 structured Discord operator destination without changing source-route identity. |
| `extensions/deliberation/openclaw.plugin.json` | Mirror the exact config schema and bounds. |
| `extensions/deliberation/src/km-client.ts` | Parse and fence canonical structured targets through all KM lifecycle evidence. |
| `extensions/deliberation/src/final-adapter.ts` | Dispatch by destination provider, compare exact targets, and forward optional thread identity. |
| `extensions/deliberation/index.ts` | Register only the Discord provider and pass `threadId` through the generic outbound adapter. |
| `extensions/deliberation/src/config.test.ts` | Prove strict structured config and reject unknown/malformed/Slack delivery values. |
| `extensions/deliberation/src/km-client.test.ts` | Prove exact structured parsing, bounds, lifecycle equality, replay, and mismatch fencing. |
| `extensions/deliberation/src/final-adapter.test.ts` | Characterize order/failures and prove cross-provider destination dispatch. |
| `extensions/deliberation/src/plugin.test.ts` | Prove mocked Slack-source -> threaded Discord send and Discord regressions. |
| `extensions/deliberation/src/sole-send.test.ts` | Retain one durable send owner across intake/hook/history paths. |
| `extensions/deliberation/src/contract.test.ts` | Assert the already-landed seq-3 fixture exposes the structured target; do not author owner contract data here. |

## TDD

Implement the RED/GREEN cycle with `skill:tdd` and record evidence in `plans/checkpoints/bold-fork-3487.red-green-proof.md`. Run the characterization tests GREEN before adding this RED.

**Test file:** `extensions/deliberation/src/final-adapter.test.ts`  
**Run command:** `pnpm test extensions/deliberation/src/final-adapter.test.ts`

Append this executable skeleton after replacing `canonicalDestination` with the exact seq-3 fixture helper/value:

```ts
it("routes a Slack-origin result once to the structured Discord thread", async () => {
  const canonicalDestination = {
    provider: "discord",
    accountId: "delivery-account",
    channelId: "test-deliberation",
    threadId: "discord-thread-1",
  };
  const events: string[] = [];
  const reservation = {
    recordId: "record-1",
    attemptId: "attempt-1",
    owner: "owner",
    leaseToken: "lease",
    deliveryEnvelope: {
      sourceTarget: "v1:slack:workspace-a:C123",
      deliveryTarget: canonicalDestination,
    },
    deliveryEnvelopeDigest: "a".repeat(64),
  };
  const discord = {
    send: vi.fn(async () => {
      events.push("send");
      return { receiptId: "receipt-1", messageId: "message-1" };
    }),
  };
  const km = {
    ready: vi.fn().mockResolvedValue({
      items: [{ recordId: "record-1", text: "reply", effectiveDeliveryTarget: canonicalDestination }],
    }),
    reserve: vi.fn(async () => {
      events.push("reserve");
      return { outcome: "reserved", reservation };
    }),
    invoke: vi.fn(async () => events.push("invoke")),
    completeDelivery: vi.fn(async () => {
      events.push("complete");
      return { state: "SENT" };
    }),
  };

  await createFinalDeliveryAdapter({
    km: km as never,
    providers: { discord },
    owner: "owner",
  }).runOnce();

  expect(events).toEqual(["reserve", "invoke", "send", "complete"]);
  expect(discord.send).toHaveBeenCalledTimes(1);
  expect(discord.send).toHaveBeenCalledWith({
    accountId: "delivery-account",
    channelId: "test-deliberation",
    threadId: "discord-thread-1",
    text: "reply",
    idempotencyKey: "provider:attempt-1",
  });
});
```

| Case | RED before implementation | GREEN after implementation |
| --- | --- | --- |
| Slack source, Discord destination | Current adapter rejects the object as an unsupported source-identity destination/API lacks `providers`. | Exact lifecycle order and one threaded Discord call pass. |
| Target mismatch/malformed provider | New table-driven assertions expose missing structured equality/validation. | Rejection occurs before invocation/send with no fallback. |
| Discord regression | Characterization remains GREEN throughout. | Existing unthreaded and failure behavior is unchanged. |

## Verification

1. `pnpm test extensions/deliberation/src/config.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/final-adapter.test.ts extensions/deliberation/src/plugin.test.ts extensions/deliberation/src/sole-send.test.ts extensions/deliberation/src/contract.test.ts`
2. `pnpm tsgo:extensions && pnpm tsgo:extensions:test`
3. `pnpm lint:extensions -- extensions/deliberation`
4. `pnpm format:check -- extensions/deliberation/src extensions/deliberation/index.ts extensions/deliberation/openclaw.plugin.json`
5. `git diff --check`

Do not run live sends, change live config, inspect `km-system`, or use the task’s raw Vitest/Prettier commands; repository policy requires the test wrapper and oxfmt.

## Blocker Resolution

- Required input: stable seq-3 contract/fixtures copied into `extensions/deliberation/contracts/` with matching `provenance.json`, or another repository-local batch artifact that pins the exact owner-authored shape and bounds.
- Resume condition: `pnpm test extensions/deliberation/src/contract.test.ts` passes and the fixture consistently uses structured targets at every lifecycle stage.
- Escalate instead of implementing if seq-3 evidence remains absent or contradicts the task; do not synthesize a wire contract from the proposal summary.
