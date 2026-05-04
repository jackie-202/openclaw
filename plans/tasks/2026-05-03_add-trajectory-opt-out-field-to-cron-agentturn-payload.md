# Add `trajectory` opt-out field to cron AgentTurn payload

## Goal

Allow disabling per-event trajectory recording for individual cron jobs via a new `trajectory: boolean` field in the cron job's `agentTurn` payload. Default behavior unchanged (trajectory enabled). When set to `false`, the agent run skips trajectory recorder initialization entirely — eliminates per-event FS syscall chain (~6-8 ops/event) that causes event loop starvation when multiple cron agents finish concurrently.

## Background

OpenClaw fork experiences `pi-trajectory-flush` cleanup timeouts (10s budget) when 5 cron agents complete simultaneously. Per-session trajectory writers serialize correctly, but the global event loop + libuv thread pool (4 threads) saturate with hundreds of FS operations per burst. For relay-only cron jobs (wrapper script → stdout, 5-20 events total), full trajectory recording is overkill.

Full context: `~/.openclaw/workspace/knowledge/systems/cron-concurrency-tuning.md`

## Files to modify

### 1. `src/cron/types.ts` (line ~143)

Find the `AgentTurnPayload` type definition (search for `kind: "agentTurn"`). It currently has fields like `message`, `model`, `thinking`, `timeoutSeconds`, `lightContext`, etc.

Add a new optional field:

```typescript
trajectory?: boolean;  // Default true. When false, skip trajectory recorder init for this run.
```

Place it near `lightContext` for thematic grouping (both are run-level toggles).

### 2. `src/cron/isolated-agent/run.ts`

Locate where the agent run is started (around line ~452-635 — `agentPayload` is extracted, fields like `thinking`, `timeoutSeconds` are read from `input.job.payload`).

Add extraction:

```typescript
const trajectoryEnabled =
  input.job.payload.kind === "agentTurn" ? (input.job.payload.trajectory ?? true) : true;
```

Then propagate `trajectoryEnabled` to the agent runner invocation (the same call that already receives `thinking`, `timeoutSeconds`, etc.). Add `trajectoryEnabled` to the params object passed into the embedded runner.

### 3. `src/agents/pi-embedded-runner/run.ts`

Locate where `initTrajectoryRuntime` is called (search `initTrajectoryRuntime` — should be in the early setup phase of the agent run).

Wrap it with the new flag (which must be added to the params type):

```typescript
const trajectoryRecorder =
  params.trajectoryEnabled === false
    ? { enabled: false as const }
    : initTrajectoryRuntime({
        /* existing args */
      });
```

Add `trajectoryEnabled?: boolean` to the params type for this function (find it at the top of the file or in a separate types file).

The `{ enabled: false }` shape must match the existing disabled-recorder shape. Search `enabled: true` in `src/trajectory/runtime.ts` to find the type — it's `TrajectoryRuntimeRecorder` with discriminated union on `enabled`.

Important: every call site that uses the recorder (e.g. `recorder.recordEvent`, `recorder.flush`) must already handle the disabled case (`recorder.enabled === false`). Verify by grepping `recorder.enabled` and `trajectoryRecorder.enabled` in the codebase. If any call site assumes enabled, add a guard.

## Constraints

- **Default behavior MUST be unchanged.** Omitting `trajectory` field, or setting it to `true`, must produce identical behavior to current code.
- **Backwards compatible.** Existing `cron/jobs.json` entries (no `trajectory` field) must continue to work without migration.
- **Type-safe.** No `any` casts. The field must be properly typed in `AgentTurnPayload`.
- **No changes to scheduler logic** (`src/cron/service/timer.ts`) or to `run-cleanup-timeout.ts`.
- **No changes outside the 3 files listed** unless required for type propagation (e.g. params type definitions).
- **Do NOT change** the trajectory recorder internals, the queued file writer, or the FS append logic.
- **Hot-reload compatible.** The cron service already reloads `jobs.json` on changes — no extra wiring needed for hot-reload.

## DO NOT read

- `src/trajectory/runtime.ts` internals beyond finding the `TrajectoryRuntimeRecorder` type
- `src/agents/queued-file-writer.ts` (not relevant)
- `src/cron/service/timer.ts` scheduler internals
- Any test fixtures or `.test.ts` files except the ones listed in Verify section
- `node_modules/`, `dist*/`, `coverage/`

## Verify

```bash
cd ~/Projects/openclaw-fork

# 1. Type check passes
pnpm typecheck

# 2. Build succeeds
pnpm build

# 3. Existing cron tests pass
pnpm test src/cron/

# 4. Existing agent runner tests pass
pnpm test src/agents/pi-embedded-runner/run.test.ts 2>/dev/null || \
  pnpm test src/agents/pi-embedded-runner/

# 5. Trajectory tests pass
pnpm test src/trajectory/

# 6. Backwards compat: existing payload without `trajectory` field still parses
# (covered by existing cron/types tests if present)
```

All test suites listed must pass. If any pre-existing test was already failing on the current branch, document it in the plan/checkpoint and proceed — but do not introduce new failures.

## Rollback note

The change is 3 reverts (one per file). The `trajectory` field is additive in `AgentTurnPayload` (optional field), so reverting types.ts alone makes the field invisible; reverting the other two files restores behavior. Existing `jobs.json` entries with `trajectory: false` will then be ignored (no error, just unused field).

## Out of scope (DO NOT do these)

- Adding a global config field for trajectory (only per-job payload)
- Setting `trajectory: false` on any actual cron jobs in `jobs.json` (separate task — done by Michal/Jackie after verification)
- Adding env var fallback (separate concern, not requested)
- Changing `AGENT_CLEANUP_STEP_TIMEOUT_MS` (orthogonal fix, separate task)
- Touching the upstream scheduler or trajectory recorder logic
- CLI/UI for toggling the field (use `cron update` or direct `jobs.json` edit)

## Previous Plan (rejected - attempt 1)

Plan file: /Users/michal/Projects/openclaw-fork/plans/2026-05-03_warm-fork-9899_add-trajectory-opt-out-field-to-cron-agentturn-payload.md
Review feedback: The plan is only a duplicated WIP skeleton and silently omits the actual `trajectory` AgentTurn payload change, wiring, tests, and root-cause handling.
Read the previous plan, understand what was wrong, and produce a corrected plan.
