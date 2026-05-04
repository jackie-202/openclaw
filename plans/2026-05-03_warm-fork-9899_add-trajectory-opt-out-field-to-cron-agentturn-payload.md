# Plan 2026-05-03: Add `trajectory` Opt-Out Field to Cron AgentTurn Payload

Add a per-cron-agent-run flag that defaults to trajectory capture enabled and skips recorder creation only when an `agentTurn` payload sets `trajectory: false`.

## Analysis

- Replace the rejected duplicated WIP skeleton with this implementation plan.
- `src/cron/types.ts` owns `CronAgentTurnPayloadFields`; add `trajectory?: boolean` near `lightContext`.
- `src/cron/isolated-agent/run.ts` prepares `agentPayload` and `timeoutMs`; derive `trajectoryEnabled = agentPayload?.trajectory ?? true` after `agentPayload` exists and include it in prepared context/executor params.
- `src/cron/isolated-agent/run-executor.ts` is the actual direct caller of `runEmbeddedPiAgent`; pass `trajectoryEnabled: params.trajectoryEnabled` in the non-CLI embedded runner path.
- `src/agents/pi-embedded-runner/run/params.ts` is the public params type for `runEmbeddedPiAgent`; add optional `trajectoryEnabled?: boolean` with default-enabled comment.
- `src/agents/pi-embedded-runner/run.ts` forwards `params.trajectoryEnabled` into `runEmbeddedAttemptWithBackend` beside `timeoutMs`, `jobId`, and bootstrap fields.
- `src/agents/pi-embedded-runner/run/types.ts` inherits from `RunEmbeddedPiAgentParams`; no separate field required unless typecheck shows omission after edits.
- `src/agents/pi-embedded-runner/run/attempt.ts` creates the recorder with `createTrajectoryRuntimeRecorder(...)`; current disabled shape is `null` because `createTrajectoryRuntimeRecorder` returns `TrajectoryRuntimeRecorder | null` and call sites use optional chaining.
- Do not edit `src/trajectory/runtime.ts` beyond type lookup; do not edit scheduler, cleanup timeout, queued writer, recorder internals, or actual cron job definitions.
- `docs/pi.md` confirms `runEmbeddedPiAgent` is the embedded runner entry point; `docs/tools/trajectory.md` confirms trajectory capture is default-on and globally disableable today.
- Learning relevant to root cause: `learnings/tooling/fork-sync-hotfix-then-rebase.md` records prior cron overload/event-loop starvation symptoms; avoid scheduler/timeout changes for this per-run mitigation.

## Available Skills

- `tdd`: use first during implementation to record RED/GREEN evidence in `plans/checkpoints/warm-fork-9899.red-green-proof.md`.
- `openclaw-testing`: use if broad or flaky OpenClaw verification needs CI/Testbox parity.
- `validate-implementation`: use after implementation if touched files expand beyond the planned propagation path.
- `save-learning`: already mandatory after this planning task; also use after implementation if new call-graph or test gotchas appear.

## Implementation

1. Add `trajectory?: boolean` to `CronAgentTurnPayloadFields` in `src/cron/types.ts` immediately after `lightContext?: boolean`.
2. In `src/cron/isolated-agent/run.ts`, compute `trajectoryEnabled` from `agentPayload?.trajectory ?? true` after `agentPayload` is assigned.
3. Extend the prepared cron context and `executeCronRun` argument object in `src/cron/isolated-agent/run.ts` with `trajectoryEnabled`.
4. Add `trajectoryEnabled: boolean` to the `executeCronRun` params type in `src/cron/isolated-agent/run-executor.ts`.
5. Pass `trajectoryEnabled: params.trajectoryEnabled` to `runEmbeddedPiAgent` in `src/cron/isolated-agent/run-executor.ts`; do not add it to CLI fallback unless that path is proven to represent cron `agentTurn` payload execution.
6. Add `trajectoryEnabled?: boolean` to `RunEmbeddedPiAgentParams` in `src/agents/pi-embedded-runner/run/params.ts` near `bootstrapContextMode`/`bootstrapContextRunKind`.
7. Forward `trajectoryEnabled: params.trajectoryEnabled` from `src/agents/pi-embedded-runner/run.ts` to `runEmbeddedAttemptWithBackend` beside other run-level toggles.
8. In `src/agents/pi-embedded-runner/run/attempt.ts`, avoid calling `createTrajectoryRuntimeRecorder` when `params.trajectoryEnabled === false`; assign `null` so existing optional `recordEvent` and `flush` calls no-op.
9. Keep omitted and `true` values on the existing path so global config/env trajectory behavior remains unchanged.
10. Grep only the touched runner files for `trajectoryRecorder?.recordEvent`, `trajectoryRecorder.recordEvent`, and `trajectoryRecorder?.flush`; add guards only if a non-optional recorder call remains on the disabled path.
11. Do not normalize or strip top-level `trajectory` in `src/cron/normalize.ts` unless implementation proves direct `payload.trajectory` is dropped; the current `coercePayload` clone should preserve `payload` fields for direct `jobs.json` edits.

## Files to Modify

| File                                                                 | Change                                                                                                                             |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `src/cron/types.ts`                                                  | Add optional `trajectory?: boolean` to `CronAgentTurnPayloadFields`.                                                               |
| `src/cron/isolated-agent/run.ts`                                     | Resolve default-enabled flag and pass it through prepared execution context.                                                       |
| `src/cron/isolated-agent/run-executor.ts`                            | Accept `trajectoryEnabled` and forward it to `runEmbeddedPiAgent`.                                                                 |
| `src/agents/pi-embedded-runner/run/params.ts`                        | Add optional `trajectoryEnabled?: boolean` param.                                                                                  |
| `src/agents/pi-embedded-runner/run.ts`                               | Forward the param to each embedded attempt.                                                                                        |
| `src/agents/pi-embedded-runner/run/attempt.ts`                       | Skip recorder factory when `trajectoryEnabled === false`; keep `null` disabled path.                                               |
| `src/cron/isolated-agent/run.cron-model-override-forwarding.test.ts` | Add cron payload forwarding/default tests.                                                                                         |
| `src/agents/pi-embedded-runner/run/attempt.test.ts`                  | Add focused recorder factory helper tests, or equivalent narrow test, to prove false skips factory and true/omitted calls factory. |

## TDD

Implementation TDD cycle per `skill:tdd`.

**Proof file:** `plans/checkpoints/warm-fork-9899.red-green-proof.md`

### Targeted Tests

**Test file:** `src/cron/isolated-agent/run.cron-model-override-forwarding.test.ts`
**Framework:** Vitest
**Run command:** `pnpm test src/cron/isolated-agent/run.cron-model-override-forwarding.test.ts`
**Edit hint:** Append inside existing `describe("runCronIsolatedAgentTurn — cron model override forwarding (#58065)", ...)`.

```typescript
it("passes cron payload trajectory=false to the embedded agent runner", async () => {
  runWithModelFallbackMock.mockImplementation(async ({ provider, model, run }) => {
    const result = await run(provider, model);
    return { result, provider, model, attempts: [] };
  });
  runEmbeddedPiAgentMock.mockResolvedValue({
    payloads: [{ text: "summary done" }],
    meta: { agentMeta: { usage: { input: 10, output: 20 } } },
  });

  await runCronIsolatedAgentTurn(
    makeParams({
      job: makeJob({
        payload: { kind: "agentTurn", message: "summarize", trajectory: false },
      }),
    }),
  );

  const embeddedCall = runEmbeddedPiAgentMock.mock.calls[0]?.[0] as
    | { trajectoryEnabled?: boolean }
    | undefined;
  expect(embeddedCall?.trajectoryEnabled).toBe(false); // RED: currently undefined
});

it("defaults omitted cron payload trajectory to enabled", async () => {
  runWithModelFallbackMock.mockImplementation(async ({ provider, model, run }) => {
    const result = await run(provider, model);
    return { result, provider, model, attempts: [] };
  });
  runEmbeddedPiAgentMock.mockResolvedValue({
    payloads: [{ text: "summary done" }],
    meta: { agentMeta: { usage: { input: 10, output: 20 } } },
  });

  await runCronIsolatedAgentTurn(makeParams());

  const embeddedCall = runEmbeddedPiAgentMock.mock.calls[0]?.[0] as
    | { trajectoryEnabled?: boolean }
    | undefined;
  expect(embeddedCall?.trajectoryEnabled).toBe(true); // RED: currently undefined
});
```

**Test file:** `src/agents/pi-embedded-runner/run/attempt.test.ts`
**Framework:** Vitest
**Run command:** `pnpm test src/agents/pi-embedded-runner/run/attempt.test.ts`
**Edit hint:** Add a tiny exported helper only if needed to avoid a full embedded attempt test; import it with existing helper imports from `./attempt.js`.

```typescript
describe("resolveAttemptTrajectoryRecorder", () => {
  it("does not call the recorder factory when trajectory is disabled for this run", () => {
    const createRecorder = vi.fn(() => ({
      enabled: true as const,
      filePath: "/tmp/trajectory.jsonl",
      recordEvent: vi.fn(),
      flush: vi.fn(async () => undefined),
    }));

    expect(
      resolveAttemptTrajectoryRecorder({ trajectoryEnabled: false, createRecorder }),
    ).toBeNull(); // RED: helper does not exist yet
    expect(createRecorder).not.toHaveBeenCalled();
  });

  it("keeps default and explicit true on the existing recorder factory path", () => {
    const recorder = {
      enabled: true as const,
      filePath: "/tmp/trajectory.jsonl",
      recordEvent: vi.fn(),
      flush: vi.fn(async () => undefined),
    };
    const createRecorder = vi.fn(() => recorder);

    expect(resolveAttemptTrajectoryRecorder({ createRecorder })).toBe(recorder);
    expect(resolveAttemptTrajectoryRecorder({ trajectoryEnabled: true, createRecorder })).toBe(
      recorder,
    );
    expect(createRecorder).toHaveBeenCalledTimes(2);
  });
});
```

| Test                                        | RED                                     | GREEN                                |
| ------------------------------------------- | --------------------------------------- | ------------------------------------ |
| Cron payload `trajectory: false` forwarding | `trajectoryEnabled` is `undefined`      | embedded runner receives `false`     |
| Cron omitted `trajectory` default           | `trajectoryEnabled` is `undefined`      | embedded runner receives `true`      |
| Attempt disabled recorder                   | helper import missing or factory called | returns `null`, factory not called   |
| Attempt default/true recorder               | helper import missing                   | factory called and recorder returned |

## Verification

- Run targeted RED tests before implementation and record failures in the proof file.
- Run targeted GREEN tests after implementation: `pnpm test src/cron/isolated-agent/run.cron-model-override-forwarding.test.ts` and `pnpm test src/agents/pi-embedded-runner/run/attempt.test.ts`.
- Run repo typecheck equivalents because `package.json` has no `typecheck` script: `pnpm tsgo:core && pnpm tsgo:core:test`.
- Run requested suites after targeted GREEN: `pnpm build`, `pnpm test src/cron/`, `pnpm test src/agents/pi-embedded-runner/`, `pnpm test src/trajectory/`.
- If broad suites fan out heavily, use Testbox per repo policy instead of continuing broad local gates.
- If any listed suite is already failing before implementation, capture the first failing command/output in the proof file and continue only after confirming the new targeted tests pass.

## Dependencies

- Existing `jobs.json` entries omit `trajectory`; `agentPayload?.trajectory ?? true` preserves behavior without migration.
- Existing recorder no-op behavior is `null` plus optional chaining; do not invent `{ enabled: false }` unless `src/trajectory/runtime.ts` changes before implementation.
- Direct `payload.trajectory` edits should survive current payload normalization because `coercePayload` clones payload records and does not strip unknown `agentTurn` fields.

---

_Status: DRAFT_
_Created: 2026-05-03_
