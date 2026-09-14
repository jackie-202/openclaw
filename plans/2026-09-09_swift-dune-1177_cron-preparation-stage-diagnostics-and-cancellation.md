# Plan 2026-09-09: Cron Preparation Acceptance Repair

Preserve the completed cron runtime work, add the one missing late-release assertion set, and publish complete implementation and TDD evidence.

_Status: DRAFT_
_Created: 2026-09-09_

## Progress

- [x] Phase 0: Config + Init
- [x] Phase 1: Research
- [x] Phase 2: Knowledge
- [x] Phase 3: Synthesis

## Analysis

### Codebase Context

- `src/cron/types.ts:210`, `src/cron/service/state.ts:113`, `src/cron/service/timer.ts:121`, `src/cron/service/agent-watchdog.ts:137`, and `src/cron/service/execution-errors.ts:18` already implement the closed setup-stage contract, watchdog retention, timeout projection, cleanup, and unchanged 60-second setup budget.
- `src/cron/isolated-agent/run.ts:530` already emits bounded stage data, checks cancellation after deferred preparation awaits, and checks again before `executeCronRun`; `src/cron/isolated-agent/run.preparation-cancellation.test.ts:22` proves a late workspace release cannot reach model dispatch.
- `src/cron/service/timer.regression.test.ts:1591` already proves one terminal timeout event, stage evidence, and one cleanup call, but does not assert abort observation, no late dispatch, or unchanged durable state after release.
- `src/gateway/server-cron.ts:362` and `src/gateway/server-cron.test.ts:1158` already forward setup progress through the real Gateway owner boundary.
- `plans/checkpoints/bright-mist-3363.red-green-proof.md:5` and `plans/checkpoints/bright-mist-3363.red-green-proof.md:195` contain genuine RED and GREEN for the parent implementation; the acceptance repair must link this complete artifact and capture fresh GREEN only.

### Documentation And Knowledge

- `docs/automation/cron-jobs.md:54` and `docs/cli/cron.md:120` require phase-specific timeout reporting without changing public timeout values; no docs edit is needed.
- No PlantUML diagram covers this path.
- `learnings/architecture/cron-setup-watchdog-progress-and-cancellation.md:12` requires closed/redacted progress, stable timeout classification, one terminal failure, retained stage evidence, cleanup, and no late model dispatch.
- `learnings/architecture/2026-08-02_acceptance-repair-plans-must-include-owner-implementation.md:23` requires preserving owner-side implementation and linking genuine historical RED before fresh follow-up GREEN.
- Knowledge search used local fallback because collection `openclaw-fork-learnings` was unavailable; the returned contract-gate learnings were not applicable.

## Available Skills

- `tdd`: record historical-proof provenance and fresh GREEN without fabricating RED.
- `openclaw-testing`: choose focused cron/Gateway tests and changed lanes.
- `autoreview`: perform the mandatory fresh pre-handoff review.
- `save-learning`: save the implementation-session learning as the final action.

## Implementation

1. Keep all preserved parent changes in `src/cron/types.ts`, `src/cron/service/state.ts`, `src/cron/service/timer.ts`, `src/cron/service/agent-watchdog.ts`, `src/cron/service/execution-errors.ts`, `src/cron/isolated-agent/run.ts`, `src/cron/isolated-agent/run.test-harness.ts`, `src/cron/isolated-agent/run.preparation-cancellation.test.ts`, `src/gateway/server-cron.ts`, and `src/gateway/server-cron.test.ts`; do not rewrite completed behavior.
2. Extend `src/cron/service/timer.regression.test.ts:1591` so its deferred runner receives `abortSignal`, records abort observation, and gates a `modelDispatch` spy after release. Assert one cleanup, one `finished` error, retained stage/elapsed diagnostics, and unchanged `lastStatus`, `lastError`, and `lastDiagnostics` after the detached runner settles.
3. Change production code only if the strengthened regression exposes a real contract defect; keep setup/pre-execution/execution budgets, timeout prefix/classification, provider/model selection, and cleanup ownership unchanged.
4. Use `skill:tdd` in historical-proof mode: link `plans/checkpoints/bright-mist-3363.red-green-proof.md`, run the focused command for fresh GREEN, and write exact output to `plans/checkpoints/swift-dune-1177.red-green-proof.md` without reconstructing a new RED.
5. Update `plans/checkpoints/swift-dune-1177.checkpoint.md` with the complete preserved production-file inventory, parent proof link, new regression diff, and exact verification outcomes so acceptance evaluates implementation rather than a test-only scoped excerpt.
6. Run fresh `skill:autoreview` until no accepted actionable findings remain, then invoke `skill:save-learning` last and save at least one learning.

## Files To Modify

| File                                                   | Change                                                                                                          |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `src/cron/service/timer.regression.test.ts`            | Add abort, non-dispatch, cleanup-cardinality, and durable-state assertions to the existing deferred setup test. |
| `plans/checkpoints/swift-dune-1177.red-green-proof.md` | Link genuine parent RED/GREEN and capture fresh focused GREEN.                                                  |
| `plans/checkpoints/swift-dune-1177.checkpoint.md`      | Record all preserved production surfaces and verification evidence.                                             |

Production files listed in step 1 remain part of the repaired outcome but require no edits unless the new regression fails.

## TDD

Implement the TDD evidence cycle with `skill:tdd`. Because the implementation already exists, reuse the genuine parent RED and capture fresh GREEN; do not fabricate a post-implementation RED.

**Test file:** `src/cron/service/timer.regression.test.ts`

**Focused command:** `pnpm test src/cron/isolated-agent/run.preparation-cancellation.test.ts src/cron/service/timer.regression.test.ts -- --reporter=verbose`

**Edit hint:** Extend the existing `records one staged timeout when deferred setup resolves late` case.

```ts
const modelDispatch = vi.fn();
const detachedSettled = createDeferred<void>();
let abortObserved = false;

runIsolatedAgentJob: vi.fn(async ({ abortSignal, onSetupProgress }) => {
  abortSignal?.addEventListener("abort", () => (abortObserved = true), { once: true });
  onSetupProgress?.({ jobId: cronJob.id, stage: "workspace", elapsedMs: 17 });
  entered.resolve();
  await release.promise;
  if (!abortSignal?.aborted) {
    modelDispatch();
  }
  detachedSettled.resolve();
  return { status: "ok" as const };
}),

const terminalBeforeRelease = structuredClone(requireJob(state, cronJob.id).state);
release.resolve();
await detachedSettled.promise;

expect(abortObserved).toBe(true);
expect(modelDispatch).not.toHaveBeenCalled();
expect(cleanupTimedOutAgentRun).toHaveBeenCalledOnce();
expect(events.filter((event) => event.action === "finished")).toHaveLength(1);
expect(requireJob(state, cronJob.id).state).toMatchObject({
  lastStatus: terminalBeforeRelease.lastStatus,
  lastError: terminalBeforeRelease.lastError,
  lastDiagnostics: terminalBeforeRelease.lastDiagnostics,
});
```

| Test                              | Historical RED                                                             | Fresh GREEN                                                                                                                |
| --------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Deferred preparation cancellation | Parent proof shows model fallback dispatched after late workspace release. | Existing isolated-run test blocks dispatch after release.                                                                  |
| Deferred setup watchdog           | Parent proof shows timeout text lacked stage evidence.                     | Strengthened service test retains stage evidence, aborts, cleans once, blocks dispatch, and preserves one terminal result. |

## Verification

1. Run the focused TDD command above and capture its successful output.
2. Run `pnpm test src/gateway/server-cron.test.ts src/cron/isolated-agent/run.meta-error-status.test.ts src/cron/isolated-agent/run.skill-filter.test.ts -- --reporter=verbose`.
3. Run `pnpm changed:lanes --json`, then the applicable narrow checks via `pnpm check:changed`; use Testbox if the selected lane is broad.
4. Run `pnpm build`, `git diff --check`, and `git diff --numstat`; confirm no unintended production growth.
5. Run fresh `skill:autoreview` and record unrelated pre-existing failures separately.

## Dependencies

- Preserve the dirty parent-task cron implementation and ignore unrelated approval changes.
- Use Node 22.19+ and repository `pnpm` wrappers.
- Use Homebrew Python 3.10+ for plan/provenance helpers because system `python3` is 3.9.
