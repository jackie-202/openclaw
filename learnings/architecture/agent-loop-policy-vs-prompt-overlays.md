---
title: "Agent loop policy vs prompt overlays"
date: 2026-06-10
category: architecture
component: backend
tags: [agents, agent-loop, prompt-overlays, sessions-send]
file_type: checklist
---

# Promise-only turn regressions can hide below prompt overlays

When investigating plan-only or promise-only agent turns, first separate three layers:

1. Prompt guidance: confirm the base system prompt still contains the action bias and that provider overlays do not override it.
2. Low-level loop semantics: check whether the generic loop exits normally when the assistant emits final text with no tool calls.
3. Product runner policy: confirm the embedded runner has deterministic retry/blocking logic and that the affected caller actually routes through it.

In this investigation the base `execution_bias` prompt was intact and GPT-5 overlays did not override it. The embedded runner also had planning-only/reasoning-only/empty-turn retry policy wired into terminal handling with passing focused tests. The remaining risk was path coverage: callers using the lower-level `packages/agent-core` loop directly can accept promise-only text as a normal final answer unless they inject equivalent continuation policy or route through the embedded runner.

For session delivery analysis, do not conflate `sessions.send` and the model tool `sessions_send`. `sessions.send` is a gateway session message API with `timeoutMs`; `sessions_send` starts an internal `agent` run with `deliver: false` and owns A2A reply/announcement behavior separately.
