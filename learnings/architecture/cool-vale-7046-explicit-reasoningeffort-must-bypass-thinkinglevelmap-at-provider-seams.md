---
title: "Explicit reasoningEffort must bypass thinkingLevelMap at provider seams"
date: 2026-07-01
category: architecture
component: backend
tags: [openai, reasoning-effort, provider-params, thinkingLevelMap]
---

OpenAI-compatible request builders were remapping explicit `reasoningEffort` values through `model.thinkingLevelMap`, so configured values like `high` could be sent as `xhigh` and `xhigh` could be sent as `high`. The fix was to treat `options.reasoningEffort` as already provider-facing and pass it unchanged to `reasoning_effort` or `reasoning.effort`. Keep `thinkingLevelMap` for default/off compatibility behavior, not for explicit outbound user/provider configuration.
