---
title: "Cron AgentTurn trajectory opt-out call graph"
date: 2026-05-03
category: architecture
component: backend
tags: [cron, trajectory, pi-embedded-runner, testing]
file_type: decisions
---

# Cron AgentTurn trajectory opt-out call graph

Cron `agentTurn` payload fields are not consumed directly by the embedded Pi attempt. The run-level path is:

`src/cron/types.ts` -> `src/cron/isolated-agent/run.ts` -> `src/cron/isolated-agent/run-executor.ts` -> `src/agents/pi-embedded-runner/run.ts` -> `src/agents/pi-embedded-runner/run/attempt.ts`.

For a default-on per-run toggle, resolve the default at the cron preparation boundary (`agentPayload?.trajectory ?? true`) and pass a concrete boolean through the cron executor. The embedded runner param can remain optional so non-cron callers preserve existing behavior.

The attempt layer already treats missing trajectory recorder as the disabled/no-op shape through optional chaining (`trajectoryRecorder?.recordEvent`, `trajectoryRecorder?.flush`). In this codebase the disabled recorder shape for the embedded attempt is `null`, not `{ enabled: false }`, because `createTrajectoryRuntimeRecorder` returns a recorder or `null`.

Test helper gotcha: once `createCronPromptExecutor` requires a concrete `trajectoryEnabled: boolean`, existing helpers that accept `Partial<Parameters<typeof createCronPromptExecutor>[0]>` should re-default `overrides.trajectoryEnabled ?? true` after spreading overrides. Otherwise `undefined` from the partial type makes core test typechecking fail even when no runtime test passes `undefined`.

Verification gotcha: `pnpm test src/cron/` and `pnpm test src/trajectory/` can route into a config that excludes those directories and return “No test files found”. Use concrete files or `src/cron/**/*.test.ts`; for trajectory, pass the exact files (`runtime`, `metadata`, `export`, `cleanup`) so the tests actually execute.
