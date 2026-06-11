---
title: "Planning promise-only embedded-runner fixes"
date: 2026-06-10
category: architecture
component: backend
tags: [agents, embedded-runner, planning-only, strict-agentic]
file_type: checklist
---

# Planning promise-only embedded-runner fixes

When planning a fix for OpenClaw promise-only agent turns, first inspect `resolvePlanningOnlyRetryInstruction` and the terminal retry wiring in `runEmbeddedAgent` before proposing new architecture.

The existing embedded runner already owns replay-safety gates, retry budget, planning-only continuation wording, and the strict-agentic blocked terminal state. A narrow fix should extend the planning-only text classifier in `src/agents/embedded-agent-runner/run/incomplete-turn.ts` and prove behavior through `src/agents/embedded-agent-runner/run.incomplete-turn.test.ts`.

Avoid touching channel-specific code, prompt overlays, or `packages/agent-core` unless code reading proves the affected caller bypasses the embedded runner.
