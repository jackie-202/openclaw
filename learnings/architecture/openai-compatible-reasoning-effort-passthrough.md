---
title: "OpenAI-compatible reasoning effort passthrough"
date: 2026-07-01
category: architecture
component: backend
tags: [openclaw, openai, reasoning-effort, providers, tests]
file_type: rules
---

# OpenAI-compatible reasoning effort passthrough

When implementing OpenAI-compatible reasoning effort support, keep `thinkingLevelMap` and `reasoningEffort` separate.

`thinkingLevelMap` is for translating OpenClaw thinking levels such as `minimal`, `high`, or `xhigh` into provider-specific values when the caller supplied a thinking level.

`reasoningEffort` is already used as a provider-facing request option in OpenAI-compatible builders and should be passed through unchanged when it is explicitly configured. In the provider builders, that means assigning `options.reasoningEffort` directly into `reasoning_effort` or nested `reasoning.effort`.

## Practical rule

For GPT-5.5 bridge-style local OpenAI-compatible providers, prefer an explicit config/runtime value such as `reasoningEffort: "high"` and assert the outbound payload contains exactly `reasoning_effort: "high"` or `reasoning: { effort: "high" }`.

Do not route explicit `reasoningEffort` through `thinkingLevelMap`; that silently turns a provider-facing value into a semantic OpenClaw thinking level and can reintroduce hidden mappings such as `xhigh -> high`.

## Useful seams

- Chat completions seam: capture payloads with `streamOpenAICompletions(..., { reasoningEffort, onPayload })` in `src/llm/providers/openai-completions.test.ts`.
- Responses seam: call `applyCommonResponsesParams` directly in `src/llm/providers/openai-responses-shared.test.ts`.
- To prove no hidden mapping, construct a test model with `thinkingLevelMap: { xhigh: "high" }` and assert configured `"xhigh"` still leaves as `"xhigh"`.
