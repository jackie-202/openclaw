# Unit-test-only: channel runtime helper supports thinking/reasoning args without mutating live config

## Context

We need to later persist Einstein Mode channel runtime settings safely:

- Discord channel: `1494790764134273195`
- target model: `openai/gpt-5.6-sol`
- target thinking: `high`
- target reasoning: on/enabled

Earlier live patches already proved session/runtime can accept `openai/gpt-5.6-sol` and `thinking=high`, but we must not test the helper against real Gateway config from an agent run. The next step is unit-test coverage only, so humans can run the real configuration command manually later.

Current issue: `openclaw-channel-runtime.py` does not expose arguments for thinking/reasoning. It can leave persistent config/status falling back to `xhigh` even when live runtime patch used `high`.

## Goal

Add support in `openclaw-channel-runtime.py` for parsing/constructing persistent per-channel thinking and reasoning updates, but verify it only with unit tests / dry-run-style tests that do not touch real OpenClaw config or Gateway runtime.

## Scope

1. Inspect `openclaw-channel-runtime.py` and existing tests around channel runtime/profile config.
2. Add CLI arguments for thinking and reasoning in the script, following its current argument style.
3. Refactor if needed so config patch construction can be unit-tested without calling the real Gateway or modifying real config.
4. Add focused unit tests for:
   - existing model-only invocation still builds the same patch as before;
   - model + `thinking=high` builds the expected per-channel persistent patch;
   - model + reasoning on/enabled builds the expected per-channel persistent patch;
   - model + thinking + reasoning together for Discord channel `1494790764134273195` builds the intended patch;
   - invalid thinking/reasoning values are rejected clearly.
5. If a dry-run mode already exists, extend/test it. If no dry-run exists and adding one is small/local, add it; otherwise keep verification at pure unit level.

## Explicit non-goals / safety constraints

- Do NOT run the helper against the real Einstein channel.
- Do NOT mutate `~/.openclaw/openclaw.json`.
- Do NOT call Gateway config patch/apply/restart from tests or verification.
- Do NOT change global defaults.
- Do NOT reset existing session/channel overrides.
- Do NOT include git commit/push/PR instructions.

## Acceptance criteria

- Unit tests cover the new thinking/reasoning argument handling and patch construction.
- Tests prove the real Einstein target values would be represented as: channel `discord:1494790764134273195`, model `openai/gpt-5.6-sol`, thinking `high`, reasoning enabled/on.
- Existing model-only behavior is covered and unchanged.
- Verification evidence includes exact unit test command(s) and passing output.
- Final notes explicitly state that no live config was mutated.
