---
title: Fix GPT-6 Astra thinking effort propagation
kind: implementation
---

# Fix GPT-6 Astra thinking effort propagation

## Problem

Discord channel `1494790764134273195` is configured for `openai/gpt-6-astra` with `thinkingLevel=high`, and the model catalog defines a complete `thinkingLevelMap` (`off/minimal -> low`, `high -> high`, `xhigh -> xhigh`, `max -> max`). A direct provider probe succeeds. However, every embedded-agent request sends `reasoning_effort: none`; Astra rejects it with HTTP 400:

`Unsupported value: 'none' is not supported with the 'gpt-6-astra' model. Supported values are: 'low', 'medium', 'high', 'xhigh', and 'max'.`

The automatic retry loop changes the internal thinking level (`minimal`, `low`, `medium`, `xhigh`, `max`) but keeps emitting `none`, so the chain exhausts without a reply.

Evidence points to the embedded OpenAI-completions runtime not propagating/mapping the selected session thinking level into the provider request. The model catalog entry itself is correct and both persistent and live session state show `high`.

## Goal

Make the embedded OpenAI-completions path send the selected provider-compatible reasoning effort for `gpt-6-astra`, honoring the model's `thinkingLevelMap`, so `high` emits `reasoning_effort: high` and retry attempts actually change the outbound effort.

## Scope boundary

Work only inside the OpenClaw fork repository. Do not inspect or change `~/.openclaw/openclaw.json`, session JSONL files, the copilot bridge, or other repositories. Do not add channel-specific hard-coding. Preserve existing behavior for other model families.

## Requirements

1. Trace the embedded-agent session/run path from `ThinkLevel` into the OpenAI-completions request options and identify why it resolves to `none` despite a live `high` setting.
2. Fix the narrowest shared seam. Honor existing model compatibility metadata (`thinkingLevelMap`, supported reasoning efforts) rather than special-casing Astra by ID.
3. Ensure retries selected by `pickFallbackThinkingLevel` result in the corresponding changed outbound reasoning effort instead of repeatedly resending `none`.
4. Add focused regression tests reproducing the embedded-agent/runtime path, not merely a direct request-builder call that already passes.
5. Preserve ordinary OpenAI model behavior, including models where thinking is legitimately off or reasoning effort must be omitted.

## Acceptance criteria

- With a reasoning-capable OpenAI-completions model whose `thinkingLevelMap.high` is `high`, embedded `thinkingLevel=high` produces outbound `reasoning_effort: high`.
- `thinkingLevelMap` is honored for `off`, `minimal`, `xhigh`, and `max` where configured.
- A model that requires non-off reasoning does not receive `none` when configured with a supported active level.
- The retry path updates the outbound payload when it changes the attempted level.
- Focused regression tests fail before the change and pass afterward.
- Run the narrow tests plus the smallest relevant broader typecheck/test gate, and record exact commands/results.
- No unrelated refactor, configuration mutation, or git operation.
