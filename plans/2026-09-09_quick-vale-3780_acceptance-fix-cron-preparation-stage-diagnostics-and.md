# Plan 2026-09-09: Cron preparation acceptance repair

Close the remaining late-release assertions and make the preserved owner implementation available to acceptance as exact evidence.

_Status: DRAFT_

## Analysis

- `src/cron/types.ts`, `src/cron/service/{state,timer,agent-watchdog,execution-errors}.ts`, `src/cron/isolated-agent/run.ts`, and `src/gateway/server-cron.ts` already implement closed setup stages, retained watchdog diagnostics, unchanged timeout semantics, cooperative cancellation, and Gateway forwarding.
- `src/cron/service/timer.regression.test.ts:1591` already proves retained stage evidence, one terminal event, and no late dispatch, but does not explicitly observe abort or compare cleanup and persisted terminal state after release.
- Acceptance rejected an incomplete task-scoped bundle; `plans/checkpoints/swift-dune-1177.checkpoint.md` did not supply the preserved production diff.
- Genuine RED exists at `plans/checkpoints/bright-mist-3363.red-green-proof.md:5`; follow-up work must not fabricate another RED.
- `learnings/architecture/cron-setup-watchdog-progress-and-cancellation.md` and `learnings/tooling/2026-09-09_acceptance-repairs-need-provenance-and-boundary-assertions.md` require boundary assertions, exact preserved provenance, and no speculative production rewrite.

## Available Skills

- `tdd`: reuse historical RED and capture fresh GREEN.
- `task-evidence`: recover exact parent command outcomes if proof provenance is incomplete.
- `openclaw-testing`: choose focused cron/Gateway and changed-lane checks.
- `autoreview`: run the mandatory fresh pre-handoff review.
- `save-learning`: record the implementation-session learning last.

## Implementation

1. Preserve the existing cron and Gateway production changes; do not rewrite or touch them solely to force a new diff.
2. Extend `src/cron/service/timer.regression.test.ts:1591` with an abort listener and a deferred-settled signal. Snapshot `lastStatus`, `lastError`, and `lastDiagnostics` after timeout, release setup, await settlement, then assert abort observed, no model dispatch, one cleanup, one terminal event, unchanged in-memory state, and matching state from `loadCronStore(store.storePath)`.
3. Change production code only if those assertions expose a real defect; retain the 60-second setup budget, timeout prefix/classification, execution budget, and service-owned terminal write.
4. Create `plans/checkpoints/quick-vale-3780.red-green-proof.md`: link the genuine parent RED, identify the historical failing assertions, and append exact fresh GREEN output for this follow-up.
5. Create `plans/checkpoints/quick-vale-3780.evidence.md` with the exact preserved diff/base provenance for every owner file listed below, not narrative claims alone. Use task lineage/evidence tooling where available; do not manufacture no-op source edits.
6. Create `plans/checkpoints/quick-vale-3780.checkpoint.md` linking this plan, both proof artifacts, the complete owner-file inventory, and exact verification outcomes.
7. Run fresh `skill:autoreview` until no accepted actionable findings remain, then invoke `skill:save-learning` as the final implementation-session action.

## Files To Modify

| File                                                   | Change                                                                  |
| ------------------------------------------------------ | ----------------------------------------------------------------------- |
| `src/cron/service/timer.regression.test.ts`            | Add explicit abort, post-release cleanup, and durable-state invariants. |
| `plans/checkpoints/quick-vale-3780.red-green-proof.md` | Link historical RED and record fresh GREEN.                             |
| `plans/checkpoints/quick-vale-3780.evidence.md`        | Supply exact preserved owner implementation provenance/diff.            |
| `plans/checkpoints/quick-vale-3780.checkpoint.md`      | Inventory implementation and verification evidence.                     |

Preserved evidence must include `src/cron/types.ts`, `src/cron/service/state.ts`, `src/cron/service/timer.ts`, `src/cron/service/agent-watchdog.ts`, `src/cron/service/execution-errors.ts`, `src/cron/isolated-agent/run.ts`, `src/cron/isolated-agent/run.test-harness.ts`, `src/cron/isolated-agent/run.preparation-cancellation.test.ts`, `src/cron/service/timer.regression.test.ts`, `src/gateway/server-cron.ts`, and `src/gateway/server-cron.test.ts`.

## TDD

Implement the evidence cycle with `skill:tdd`. Reuse the captured historical RED; do not attempt a synthetic post-implementation failure.

**Test file:** `src/cron/service/timer.regression.test.ts`  
**Run command:** `pnpm test src/cron/isolated-agent/run.preparation-cancellation.test.ts src/cron/service/timer.regression.test.ts -- --reporter=verbose`  
**Edit location:** existing `records one staged timeout when deferred setup resolves late` case.

Historical executable RED assertions, captured before the preserved implementation:

```ts
import { describe, expect, it, vi } from "vitest";

expect(finishedBeforeRelease[0]?.diagnostics?.summary).toMatch(/stage: workspace.*elapsed: 17ms/i); // RED: parent output lacked retained stage diagnostics.
expect(runWithModelFallbackMock).not.toHaveBeenCalled();
// RED: parent output showed one late model dispatch.
```

Follow-up assertion shape:

```ts
abortSignal?.addEventListener("abort", () => (abortObserved = true), { once: true });
const terminalBeforeRelease = structuredClone(requireJob(state, cronJob.id).state);

release.resolve();
await detachedSettled.promise;
const persisted = await loadCronStore(store.storePath);

expect(abortObserved).toBe(true);
expect(modelDispatch).not.toHaveBeenCalled();
expect(cleanupTimedOutAgentRun).toHaveBeenCalledOnce();
expect(events.filter((event) => event.action === "finished")).toHaveLength(1);
expect(requireJob(state, cronJob.id).state).toMatchObject(terminalBeforeRelease);
expect(persisted.jobs.find((job) => job.id === cronJob.id)?.state).toMatchObject(
  terminalBeforeRelease,
);
```

| Test                     | Historical RED                               | Fresh GREEN                                                     |
| ------------------------ | -------------------------------------------- | --------------------------------------------------------------- |
| Preparation cancellation | Late workspace release dispatched the model. | Release observes abort and never dispatches.                    |
| Setup diagnostics        | Timeout omitted stage/elapsed evidence.      | Timeout retains bounded stage evidence.                         |
| Late terminal ownership  | Not covered by historical RED.               | One cleanup/event and unchanged durable state after settlement. |

## Verification

1. Run the focused TDD command above.
2. Run `pnpm test src/gateway/server-cron.test.ts src/cron/isolated-agent/run.meta-error-status.test.ts src/cron/isolated-agent/run.skill-filter.test.ts -- --reporter=verbose`.
3. Run `pnpm changed:lanes --json`, then the applicable narrow `pnpm check:changed` lane; move broad proof to Testbox.
4. Run `pnpm build`, `git diff --check`, and `git diff --numstat`.
5. Verify the evidence artifact contains exact preserved implementation material for every inventoried owner file before acceptance handoff.

---

_Created: 2026-09-09_
