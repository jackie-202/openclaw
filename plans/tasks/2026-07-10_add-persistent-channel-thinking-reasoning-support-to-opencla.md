# Add persistent channel thinking/reasoning support to openclaw-channel-runtime.py

## Context

Einstein Mode Discord channel `1494790764134273195` should run with channel-persistent runtime settings:

- model: `openai/gpt-5.6-sol`
- thinking: `high`
- reasoning: enabled/on

The current live runtime/session patch can set model and thinking, but `openclaw-channel-runtime.py` only supports the model-related arguments. It cannot persist channel-level thinking/reasoning overrides, so status/config can fall back to showing `think: xhigh` even after the live patch has applied `high`.

Known session/runtime patch state from operator:

- `agent:main:discord:channel:1494790764134273195` patched to `openai/gpt-5.6-sol`
- `agent:main:current` patched to `openai/gpt-5.6-sol`
- thinking patch succeeded with `high` instead of `xhigh`

## Goal

Extend the local channel runtime helper so it can set persistent per-channel thinking and reasoning overrides, not just model overrides.

## Scope

1. Inspect `openclaw-channel-runtime.py` and the surrounding OpenClaw config/session runtime selection code.
2. Add CLI arguments for thinking and reasoning, using names that fit the existing script style.
   - Thinking must accept at least `high` and must not silently coerce it back to `xhigh`.
   - Reasoning should support an explicit enabled/on value and, if the config schema supports it, disabled/off too.
3. Write the persistent config/session patch through the same safe path the script already uses.
4. Preserve existing model-only behavior and backwards compatibility.
5. Add or update focused tests for the script/config patching behavior where tests already exist. If no test harness exists, add a minimal safe verification path or documented dry-run/output check.

## Acceptance criteria

- Running the helper with channel `discord:1494790764134273195`, model `openai/gpt-5.6-sol`, thinking `high`, and reasoning on persists those values at channel level.
- Existing model-only invocation still works.
- A status check in the Einstein channel should no longer rely on `xhigh` config fallback once persistent channel runtime is applied.
- Verification evidence includes the exact command(s) run and the resulting relevant config/session/runtime values.

## Constraints

- Do not edit unrelated OpenClaw behavior.
- Do not change the default model or global thinking setting.
- Do not reset unrelated session overrides.
- Do not include git commit/push/PR instructions.
