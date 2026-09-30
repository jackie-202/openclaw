# Plan 2026-09-14: Prevent Long Cron Jobs From Starving Independent Recurring Jobs

_Status: DRAFT_
_Created: 2026-09-14_

## Progress

- [x] Phase 0: Initialize registered plan path
- [x] Phase 1: Research scheduling and tests
- [x] Phase 2: Load relevant learnings
- [x] Phase 3: Finalize implementation plan

## Analysis

### Codebase Context

- `src/cron/service/timer.ts`: `onTimer` reserves every initially due job, starts bounded workers, waits at the `Promise.all` barrier, then commits all results and re-arms. `runningAtMs` currently means both queued/admitted and executing, while `isRunnableJob` excludes any marked job.
- `src/cron/service/timer.ts`: `applyOutcomeToStoredJob` is the canonical outcome path for active-marker clearing, task-ledger completion, state transition, terminal event, one-shot removal, and persisted scheduling.
- `src/cron/service/timer.regression.test.ts`: existing deterministic `createDeferred`/fake-timer fixture coverage includes concurrency, timeout, retry/backoff, missing-job handling, and per-job run timing.
- `src/cron/service/timer.test.ts`: actual timer-owner tests prove persisted terminal state and task-ledger status.
- `src/cron/active-jobs-manual-run.test.ts` and `src/cron/service/ops.ts`: manual runs own the same active-job invariant and must remain mutually exclusive with scheduled runs.

### Documentation

- `docs/reference/test.md`: source checkout validation uses targeted `pnpm test <path-or-filter>` first, then `pnpm test:changed` and `pnpm check:changed` as justified; no live scheduler proof is needed or allowed.

### Knowledge Base

- Recall used the local fallback (`openclaw-fork-learnings` collection missing). The returned cron-relevant checklist requires auditing terminal outcome fields, durable state, retry/backoff/disable policy, task history, events, alerts, and delivery projections rather than asserting only the runner result.
- Admission must be bounded and owned by the existing scheduler. The relevant learning requires proving the previously blocked work enters its canonical owner while the original operation remains active; a test that releases the slow job first would not demonstrate starvation is fixed.
- Existing runtime ownership and compatibility paths must remain intact: use `applyOutcomeToStoredJob` for scheduled results and retain `prepareManualRun`'s persistent `runningAtMs` reservation/active-job behavior rather than creating a competing execution path.

## Available Skills

- `tdd`: capture RED/GREEN evidence for the deterministic regression tests.
- `openclaw-testing`: select the narrow Vitest and changed-gate commands.
- `autoreview`: mandatory fresh closeout review before a future code commit.
- `save-learning`: record the scheduler ownership/concurrency learning after planning.

## Solution

Refactor `onTimer` from a whole-tick batch barrier into a short admission pass plus independently settling scheduled runs. Reserve and persist only jobs that can execute under `cron.maxConcurrentRuns`; keep each admitted job's `runningAtMs` and active-job marker until its own terminal outcome is committed. Each completion must reuse the existing locked outcome/persistence path, then request another normal timer admission so jobs that become due after the first scan are considered while unrelated slow work remains active.

Do not use the former `state.running` tick-wide barrier as execution ownership. If mutable service state needs a scheduled-run count/set, keep it private to `CronServiceState`, update it atomically with admission/finalization, and use it solely to calculate remaining scheduler capacity. Do not add timers per job, a separate queue/service, config, or changed timeout/concurrency defaults.

## Implementation

1. Add RED tests in `src/cron/service/timer.regression.test.ts` with the existing store fixture, injectable clock, and deferred runner promises. Keep the slow agent turn unresolved while asserting a later-due command run starts and its terminal job/task/event state persists; current code must fail because `state.running` rejects the later timer tick and the batch barrier holds the fast outcome.
2. Add deterministic regression cases for capacity saturation and release, same-job scheduled exclusion, scheduled/manual collision, stop while an admitted run remains unresolved, failure/backoff, disable during execution, and outcome persistence after a reload. Assert actual store state, active state, task-run status, and emitted terminal events where each contract applies.
3. In `src/cron/service/state.ts`, replace or narrow the tick-wide execution representation only as required to track currently executing scheduled work separately from admission waiting. Do not persist new scheduler bookkeeping or change the public service contract.
4. In `src/cron/service/timer.ts`, split the timer path into: locked load/maintenance plus capacity-limited reservation; detached execution for each admitted job; and a per-result locked finalization that reuses `applyOutcomeToStoredJob`, maintenance recomputation, `persist`, and `armTimer`. Finalization must release capacity/active ownership exactly once even when the job was disabled, removed, fails, or times out.
5. On every admission and finalization, force-reload under the existing lock before mutating stored jobs. Preserve `runningAtMs` as the persisted same-job reservation while executing, leave capacity-waiting jobs unmarked and due, and never advance an overdue schedule without executing it.
6. Update `src/cron/service.rearm-timer-when-running.test.ts` for the new non-blocking timer contract: a tick returns after admission and remains armed for the next due/capacity change, while the unresolved run keeps its own job marker and completion cleanup. Retain the anti-hot-loop behavior for persisted stale markers.
7. Run the focused RED command before production edits, implement the minimum owner-boundary refactor, then rerun the same command for GREEN. Run the existing cron timer, service-ops/manual, watchdog/timeout, and command tests named below, followed by changed-scope Vitest and changed checks. Do not perform live execution, gateway restart, configuration changes, or deployment.
8. Before a future commit, run fresh `skill:autoreview`; record the exact RED/GREEN commands and outcomes, distinguish source proof from deployment, and provide only safe host inspection guidance (observe persisted job/task timestamps and confirm the deployed runtime contains the build), not a scheduler replay/restart procedure.

## Files to Modify

| File                                                | Change                                                                                                                                                                        |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/cron/service/timer.ts`                         | Replace batch-wide completion/re-arm blocking with bounded admission and per-run finalization using existing persistence, ledger, event, cancellation, and scheduling owners. |
| `src/cron/service/state.ts`                         | Add or narrow private in-memory scheduled-execution bookkeeping only if required for capacity accounting across timer passes.                                                 |
| `src/cron/service/timer.regression.test.ts`         | Add RED/GREEN deterministic starvation, prompt visibility, capacity, collision, cancellation, failure, disable, and persistence regressions.                                  |
| `src/cron/service.rearm-timer-when-running.test.ts` | Align timer-owner assertions with independently executing scheduled runs and continued timer admission.                                                                       |

No docs change is planned: the documented scheduler contract remains a persisted Gateway scheduler; this is an internal liveness repair.

## TDD

Implement the TDD cycle with `skill:tdd`.

**Test file:** `src/cron/service/timer.regression.test.ts`

**Run command:** `pnpm test src/cron/service/timer.regression.test.ts -- --reporter=verbose`

**Edit location:** append to `describe("cron service timer regressions")`, reusing its existing `createDeferred`, `createDueIsolatedJob`, `saveCronStore`, `loadCronStore`, `createCronServiceState`, and `onTimer` imports.

```ts
it("admits a later-due command and persists its result while another cron run remains active", async () => {
  const store = timerRegressionFixtures.makeStorePath();
  const startedAt = Date.parse("2026-09-14T14:02:00.000Z");
  const slow = createDueIsolatedJob({ id: "slow", nowMs: startedAt, nextRunAtMs: startedAt });
  const fast = {
    ...createDueIsolatedJob({
      id: "fast-command",
      nowMs: startedAt,
      nextRunAtMs: startedAt + 60_000,
    }),
    payload: { kind: "command" as const, argv: ["echo", "fast"] },
  };
  await saveCronStore(store.storePath, { version: 1, jobs: [slow, fast] });
  let now = startedAt;
  const slowRun = createDeferred<{ status: "ok"; summary: string }>();
  const runCommandJob = vi.fn(async () => ({ status: "ok" as const, summary: "fast" }));
  const state = createCronServiceState({
    cronEnabled: true,
    storePath: store.storePath,
    cronConfig: { maxConcurrentRuns: 2 },
    log: noopLogger,
    nowMs: () => now,
    enqueueSystemEvent: vi.fn(),
    requestHeartbeat: vi.fn(),
    runIsolatedAgentJob: vi.fn(async () => await slowRun.promise),
    runCommandJob,
  });

  void onTimer(state);
  await vi.waitFor(() =>
    expect(state.store?.jobs.find((job) => job.id === slow.id)?.state.runningAtMs).toBe(startedAt),
  );
  now += 60_000;
  await onTimer(state);

  // RED before the refactor: state.running returns early, so this call stays at zero.
  expect(runCommandJob).toHaveBeenCalledTimes(1);
  expect(
    (await loadCronStore(store.storePath)).jobs.find((job) => job.id === fast.id)?.state.lastStatus,
  ).toBe("ok");

  slowRun.resolve({ status: "ok", summary: "slow" });
});
```

| Test                                                                       | RED before implementation                                                                                          | GREEN after implementation                                                                                                        |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| Later-due fast command while slow agent turn remains unresolved            | `runCommandJob` stays uncalled because `onTimer` returns on `state.running`; its persisted `lastStatus` is absent. | The command is admitted under spare capacity, emits/completes through the normal owner, and persists `ok` before slow resolution. |
| Initial fast command result while slow agent turn remains unresolved       | The `Promise.all` barrier leaves the fast job running in storage and task ledger until slow resolves.              | The fast terminal state, task-run completion, and finished event appear immediately; slow stays running.                          |
| Capacity saturation then release                                           | A later due job is either prematurely marked running or cannot be admitted after one slow slot frees.              | Only configured capacity is executing; waiting job has no `runningAtMs`, then starts once capacity frees.                         |
| Same-job scheduled/manual collision                                        | A second trigger can start or emit a duplicate terminal event.                                                     | Persisted reservation/active guard returns `already-running`; one terminal event and task completion occur.                       |
| Timeout/cancellation, failure/backoff, disable/removal, reload persistence | Per-run cleanup can strand a marker, lose an outcome, or overwrite disable/backoff state.                          | Existing canonical outcome/maintenance paths preserve timeout, retry, disabled, deleted, and durable-result contracts.            |

Record the command's actual failing and passing output in `plans/checkpoints/task-b06ff88b-f3b3-4ac8-8df5-30fac618b881.red-green-proof.md` during implementation.

## Dependencies

- Existing `CronService` lock/store/task-run/event/active-job owners are sufficient; no new dependency, config, timer service, or persisted schema is needed.
- Required validation after implementation: `pnpm test src/cron/service/timer.regression.test.ts -- --reporter=verbose`, targeted timer/service/manual/timeout/command files, `pnpm test:changed`, and `pnpm check:changed` in a normal source checkout.
- Runtime artifact deployment is explicitly out of scope. A future host check may inspect timestamps/status after the normal release process, but source GREEN does not prove the installed `dist` has changed.
