---
title: "Dropped optional-arg callback type masks a crash as multiple unrelated timing failures"
date: 2026-09-30
category: test-failures
component: backend
tags: [cron, typescript, callback-contract, vitest, fake-timers]
---

# Type-widening mismatch masks a real crash instead of surfacing it

While planning a fix for uncommitted cron detached-run admission changes in
`src/cron/service/timer.ts`, found the actual root cause by comparing the
_declared TypeScript type_ of a callback parameter at each layer of a
multi-hop callback chain, not just reading the implementation.

## The pattern

- `state.ts` (the dependency injection contract,
  `CronServiceDeps.runIsolatedAgentJob.onExecutionStarted`) declared
  `(info?: CronAgentExecutionStarted) => void` — optional argument.
- `agent-watchdog.ts` (`CronAgentWatchdog.noteRunnerStarted`) correctly
  matched: `(info?: CronAgentExecutionStarted) => void`.
- But `timer.ts`'s own `executeJobCoreWithTimeout(..., options?: { onExecutionStarted?: (info: CronAgentExecutionStarted) => void })`
  dropped the `?` on `info`, i.e. declared it as **required**.
- A new call site inside `runScheduledJob` wrote
  `onExecutionStarted: (info) => { if (!info.sessionKey) ... }`, trusting the
  (wrong) local required-arg type. Every test in the suite calls
  `onExecutionStarted?.()` with **no argument** (matching the correct,
  documented contract), so `info` is `undefined` at runtime and
  `info.sessionKey` throws `TypeError: Cannot read properties of undefined`.

## Why this was worth noting

- The crash happened inside an async callback passed several layers deep
  (mock runner -> executeJobCoreWithTimeout -> executeJobCore ->
  executeDetachedCronJob -> onExecutionStarted). A stack trace alone doesn't
  make the type-contract mismatch obvious; you have to trace the type
  annotation at _each_ boundary the value crosses, because TypeScript did not
  catch it — the local (wrong) type was internally consistent with its own
  call site, it just didn't match the upstream contract it was supposed to
  implement.
- One crash like this can masquerade as several unrelated-looking test
  failures: because the crash happens synchronously inside the job's async
  body, the job's promise rejects almost immediately after admission. Any
  test relying on fake-timer advancement past a timeout window sees the job
  already finalized (as an unrelated "error") long before the timeout logic
  it meant to exercise ever runs. Symptoms looked like: timeout not firing,
  abort signal never set, admission slot released too early — none of which
  were literally true; they were downstream effects of an early crash.

## Rule of thumb

When N tests fail against one code path and the failures look logically
unrelated (timing, abort signals, state release), check first whether a
single early synchronous exception in a shared callback could explain all of
them before treating each failure as an independent bug. Trace the callback
type at every hop from the dependency-injection contract down to the
concrete call site; a `?` dropped at one hop is enough to break every caller
that relies on the documented optional-arg contract.
