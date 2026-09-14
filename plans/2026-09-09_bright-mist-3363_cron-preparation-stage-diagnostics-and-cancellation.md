# Plan 2026-09-09: Cron Preparation Stage Diagnostics and Cancellation

_Status: DRAFT_
_Created: 2026-09-09_

## Progress

- [x] Phase 0: Config + init
- [x] Phase 1: Research
- [x] Phase 2: Knowledge
- [x] Phase 3: Synthesis

## Analysis

### Codebase Context

- `src/cron/service/timer.ts:121` races detached execution against three watchdog budgets and returns the service-owned timeout result while the unresolved core promise remains alive.
- `src/cron/service/agent-watchdog.ts:58` owns setup/pre-execution/execution state, last progress metadata, timeout selection, and exactly-once timeout triggering. Setup currently receives no progress before runner entry.
- `src/cron/isolated-agent/run.ts:525` performs workspace, plugin, model, provider preflight, catalog/thinking, delivery, skills/session persistence, cleanup, and auth awaits before `onExecutionStarted` at `src/cron/isolated-agent/run.ts:1253`.
- `src/cron/isolated-agent/run-executor.ts:185` checks cancellation only immediately before provider dispatch; preparation has no cooperative checkpoints.
- `src/cron/run-diagnostics.ts:1` is the bounded/redacted persisted diagnostic owner. `src/cron/service/execution-errors.ts:18` preserves stable setup timeout text and appends optional progress context.
- Existing setup watchdog coverage at `src/cron/service/timer.regression.test.ts:1530` proves the 60-second abort and no runner metadata, but does not release delayed setup or assert late non-dispatch/exactly-one terminal persistence.
- The isolated-run mock harness at `src/cron/isolated-agent/run.test-harness.ts:43` already isolates workspace, plugins, model preflight, delivery, skills, persistence, auth, and model dispatch; expose only the deferred boundary mocks needed by a focused preparation test.
- `src/agents/embedded-agent-runner/run/attempt-stage-timing.ts:14` is runner-specific and should not be imported into cron; follow its bounded stable-stage/elapsed pattern locally without crossing owner boundaries.

### Relevant Documentation

- `docs/automation/cron-jobs.md:54` documents separate setup, pre-model, and execution timeout behavior plus guarded cleanup.
- `docs/cli/cron.md:120` promises phase-specific pre-model timeout diagnostics. No public option or timeout value changes are required.
- No PlantUML diagrams cover this path.

### Knowledge Base

- `learnings/architecture/2026-08-09_command-failure-contracts-require-projection-and-policy-audits.md`: trace `error`, diagnostics, durable state, alerts, and policy separately; bounded text alone is not redaction proof.
- `learnings/architecture/2026-08-09_cron-failure-markers-require-dual-path-compatibility-audits.md`: preserve timeout classification while checking every persisted/external diagnostic projection.
- `learnings/architecture/2026-08-09_inbound-claim-compatibility-needs-caller-and-terminal-state-proof.md`: test caller ordering and terminal cleanup explicitly, not only the new callback/helper.
- Recall used local fallback because QMD collection `openclaw-fork-learnings` was absent; unrelated returned learnings were reviewed and excluded.

## Available Skills

- `tdd`: implement the preparation/watchdog regressions RED-first and retain RED/GREEN proof.
- `openclaw-testing`: choose focused cron tests plus changed-surface lint/type lanes.
- `autoreview`: mandatory fresh pre-handoff review after implementation.
- `save-learning`: record reusable planning/tooling knowledge after this plan is finalized.

## Implementation

1. Run the existing setup/pre-execution watchdog cases in `src/cron/service/timer.regression.test.ts:1530` unchanged and record that setup times out at 60 seconds, delayed release is untested, and no executor-dispatch assertion exists.
2. Extend `src/cron/types.ts` with a closed `CronAgentSetupStage` union and bounded progress payload containing only `jobId`, optional run/session identifier, stage, and non-negative elapsed milliseconds; add an internal `onSetupProgress` callback to the detached-run contract in `src/cron/service/state.ts` and `src/cron/service/timer.ts`.
3. In `src/cron/isolated-agent/run.ts`, create one setup start timestamp and report stable stage transitions immediately before the meaningful awaits for workspace/bootstrap, runtime plugins, model selection/provider preflight/catalog, delivery resolution, external-content preparation, skills snapshot/persistence, pre-run persistence/retired-session cleanup, and auth-profile resolution. Never include prompts, model credentials, auth details, paths, or arbitrary error text.
4. Pass the existing abort signal into preparation and check it before setup starts and immediately after each reported await. Return the canonical timeout error without starting the next stage; after successful preparation, check once more before loading/calling `executeCronRun` so a late release cannot dispatch a model.
5. Keep disposal under the existing run owner: if cancellation occurs after a full context exists, run `disposeCronRunContext` once; do not add promise cancellation claims, duplicate terminal lifecycle emission, or fallback cleanup paths for an await that has not settled.
6. Update `src/cron/service/agent-watchdog.ts` to retain the latest setup progress while still in `waiting_for_runner`; ignore late progress after timeout/disposal and leave setup, pre-execution, and execution timers unchanged.
7. Update `src/cron/service/execution-errors.ts` so the stable setup-timeout prefix/classification remains unchanged and optional suffix text reports only the closed stage and elapsed milliseconds. Build the persisted timeout diagnostic through the existing `createCronRunDiagnosticsFromError("cron-setup", ...)` path.
8. Extend `src/cron/service/timer.regression.test.ts` with a deferred setup that crosses 60 seconds, reports a stage, times out once, then releases. Assert one `finished` error event, retained redacted stage/elapsed diagnostics, one cleanup call, and no late state/event rewrite.
9. Add `src/cron/isolated-agent/run.preparation-cancellation.test.ts` and minimally export required mocks from `src/cron/isolated-agent/run.test-harness.ts`. Assert abort during a deferred preparation await stops subsequent stages and `runWithModelFallbackMock`, while a normal setup reports ordered bounded stages and dispatches once.
10. Leave timeout constants, model/fallback selection, queueing, delivery, auth/plugin configuration, and public docs unchanged; describe the remaining non-interruptible-await uncertainty in the implementation handoff.

## Files to Modify

| File                                                           | Change                                                                                      |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `src/cron/types.ts`                                            | Add closed setup-stage progress types.                                                      |
| `src/cron/service/state.ts`                                    | Carry setup progress through the internal isolated-run dependency contract.                 |
| `src/cron/service/timer.ts`                                    | Forward progress to the watchdog and preserve one service-owned terminal timeout.           |
| `src/cron/service/agent-watchdog.ts`                           | Retain latest setup stage/timing without changing watchdog budgets.                         |
| `src/cron/service/execution-errors.ts`                         | Append bounded stage/elapsed context to the existing setup timeout text.                    |
| `src/cron/isolated-agent/run.ts`                               | Instrument awaited preparation boundaries and add cooperative abort checkpoints.            |
| `src/cron/isolated-agent/run.test-harness.ts`                  | Export only mocks needed to defer preparation boundaries.                                   |
| `src/cron/isolated-agent/run.preparation-cancellation.test.ts` | Add focused preparation cancellation/success regressions.                                   |
| `src/cron/service/timer.regression.test.ts`                    | Cover watchdog timeout, late release, diagnostics, cleanup, and terminal-event cardinality. |

## TDD

Implement the RED/GREEN cycle with `skill:tdd`; record evidence in `plans/checkpoints/bright-mist-3363.red-green-proof.md`.

**Test files:** `src/cron/isolated-agent/run.preparation-cancellation.test.ts`, `src/cron/service/timer.regression.test.ts`

**RED command:** `pnpm test src/cron/isolated-agent/run.preparation-cancellation.test.ts src/cron/service/timer.regression.test.ts -- --reporter=verbose`

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  ensureAgentWorkspaceMock,
  loadRunCronIsolatedAgentTurn,
  resetRunCronIsolatedAgentTurnHarness,
  runWithModelFallbackMock,
} from "./run.test-harness.js";

const runCronIsolatedAgentTurn = await loadRunCronIsolatedAgentTurn();
const makeParams = (overrides: Record<string, unknown> = {}) => ({
  cfg: {},
  deps: {} as never,
  job: {
    id: "cron-preparation-cancel",
    name: "Preparation Cancel",
    enabled: true,
    createdAtMs: 0,
    updatedAtMs: 0,
    schedule: { kind: "cron" as const, expr: "0 * * * *", tz: "UTC" },
    sessionTarget: "isolated" as const,
    state: {},
    wakeMode: "next-heartbeat" as const,
    payload: { kind: "agentTurn" as const, message: "run task" },
  },
  message: "run task",
  sessionKey: "cron:preparation-cancel",
  ...overrides,
});

describe("isolated cron preparation cancellation", () => {
  beforeEach(() => resetRunCronIsolatedAgentTurnHarness());

  it("does not dispatch after a cancelled preparation await is released", async () => {
    const workspace = Promise.withResolvers<{ dir: string }>();
    const abort = new AbortController();
    ensureAgentWorkspaceMock.mockReturnValueOnce(workspace.promise);
    const run = runCronIsolatedAgentTurn(makeParams({ abortSignal: abort.signal }));
    await vi.waitFor(() => expect(ensureAgentWorkspaceMock).toHaveBeenCalledOnce());
    abort.abort("cron: isolated agent setup timed out before runner start");
    workspace.resolve({ dir: "/tmp/workspace" });
    await expect(run).resolves.toMatchObject({ status: "error" });
    expect(runWithModelFallbackMock).not.toHaveBeenCalled(); // RED: setup currently continues.
  });

  it("reports bounded ordered stages during successful preparation", async () => {
    const progress: Array<{ stage: string; elapsedMs: number }> = [];
    await expect(
      runCronIsolatedAgentTurn(
        makeParams({ onSetupProgress: (entry: (typeof progress)[number]) => progress.push(entry) }),
      ),
    ).resolves.toMatchObject({ status: "ok" });
    expect(progress.map((entry) => entry.stage)).toEqual(
      expect.arrayContaining(["workspace", "model-selection", "skills-snapshot"]),
    ); // RED: no setup progress is emitted.
    expect(
      progress.every((entry) => Number.isInteger(entry.elapsedMs) && entry.elapsedMs >= 0),
    ).toBe(true);
    expect(runWithModelFallbackMock).toHaveBeenCalledOnce();
  });
});
```

Append this case inside the existing `describe` in `src/cron/service/timer.regression.test.ts`, reusing its imports and fixture helpers:

```ts
it("records one staged timeout when deferred setup resolves late", async () => {
  vi.useFakeTimers();
  try {
    const release = Promise.withResolvers<void>();
    const entered = Promise.withResolvers<void>();
    const events: CronEvent[] = [];
    const now = Date.parse("2026-09-09T08:10:00.000Z");
    vi.setSystemTime(now);
    const job = createIsolatedRegressionJob({
      id: "deferred-setup",
      name: "deferred setup",
      scheduledAt: now,
      schedule: { kind: "at", at: new Date(now).toISOString() },
      payload: { kind: "agentTurn", message: "work", timeoutSeconds: 120 },
      state: { nextRunAtMs: now },
    });
    const store = timerRegressionFixtures.makeStorePath();
    await saveCronStore(store.storePath, { version: 1, jobs: [job] });
    const cleanupTimedOutAgentRun = vi.fn(async () => {});
    const state = createCronServiceState({
      cronEnabled: true,
      storePath: store.storePath,
      log: noopLogger,
      nowMs: Date.now,
      enqueueSystemEvent: vi.fn(),
      requestHeartbeat: vi.fn(),
      onEvent: (event) => events.push(event),
      cleanupTimedOutAgentRun,
      runIsolatedAgentJob: vi.fn(
        async (params: {
          onSetupProgress?: (entry: {
            jobId: string;
            stage: "workspace";
            elapsedMs: number;
          }) => void;
        }) => {
          const { onSetupProgress } = params;
          onSetupProgress?.({ jobId: job.id, stage: "workspace", elapsedMs: 0 });
          entered.resolve();
          await release.promise;
          return { status: "ok" as const };
        },
      ),
    });
    const timerRun = onTimer(state);
    await entered.promise;
    await vi.advanceTimersByTimeAsync(60_100);
    await timerRun;
    release.resolve();
    await Promise.resolve();
    const finished = events.filter((event) => event.action === "finished");
    expect(finished).toHaveLength(1);
    expect(finished[0]?.diagnostics?.summary).toMatch(/stage: workspace.*elapsed/i); // RED
    expect(cleanupTimedOutAgentRun).toHaveBeenCalledOnce();
  } finally {
    vi.useRealTimers();
  }
});
```

| Test                           | RED                                                        | GREEN                                                                                                                    |
| ------------------------------ | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Cancelled deferred preparation | Model fallback executes after release.                     | Canonical error returns; later stages and model dispatch remain untouched.                                               |
| Deferred setup watchdog        | Timeout lacks stage evidence and late release is unpinned. | One terminal error retains stage/elapsed evidence; cleanup runs once; late release does not dispatch or rewrite outcome. |
| Normal preparation             | No setup progress contract exists.                         | Ordered closed stages are emitted and model dispatch occurs once.                                                        |

## Verification

1. Run the focused RED/GREEN command above without parallel Vitest processes.
2. Run `pnpm test src/cron/isolated-agent/run.meta-error-status.test.ts src/cron/isolated-agent/run.skill-filter.test.ts -- --reporter=verbose` for existing timeout/cancellation compatibility.
3. Run `pnpm changed:lanes --json`, then the relevant local narrow lint/type lanes it identifies; use `pnpm check:changed` only if the checkout remains a normal source checkout and the lane is not broad/heavy.
4. Run `git diff --check` and `git diff --numstat`; trim production growth that does not reduce ambiguity or preserve the single owner path.
5. Run fresh `skill:autoreview` until no accepted actionable findings remain.
6. Report changed preparation boundaries, exact commands/results, unchanged timeout/model/auth/delivery policy, and that in-flight foreign awaits remain cooperative rather than forcibly interruptible.
