# Prevent long cron jobs from starving independent recurring jobs

## Goal and scope

Fix scheduled cron cross-job starvation and delayed completion visibility using existing CronService owners. Repository-local source/tests/docs only. No live cron execution, configuration change, gateway restart, deployment, external messages or reading sibling repositories. Keep timeout/cancellation safety and existing explicit disabled jobs unchanged. Independent manual root, not continuation of a failed repair chain.

## Observed evidence (host, 2026-09-14 Europe/Prague)

Gateway batch-orchestrator bc2c7bfd-50ed-4e7a-8c40-023db7d16a89 has 120000ms interval; native runs last completed at 14:00:00 start, 13671ms duration, next due 14:02:00.035. hidden-script-subsystem-review a63abf7d-bba2-4c75-8579-782d54f36fef started 14:02:37.589, duration 1013398ms (~16m53s), completed about 14:19:30.987. Next scheduler group acquired at 14:19:33.500. Batch script actually started 14:21:04 and correctly released pending task at 14:21:29. Later native status still showed old completed run and runningAtMs for already executed jobs. opencode-monitor also delayed (previous start14:00:17.495, next due14:02:17.495, next actual runningAt14:19:48.645). No batch/manual task mutations performed in diagnosis.

Source src/cron/service/timer.ts marks all due jobs running before worker admission, awaits Promise.all(workers), then applies all outcomes, persists, and only finally clears state.running/arms the timer. This allows one long agentTurn to delay already-completed command result visibility and another due invocation of independent frequent jobs. Same barrier exists before command-job commit b8adc11977a and latest61fd99ed61b changed setup-progress propagation, not this barrier. Do not claim this is a recent KM batch-order regression. Runtime dist/server-cron-C4hcE74N.js also contains the barrier.

## Characterization first

Before production edits, create failing deterministic tests using existing scheduler harness, fake clock and controllable unresolved promises (no real sleep/services). With concurrency capacity available, hold a slow job open beyond multiple intervals, complete a fast recurring command, and assert its completion persists/emits promptly and next due invocation starts while the slow job remains active. Cover a fast job becoming due after initial discovery, not only jobs in initial due set. Demonstrate failure on current code in final note.

## Implementation constraints

Reuse existing scheduling, locking, active-job tracking, cancellation, persistence, run-log and task-ledger owners. Avoid a second scheduler or timer per job, new registry/service or broad rewrite. Independent work may advance only within configured concurrency. No overlapping invocation of same job (including manual/scheduled interactions), no duplicate terminal events, lost updates, skipped overdue schedules or replay/backfill of historical jobs. Preserve stop/restart recovery, fail-closed disabled jobs, retry/backoff, one-shot deletion, timeouts and delivery. Distinguish waiting-for-capacity from executing ownership where current representation needs adjustment. Do not fix by increasing concurrency, timeouts, disabling long jobs or running all jobs without bounds. New files, if needed, must use domain-qualified filenames, not generic helpers/state/utils.

## Verification and acceptance

1. RED then GREEN reproducible tests for starvation and immediate result visibility through actual timer owner.
2. Test capacity saturation then release, same-job exclusion, concurrent manual/scheduled triggering, cancellation/stop, failure/backoff, enable-disable while running, and no lost persisted outcomes; preserve existing tests.
3. Run relevant cron service/watchdog/command execution tests plus repository-required validation, recording exact commands/results. Review actual registered test runner requirements before selecting commands. Do not weaken assertions or exclude failing tests.
4. Final note maps evidence to changes, limitations and runtime deployment needs. Source success is NOT installed/deployed success. Provide safe host verification guidance without executing real scheduler/replay/restart.
