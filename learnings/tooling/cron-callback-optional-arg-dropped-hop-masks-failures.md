---
title: "Dropped optional-arg marker at one hop of a multi-layer callback masks as unrelated test failures"
date: 2026-09-30
category: tooling
component: backend
tags: [cron, typescript, callbacks, test-debugging, async]
file_type: rules
---

# Dropped `?` on one hop of a multi-layer optional callback masquerades as unrelated test failures

## Problem

A cron scheduler refactor (detached-run admission: admit due jobs, let each
settle independently) introduced a regression where 5 seemingly unrelated
tests failed: one with a direct `TypeError`, the other four with
timing/abort-signal assertions that looked like real watchdog/timeout logic
bugs (stranded admission slots, abort signal never firing, tests hanging).

## Root cause

A callback (`onExecutionStarted`) is threaded through 4 layers:

- `CronServiceDeps.runIsolatedAgentJob` params: `onExecutionStarted?: (info?: T) => void`
- `executeJobCore` options: `onExecutionStarted?: (info?: T) => void`
- `executeJobCoreWithTimeout` options: **`onExecutionStarted?: (info: T) => void`** ← the `?` on the parameter was dropped here (only this one hop)
- the call site inside `runScheduledJob` destructured `info` and did
  `if (!info.sessionKey)` assuming `info` is always defined

Every test helper that drives the isolated runner calls
`onExecutionStarted?.()` with **no argument** (this is the real, intentional
contract — some call sites pass a real object, some pass nothing). The
mismatched non-optional type at one hop didn't produce a compile error
because TypeScript happily narrows a wider declared type at the call site
without flagging the actual runtime contract violation with the narrower
consumer. The crash only manifested at runtime, and only for the no-arg call
path.

Because the crash happened synchronously inside an `async` mock function body
_before any `await`_, the returned promise rejected almost instantly — before
any fake-timer advancement (`vi.advanceTimersByTimeAsync`) had a chance to
run. This made 4 completely different assertions fail for an entirely
different apparent reason each (empty `scheduledJobIds` set, abort signal
never set to `true`, a hung promise chain) — none of which had anything to do
with the actual bug. Only the 5th test's assertion (`toThrow`-adjacent /
crash surfaced directly) pointed at the real problem.

## Lesson

When multiple test failures in the same suite show _different_ symptoms
(hang, wrong Set contents, wrong boolean) after one code change, check first
whether a single early, synchronous throw in a shared helper/callback could
be short-circuiting all of them before their real logic under test ever runs.
Don't assume each failure needs an independent root-cause investigation —
trace the actual execution path (including where async functions can reject
before their first `await`) before diagnosing 4 "different" bugs.

Concretely: when a callback type is duplicated across multiple function
signatures instead of imported/reused from one canonical declaration, grep
every hop for the exact optionality (`?`) on both the property and the
parameter — a single dropped `?` at an intermediate hop is easy to miss in
review and type-checks cleanly because nothing calls it with `undefined` in a
way the compiler can see.
