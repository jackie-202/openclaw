---
title: "Detached cron runs must own wakeups and persisted running markers"
date: 2026-09-30
category: architecture
component: backend
tags: [cron, admission, timers, restart-recovery]
file_type: rules
---

# Detached cron runs must own wakeups and persisted running markers

In OpenClaw's detached cron scheduler, `onTimer` releases its tick lock while admitted runs continue. That changes two implicit assumptions from synchronous ticks:

- An active job still has a past-due `nextRunAtMs`. Calling the general `nextWakeAtMs(state)` when arming the timer can re-enter the scheduler every minimum-refire interval, reload the store, and scan maintenance even when concurrency is full. When capacity is exhausted, arm the bounded recheck; otherwise exclude locally admitted IDs from wake selection. Run completion re-arms immediately.
- The persisted `runningAtMs` is needed at gateway startup to classify interrupted work. Maintenance must not clear that marker merely because it is older than `STUCK_RUN_MS` if the same process still owns the admission. A no-timeout agent run may legitimately exceed two hours. Guard stale-marker cleanup with `!state.scheduledJobIds.has(job.id)` while retaining stale-marker recovery for runs with no local admission.

Use a deferred isolated run with a fake clock to prove the scheduler still holds the admission and marker after the stale threshold; prove timer re-arm uses the bounded delay rather than merely checking that _some_ timer was scheduled. `pnpm check:test-types` can also catch omitted fields in explicitly typed cron test-state factories even if the runtime Vitest suite passes.
