---
title: Repair the uncommitted cron detached-run admission changes in openclaw-fork
type: implementation
---

# Repair the uncommitted cron detached-run admission changes in openclaw-fork

## Goal

The `openclaw-fork` working tree carries an unfinished refactor of the cron
scheduler that converts the timer tick from "run all due jobs to completion
inside the tick" into "admit due jobs, then let each run settle independently".
The production code and its tests are already written but the change is not
green. Finish it so the cron suite passes, without reverting the intended
design.

This work is a prerequisite for the Deliberation plugin externalization slice
that follows it in this batch: the fork tree must be committable and green
before the bundled plugin copy is retired.

## Current state

Working tree (uncommitted), 11 files, ~376 insertions / ~153 deletions:

- `src/cron/service/timer.ts` (main change)
- `src/cron/service/state.ts` (adds `scheduledJobIds`, `scheduledJobSessionKeys`)
- `src/cron/service/ops.ts`
- `src/cron/session-reaper.ts` (adds `activeSessionKeys` protection)
- `src/cron/service.test-harness.ts`
- tests: `src/cron/service/timer.regression.test.ts`,
  `src/cron/service/timer.test.ts`, `src/cron/service/ops.regression.test.ts`,
  `src/cron/session-reaper.test.ts`,
  `src/cron/service.issue-66019-unresolved-next-run.test.ts`,
  `src/cron/service.rearm-timer-when-running.test.ts`

HEAD (`16a38827177`) is green for these files; the failures come only from the
uncommitted edits. Do not solve this by discarding the changes.

## Verified failures

Command:

```
cd ~/Projects/openclaw-fork
node scripts/run-vitest.mjs run --config test/vitest/vitest.cron.config.ts src/cron/service/timer.regression.test.ts --testTimeout=15000
```

Result: `Tests 5 failed | 41 passed (46)`.

1. `suppresses isolated follow-up side effects after timeout` —
   `TypeError: Cannot read properties of undefined (reading 'sessionKey')`.
   Root cause is known and concrete: `runScheduledJob` in `timer.ts` (~line 916)
   passes `onExecutionStarted: (info) => { if (!info.sessionKey) ... }`, typed as
   `(info: CronAgentExecutionStarted) => void` at `timer.ts:125`. But the
   dependency contract in `state.ts:118` declares
   `onExecutionStarted?: (info?: CronAgentExecutionStarted) => void` — the
   argument is optional, and existing tests invoke `onExecutionStarted?.()` with
   no argument. The new callback must tolerate an absent `info`.

2. `does not time out agentTurn jobs at the default 10-minute safety window` —
   expects `state.scheduledJobIds` to still contain the admitted job id after
   advancing past the default timeout; it is empty, i.e. the admission slot is
   released too early (or never recorded) for this path.

3. `aborts isolated runs when cron timeout fires` — expected the observed abort
   signal to be aborted; it is not.

4. `does not spend isolated execution timeout while waiting for the runner lane (#41783)`
   — same symptom: abort signal never fires.

5. `outer cron timeout fires at configured timeoutSeconds, not at 1/3 (#29774)`
   — the test never settles and hits the vitest timeout (it hangs at the default
   120000 ms too, so this is a real hang, not a slow test).

Failures 2-5 are plausibly all downstream of the detached-run rework: the
timeout watchdog path and the admission bookkeeping in `runScheduledJob` /
`executeJobCoreWithTimeout` no longer agree about when a run starts, when it is
released from `scheduledJobIds`, and when the abort controller fires. Confirm
the actual coupling before changing code; do not assume failure 1's fix resolves
the rest.

## Required outcome

- The intended design is preserved: `onTimer` admits up to the configured
  concurrency, records admissions in `state.scheduledJobIds`, and returns;
  each run settles via `runScheduledJob` and releases its slot in a `finally`.
- Session-reaper protection of active run session keys is preserved.
- No admission slot may be stranded on any path (success, error, timeout,
  finalization failure).
- A job must never be admitted twice.

## Verification

- `input/scenario → expected → proving test`:
  - runner calls `onExecutionStarted()` with no argument → no throw, job still
    settles with its real outcome → `suppresses isolated follow-up side effects after timeout`
  - agentTurn job past the default safety window → still admitted, not timed out
    → `does not time out agentTurn jobs at the default 10-minute safety window`
  - configured `timeoutSeconds` elapses → abort signal fires at that value, run
    finalizes as error → `outer cron timeout fires at configured timeoutSeconds (#29774)`
    and `aborts isolated runs when cron timeout fires`
  - job waiting for a busy runner lane → execution timeout is not consumed while
    waiting → `#41783`
  - preservation: concurrency cap still honoured → `honors cron maxConcurrentRuns for due jobs`

Commands, from `~/Projects/openclaw-fork`:

```
node scripts/run-vitest.mjs run --config test/vitest/vitest.cron.config.ts src/cron/service/timer.regression.test.ts --testTimeout=15000
node scripts/run-vitest.mjs run --config test/vitest/vitest.cron.config.ts
```

Both must pass. Note that the vitest wrapper kills a run that produces no output
for 120 s, so a hanging test appears as a silent termination — pass
`--testTimeout` when iterating.

## Boundaries / non-goals

- Repository-local to `~/Projects/openclaw-fork`. Do not inspect other repos or
  external config.
- Do not revert to the pre-refactor "run everything inside the tick" shape.
- Do not touch `extensions/deliberation` — that is a separate slice in this batch.
- Do not weaken or delete the failing assertions to make the suite green. If an
  assertion is genuinely wrong, the final note must explain why.
- No version-control operations.
