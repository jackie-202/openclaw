# Checkpoint: swift-peak-6992

## Steps

- ✅ Step 1: Inspect the accepted KM and public Plugin SDK delivery contracts.
- ✅ Step 2: Record the required evidence-backed blocker without core changes.
- ✅ Step 3: Run focused verification and save a learning.

## Last completed

Verified the existing Deliberation contract surface; saved the contract-gate learning.

## Context for resume

The adapter cannot be implemented safely with current contracts.

Required capability: a KM-owned, versioned immutable delivery envelope with a durable provider-invoked acknowledgement, plus an OpenClaw public SDK account-bound one-shot sender that invokes exactly once without queueing, retry, rerouting, replay, or reconciliation and returns a target-bound receipt.

Inspected KM contract: `extensions/deliberation/contracts/km-wire-v1.json:73-120,133-182,224-239` defines ready items, reservations, completions, reconciliations, and records only. It supplies no delivery-envelope endpoint/schema, immutable source target, or invocation acknowledgement. `extensions/deliberation/src/km-client.ts:605-712` faithfully exposes only ready, reserve, complete, and reconcile.

Inspected public SDK contract: `src/plugin-sdk/channel-outbound.ts:202-232` exports `sendDurableMessageBatch` and its durable context only. It has durable runtime ownership and therefore cannot meet the Slice 5B one-shot boundary. No other inspected public SDK export provides the required sender.

Exact impossibility: the plugin cannot decide when a final payload is eligible, freeze its canonical target, durably record the invocation before a provider call, or call an account-bound non-durable sender through public APIs. Building `final-adapter.ts` would invent a second KM schema or violate at-most-once semantics; using `sendDurableMessageBatch` would delegate retries/durability outside KM.

Smallest generic core seam: a narrow public runtime SDK function accepting explicit `{ channel, accountId, target, text, signal }`, performing one native provider send with no queue/retry/reroute/reconciliation, and returning a receipt bound to exactly that channel/account/target. KM must separately publish the immutable envelope and durable invocation acknowledgement contract. Those changes require separately reviewed KM/core work; this task intentionally makes no `src/**` or production changes.

TDD: skip - no adapter behavior can be truthfully tested until both required public contracts exist. The cited `dark-reef-5008` proof contains no genuine RED result, so it cannot be reused. A post-gate synthetic RED would fabricate provenance.

Verification: `pnpm test extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/sole-send.test.ts -- --reporter=verbose` passed (14 tests); `pnpm tsgo:extensions` passed; `pnpm build` passed. `pnpm lint:extensions` is blocked before linting by the unrelated Slack boundary declaration failure: `primeChannelOutboundSendMock` is absent from `openclaw/plugin-sdk/channel-contract-testing`.
