# Plan 2026-08-07: Deliberation final-adapter acceptance repair

_Status: DRAFT_

## Progress

- [x] Phase 0: Initialize canonical plan
- [x] Phase 1: Research current contracts and implementation state
- [x] Phase 2: Review applicable learnings
- [x] Phase 3: Synthesize repair and TDD evidence plan

## Analysis

### Codebase context

- `extensions/deliberation/src/km-client.ts` is pinned to protocol v1 and offers health, ready, intake, reserve, complete, and reconcile only; it has no immutable final-delivery envelope or durable provider-invoked acknowledgement.
- `extensions/deliberation/index.ts` wires intake/guard/history APIs only; no final-delivery trigger or adapter is registered, and `final-adapter.ts` does not exist.
- `src/plugin-sdk/channel-outbound.ts` exposes `sendDurableMessageBatch` and durable context helpers only. Its documented contract owns queueing, durability, retry, and receipts, so it cannot be the one-shot adapter seam.
- `extensions/deliberation/src/sole-send.test.ts` is a five-file literal scan for the durable helper; it does not prove final-adapter reachability, sender authority, or rejected-path behavior.

### Documentation and knowledge

- The Slice 5B task permits only two outcomes: plugin-confined adapter when both public contracts exist, or a complete evidence-backed blocker naming capability, inspected APIs, exact impossibility, and smallest generic core seam.
- The original `fresh-peak-7116` plan correctly identified both absent contracts but its proof falsely labels `dark-reef-5008` as a test RED. The cited artifact states no focused regression test was written or run.
- `extensions/AGENTS.md` prohibits production imports from core or another extension; a missing generic capability requires a separately reviewed typed SDK seam.
- `docs/plugins/sdk-channel-outbound.md` assigns durable queues, retry, receipts, and recovery to core. `docs/plugins/sdk-overview.md` requires capability-specific public subpaths rather than another channel's local runtime API.
- Knowledge search used the local backend because collection `openclaw-fork-learnings` is absent. Its usable guidance requires an activation/authority ledger rather than literal scans and treats `v1` as a wire version until ownership tracing proves otherwise.

## Approach

Current evidence selects the blocker path: neither the KM immutable envelope/provider-invocation acknowledgement nor the public account-bound one-shot sender exists. Do not add production code to force an adapter.

If both contracts become available before execution, use their authoritative schemas and add exactly one plugin-local adapter; otherwise deliver the blocker as the task result and state that behavioral TDD cannot start without inventing a wire schema.

## Implementation

1. Re-read the pinned KM Slice 5A contract and the public Plugin SDK export at execution start; record their paths, versions, accepted request/response schemas, and outcome vocabulary.
2. If either gate remains absent, create `plans/checkpoints/swift-peak-6992.checkpoint.md` as the task-result evidence: required capability, every inspected API/path, exact mismatch, smallest generic core seam, and a statement that no `src/**` or production adapter file changed. The final task result must link that artifact explicitly.
3. Verify the blocker with `pnpm test extensions/deliberation/src/sole-send.test.ts -- --reporter=verbose`, `pnpm tsgo:extensions`, `git diff --check`, and `git diff --name-only -- extensions/deliberation src/plugin-sdk`; report results without calling them adapter GREEN proof.
4. If both gates pass, first use `skill:tdd` to add `extensions/deliberation/src/final-adapter.test.ts` against the authoritative envelope/sender types and run it before `final-adapter.ts` exists. Preserve that command output in `plans/checkpoints/swift-peak-6992.red-green-proof.md`; do not cite `dark-reef-5008` as RED.
5. Implement `extensions/deliberation/src/final-adapter.ts` as the sole provider side-effect boundary: parse only the exact immutable envelope, derive the route through `parseSourceIdentity`, acknowledge invocation before one sender call, accept only a target-bound receipt, and return closed failure evidence without retry, reroute, replay, or durable dispatch.
6. Add only the KM client parser/ack method and `index.ts` registration required by the accepted contract. Test malformed/stale/mismatched/self/bot inputs, acknowledgement failure, one-call success, receipt cross-route rejection, denied/rejected/429/transport/timeout outcomes, and no retry.
7. Replace the fixed-file token scan with an authority ledger that enumerates adapter imports, registration, reachable invocation, and every production sender call. Confirm generic/session/operator/synthetic paths cannot reach the adapter.
8. Run focused GREEN, `pnpm tsgo:extensions`, and diff-scope checks. Use `skill:validate-implementation`; run `skill:save-learning` last.

## Files to Modify

| File                                                | Change                                                                |
| --------------------------------------------------- | --------------------------------------------------------------------- |
| `plans/checkpoints/swift-peak-6992.checkpoint.md`   | Current-path complete blocker/task-result evidence.                   |
| `extensions/deliberation/src/final-adapter.ts`      | Conditional: sole adapter after both contracts exist.                 |
| `extensions/deliberation/src/final-adapter.test.ts` | Conditional: authoritative-contract TDD tests.                        |
| `extensions/deliberation/src/km-client.ts`          | Conditional: accepted envelope and invocation-ack only.               |
| `extensions/deliberation/src/km-client.test.ts`     | Conditional: lock the accepted KM schema/endpoint.                    |
| `extensions/deliberation/src/sole-send.test.ts`     | Conditional: replace token scan with authority proof.                 |
| `extensions/deliberation/index.ts`                  | Conditional: register only the contract-defined plugin-local trigger. |

Do not modify `src/**` in this task. A missing sender requires a separate core task for one narrow lazy SDK runtime capability, not a plugin boundary bypass.

## TDD: skip

The current, permitted blocker path has no stable delivery schema or sender contract to test; writing adapter assertions would invent external behavior. If both gates appear, the implementation branch must use `skill:tdd`, capture a new genuine pre-implementation RED in `plans/checkpoints/swift-peak-6992.red-green-proof.md`, then capture task-owned GREEN. `plans/checkpoints/dark-reef-5008.red-green-proof.md` is explicitly not RED provenance.

## Dependencies

- KM: versioned immutable delivery envelope plus durable provider-invoked acknowledgement.
- Plugin SDK: account-bound `sendOneShot`-style non-durable sender with an exact target-bound receipt/closed failure.
- Relevant skills: `tdd` for the conditional adapter branch, `validate-implementation` for boundary proof, and `save-learning` as the final implementation action.
