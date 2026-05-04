---
title: "Cron trajectory opt-out runner call graph"
date: 2026-05-03
category: architecture
component: backend
tags: [cron, trajectory, embedded-runner, planning]
file_type: rules
---

# Cron trajectory opt-out planning gotchas

When planning a per-cron-job `trajectory` opt-out, verify the current embedded runner call graph instead of trusting stale task landmarks.

In this fork, the task text pointed at `src/agents/pi-embedded-runner/run.ts` and an `initTrajectoryRuntime` call with a disabled `{ enabled: false }` recorder shape. The current code actually creates trajectory runtime recorders in `src/agents/pi-embedded-runner/run/attempt.ts` through `createTrajectoryRuntimeRecorder(...)`, and the disabled/no-recorder path is represented by `null` plus optional `trajectoryRecorder?.recordEvent(...)` and `trajectoryRecorder?.flush()` calls.

The cron propagation path also crosses `src/cron/isolated-agent/run-executor.ts`, because `src/cron/isolated-agent/run.ts` prepares context but does not directly call `runEmbeddedPiAgent` at the final dispatch site.

Practical rule: for runner flags, trace `CronAgentTurnPayload` -> prepared cron context -> `executeCronRun` params -> `runEmbeddedPiAgent` params -> attempt params before writing the plan. If the recorder factory type is `TrajectoryRuntimeRecorder | null`, skip initialization by returning/assigning `null`; do not invent a disabled union shape unless the runtime type already exposes it.
