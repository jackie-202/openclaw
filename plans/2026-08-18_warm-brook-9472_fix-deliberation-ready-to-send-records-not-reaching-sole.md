# Plan 2026-08-18: Repair Deliberation sole-send delivery acceptance

The repair is an owner-authorized deployment of the already-present canonical sender unless a fresh isolated reproduction exposes a source defect.

*Status: DRAFT*
*Created: 2026-08-18*

---

## Progress

- [x] Phase 0: Config and init
- [x] Phase 1: Research
- [x] Phase 2: Knowledge
- [x] Phase 3: Synthesis

## Analysis

### Codebase Context

- `extensions/deliberation/index.ts` registers the existing enabled-only `deliberation-final-delivery` service; its Discord provider uses the generic outbound adapter and returns the receipt/message IDs.
- `extensions/deliberation/src/final-adapter.ts` is the sole path: one serialized service tick performs `ready -> reserve -> invoke -> provider.send -> completeDelivery` and drains on stop.
- `extensions/deliberation/scripts/km-listener.cross-repo.ts` can prepare a reviewed isolated item at `READY_TO_SEND`, then exercise the real KM reservation/invocation/completion protocol with a fake provider.
- `scripts/test-built-plugin-singleton.mjs` and `src/plugins/source-checkout-runtime.test.ts` already assert source/emitted registration; do not treat them as transition proof or duplicate them.
- The active worktree is broadly dirty, including the Deliberation owner surface; preserve unrelated changes and add a production edit only after current runtime evidence identifies a defect beyond stale process/artifact drift.

### Relevant Documentation

- `docs/plugins/reference/deliberation.md` assigns queue polling/single-tick scheduling to the plugin service, terminal state to KM, and provider I/O/receipts to the channel adapter.
- `docs/tools/plugin.md` requires validating the active Gateway and restarting the serving process after a source/artifact change; cold inspection is not active-process proof.

### Knowledge Base

- `learnings/runtime-errors/deliberation-active-gateway-needs-service-lifecycle-proof.md`: classify a healthy queue with zero reservations and artifact-only service evidence as deployment/process drift; use owner-approved deploy verification and a full restart, never a second sender or manual reservation.
- `learnings/architecture/deliberation-final-delivery-lifecycle-boundaries.md`: retain KM ownership of reservation/recovery/terminal state, one plugin scheduler, and the generic channel outbound adapter.
- `learnings/architecture/cross-repository-delivery-tests-guard-readiness-seam.md`: use the guarded public KM probe to create the isolated reviewed state and fake only the outbound provider.
- Recall used the local fallback because `openclaw-fork-learnings` is unavailable. Relevant follow-up guidance requires behavior-linked RED evidence, rejects reconstructing RED from later code, and requires separate rollout evidence.

## Available Skills

- `tdd`: capture any new behavior RED/GREEN and write the evidence ledger.
- `openclaw-testing`: choose scoped source, build, and changed-file proof.
- `crabbox`: run broader or live rollout proof when the owner-approved environment requires it.
- `autoreview`: conduct the mandatory post-change review within a bounded changed-file scope.
- `save-learning`: last action after the implementation session.

## Solution

Deploy the verified built artifact to the actual serving Gateway, restart that process through the owner-approved procedure, and collect read-only KM and Discord evidence for the named record. Change production code only if the isolated canonical path fails before deployment; route any repair through the existing plugin service and KM client, never a second sender.

## Implementation

1. Obtain the canonical deploy-verifier command and rollout authorization from the active host owner; record the target host, serving Gateway identity, and deployed artifact path. Stop rather than substituting a guessed deployment command.
2. Before rollout, capture the active process identity with `pnpm openclaw gateway status --deep --require-rpc --json`, plugin-owned queue/control evidence with `pnpm openclaw gateway call deliberation.status --json`, and fresh artifact registration with `pnpm openclaw plugins inspect deliberation --runtime --json`. Record that the prior process predates the verified artifact.
3. Run `pnpm test extensions/deliberation/scripts/km-listener.cross-repo.ts` to fresh-GREEN the real isolated KM path from reviewed `READY_TO_SEND` through one reservation, one fake-provider call, receipt completion, and `SENT`. Preserve its guard against production-spool access.
4. If step 3 fails in the canonical path, first capture that behavior-linked RED in `plans/checkpoints/warm-brook-9472.red-green-proof.md`, repair only the failing existing owner (`final-adapter.ts`, `km-client.ts`, or plugin lifecycle registration), then rerun the same assertion as GREEN. Do not invent a RED by weakening or reverting the existing sender.
5. If step 3 is green, make no production edit: run the owner-approved deploy verifier, deploy the exact verified artifact, and restart the actual Gateway process. Recheck Gateway/process identity, Deliberation runtime registration, controls, and queue count after restart.
6. Allow the named record to be claimed only by the restarted service. Read the KM record and delivery-attempt evidence plus the Discord result; require `SENT`, one attempt, one provider message ID, and one Discord reply. Do not reserve, send, or mutate SQLite manually.
7. Write `plans/checkpoints/warm-brook-9472.final-note.md` mapping source/build/test/rollout/live commands to outcomes, artifact/process identities, the record ID, attempt ID, provider message ID, and Discord reply. Treat absent deployment authority or any missing live fact as incomplete, not successful.
8. Run the focused test/build evidence appropriate to the changed surface, `git diff --check`, and a bounded fresh `skill:autoreview`; rerun affected evidence after review. Run `skill:save-learning` last.

## Files to Modify

| File | Change |
| --- | --- |
| `plans/checkpoints/warm-brook-9472.red-green-proof.md` | Record a real source defect RED/GREEN only if step 3 fails; otherwise record the fresh GREEN and why no synthetic RED exists. |
| `plans/checkpoints/warm-brook-9472.final-note.md` | Record the authorized rollout and read-only live exactly-once evidence. |
| `extensions/deliberation/scripts/km-listener.cross-repo.ts` | Add the behavior-linked regression only if the isolated current path exposes an untested source defect. |
| Proven existing owner file | Make the minimum repair only when the RED locates a source defect; otherwise no production file changes. |

## TDD

The parent proof at `plans/checkpoints/wild-vale-0017.red-green-proof.md` is not valid target-behavior RED: it inverted an already-present registration assertion. Link it only as rejected provenance. No synthetic RED is permitted because the current canonical sender exists.

**Fresh GREEN command:** `pnpm test extensions/deliberation/scripts/km-listener.cross-repo.ts`

If the current isolated path fails, implement the TDD cycle with `skill:tdd` in `extensions/deliberation/scripts/km-listener.cross-repo.ts` and save the same-command RED/GREEN output to `plans/checkpoints/warm-brook-9472.red-green-proof.md`:

```ts
const completed = await createFinalDeliveryAdapter({
  km: deliveryKm,
  providers: { discord: provider },
  owner: "openclaw-deliberation-integration",
}).runOnce();

assert.equal(completed?.state, "SENT", "routing: delivery did not reach SENT");
assert.equal(providerCalls.length, 1, "provider: fake adapter was not called exactly once");
```

| Evidence | RED | GREEN |
| --- | --- | --- |
| Isolated READY_TO_SEND transition | The exact assertions fail before the targeted owner repair. | One reservation/invocation, one provider call/receipt, and durable `SENT`. |
| Existing sender already correct | Not applicable; do not manufacture a failure. | Fresh isolated GREEN plus post-restart live record evidence. |

## Dependencies

- Host owner supplies deployment authorization and the canonical deploy verifier.
- The live Gateway must be restartable and serve the named Discord source; this plan does not authorize a manual message, reservation, or KM/SQLite mutation.
- Existing dirty Deliberation, Slack, docs, and batch files remain out of scope unless a fresh RED proves one is the direct owner of the defect.
