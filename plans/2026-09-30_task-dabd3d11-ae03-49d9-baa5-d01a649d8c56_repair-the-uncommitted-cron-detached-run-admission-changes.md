# Plan 2026-09-30: Repair uncommitted cron detached-run admission changes

Single-bug fix: a crashing `onExecutionStarted` callback in `runScheduledJob`
(timer.ts) masquerades as 5 unrelated cron timeout/abort test failures. Fix the
one call site, re-verify the full cron suite.

_Status: DRAFT_
_Vytvořeno: 2026-09-30_

## Problem

Uncommitted refactor converts `onTimer` from "run due jobs to completion
inline" to "admit due jobs, then let each settle independently via
`runScheduledJob`". Production code + tests are written; 5 tests in
`timer.regression.test.ts` fail (one throws, others time out/hang).

## Analysis

### Root cause (confirmed by direct read, not guessed)

`src/cron/service/timer.ts:915-924`, inside `runScheduledJob`:

```ts
...(await executeJobCoreWithTimeout(state, job, {
  onExecutionStarted: (info) => {
    if (!info.sessionKey) {
      return;
    }
    const keys = state.scheduledJobSessionKeys.get(id) ?? new Set<string>();
    keys.add(info.sessionKey);
    state.scheduledJobSessionKeys.set(id, keys);
  },
})),
```

The parameter `info` is typed as required (`CronAgentExecutionStarted`), but
every layer of the actual callback contract treats it as optional:

- `state.ts:118` (`CronServiceDeps.runIsolatedAgentJob` params): `onExecutionStarted?: (info?: CronAgentExecutionStarted) => void`
- `timer.ts:1342` (`executeJobCore` options): `onExecutionStarted?: (info?: CronAgentExecutionStarted) => void`
- `timer.ts:125` (`executeJobCoreWithTimeout` options) is the ONLY place that drops the `?`: `onExecutionStarted?: (info: CronAgentExecutionStarted) => void`
- Every isolated-runner test helper calls it both ways:
  - `test/helpers/cron/service-regression-fixtures.ts:140` — `onExecutionStarted?.()` (no arg)
  - `timer.regression.test.ts:1596`, `:1836`, `:1924`, `:2032`, `:2115` — called with a real `CronAgentExecutionStarted` object

When a test's mock runner calls `onExecutionStarted?.()` with no argument,
`runScheduledJob`'s callback executes `if (!info.sessionKey)` on `info ===
undefined` and throws `TypeError: Cannot read properties of undefined
(reading 'sessionKey')`. Because the mock runner is an `async` function and
this throw happens before any `await`, the returned promise rejects almost
instantly — well before any fake-timer advancement. `corePromise` rejects,
`runScheduledJob`'s `catch` builds an immediate error result, and the
admission slot in `state.scheduledJobIds` is released in the `finally` before
the test ever advances timers.

This single crash explains all 5 failures:

1. **`suppresses isolated follow-up side effects after timeout`** — direct
   `TypeError`, asserted explicitly.
2. **`does not time out agentTurn jobs at the default 10-minute safety window`**
   — run crashes and releases its slot immediately; `scheduledJobIds` is empty
   when the test expects it still populated after advancing past the timeout.
3. **`aborts isolated runs when cron timeout fires`** — run crashes before the
   watchdog timer ever needs to fire; the abort signal is never touched
   (`aborted` stays `false`), so the assertion fails.
4. **`does not spend isolated execution timeout while waiting for the runner lane (#41783)`**
   — same: crash short-circuits the lane-wait logic under test.
5. **`outer cron timeout fires at configured timeoutSeconds, not at 1/3 (#29774)`**
   — the crashed promise rejects synchronously, but the test's `started`
   deferred (resolved via `onExecutionStarted?.()` before the crash line
   completes, per test code order) still awaits further promise chains that
   never settle the way the test expects, causing the hang/timeout.

No other divergence between admission bookkeeping (`state.scheduledJobIds`),
session-reaper protection (`activeSessionKeys` in `session-reaper.ts`), or the
watchdog/abort path in `agent-watchdog.ts` was found while tracing all 5
failures — they all bottom out at this one throw. Confirmed via direct read of
`timer.ts`, `state.ts`, `service.test-harness.ts`, and the failing tests'
exact mock bodies (not assumed).

### Kontext z codebase

| File                                                        | Role                                                                                                                                      |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `src/cron/service/timer.ts:121-194`                         | `executeJobCoreWithTimeout` — declares the too-strict `onExecutionStarted` option type; wraps watchdog + options callback at `:159-164`   |
| `src/cron/service/timer.ts:899-969`                         | `runScheduledJob` — the buggy callback at `:916-919`; admission-slot release in `finally` at `:957-968`                                   |
| `src/cron/service/state.ts:113-119`                         | Canonical optional-arg contract for `onExecutionStarted` on `runIsolatedAgentJob`                                                         |
| `src/cron/service/agent-watchdog.ts`                        | `createCronAgentWatchdog` — `noteRunnerStarted(info)` already tolerates the value it receives; not implicated                             |
| `test/helpers/cron/service-regression-fixtures.ts:134-159`  | `createAbortAwareIsolatedRunner` — calls `onExecutionStarted?.()` with no arg, proving the optional contract is intentional and exercised |
| `src/cron/service/timer.regression.test.ts:844-1066, 1476+` | The 5 failing tests plus siblings that pass a real `info` object (must keep working)                                                      |

### Knowledge base

No applicable learnings found for this narrow TS optional-arg bug; this is a
single-file, single-line type/logic mismatch, not a pattern match against
existing learnings.

## Solution

Fix only the one broken call site; do not touch admission bookkeeping,
watchdog, or session-reaper logic (they are correct per the trace above).

1. `timer.ts:125` — widen `executeJobCoreWithTimeout`'s `onExecutionStarted`
   option type to match the real contract:
   ```ts
   options?: { onExecutionStarted?: (info?: CronAgentExecutionStarted) => void },
   ```
2. `timer.ts:916` — guard the optional arg in `runScheduledJob`:
   ```ts
   onExecutionStarted: (info) => {
     if (!info?.sessionKey) {
       return;
     }
     const keys = state.scheduledJobSessionKeys.get(id) ?? new Set<string>();
     keys.add(info.sessionKey);
     state.scheduledJobSessionKeys.set(id, keys);
   },
   ```

## Implementation

### Pre-implementation checklist

- [ ] Re-read `timer.ts:899-969` immediately before editing to confirm line
      numbers have not shifted.
- [ ] Do not change `state.ts`, `ops.ts`, `session-reaper.ts` — the trace
      found no bug there; only touch if step 3 below proves otherwise.

### Steps

1. Apply the 2-line fix above (type widen + `info?.sessionKey` guard).
2. Run the single most specific failing test first (fastest signal):
   ```
   node scripts/run-vitest.mjs run --config test/vitest/vitest.cron.config.ts \
     src/cron/service/timer.regression.test.ts -t "suppresses isolated follow-up side effects after timeout" \
     --testTimeout=15000
   ```
   Expect: pass, no `TypeError`.
3. Run the full regression file:
   ```
   node scripts/run-vitest.mjs run --config test/vitest/vitest.cron.config.ts \
     src/cron/service/timer.regression.test.ts --testTimeout=15000
   ```
   Expect: `46 passed (46)`, 0 failed. If any of failures #2-#5 still fail
   after the fix, STOP and re-trace that specific test's mock body and the
   watchdog path in `agent-watchdog.ts` before making further changes — do not
   assume the single fix covers every case without this proof.
4. Run the full cron suite (catches `timer.test.ts`, `ops.regression.test.ts`,
   `session-reaper.test.ts`, the two numbered-issue test files):
   ```
   node scripts/run-vitest.mjs run --config test/vitest/vitest.cron.config.ts
   ```
   Expect: all green.
5. Run `pnpm test:changed` (per AGENTS.md, in a normal checkout) to catch any
   sibling surface touched by the uncommitted diff outside the cron directory.
6. `git diff --numstat` to confirm the fix is additive-minimal (net +0/-0 to
   +2/-2 lines beyond the already-uncommitted diff) — do not let this task
   grow the uncommitted diff's scope.

### Escape hatch

If step 3 shows failures #2-#5 not fully resolved by the 2-line fix, the next
suspects in priority order (do not jump ahead without re-running step 3
between changes):

1. `agent-watchdog.ts` `noteRunnerStarted`/`activeExecution()` — check it does
   not depend on `info` being non-nullish in a way that silently no-ops the
   watchdog arm.
2. `timer.ts:157-166` — the wrapped callback passed to `executeJobCore`; confirm
   `watchdog.noteRunnerStarted(info)` with `info === undefined` still arms
   correctly for the `deferTimeoutUntilExecutionStart` path.
3. Re-read `timeout-policy.ts` `resolveCronJobTimeoutMs` for a `timeoutSeconds`
   unit/precision bug (only if #29774 specifically still fails).

## Files to Modify

| File                        | Change                                                                                                                                                  |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/cron/service/timer.ts` | Widen `onExecutionStarted` option type in `executeJobCoreWithTimeout` (line ~125); guard `info?.sessionKey` in `runScheduledJob`'s callback (line ~916) |

## TDD: skip

This is a bug-fix repair task against an already-written, already-failing
test suite (11 uncommitted files, ~376/-153 LOC already in the tree). The
"RED" state already exists on disk with a real, reproducible failure
(verified above via direct test run); writing a new TDD skeleton would
duplicate `timer.regression.test.ts` rather than protect new behavior. The
existing 5 failing tests are the RED/GREEN proof; Implementation step 3 is the
GREEN verification.

## Dependencies

- None external. Pure in-repo fix to already-uncommitted code.
- Must land (working tree green) before the separate Deliberation plugin
  externalization slice proceeds, per task context — not part of this plan's
  scope.

---

_Vytvořeno: 2026-09-30_
_Status: DRAFT_
