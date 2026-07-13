# Fix runtimeByChannel not applied when a new Discord channel session starts

## Observed production evidence

Channel `discord:1483471834283507863` has been durably configured as follows since at least 2026-07-10:

```json
{
  "model": "openai/gpt-5.6-sol",
  "thinkingLevel": "high",
  "reasoningLevel": "on",
  "textVerbosity": "low"
}
```

There is no same-target legacy `channels.modelByChannel` entry. Nevertheless, a fresh channel session created on 2026-07-13 (`agent:main:discord:channel:1483471834283507863`, session id `1a4f3a1f-9bdc-460b-9750-ed1c33b4eb5c`) started on `openai/gpt-5.5`; its `systemPromptReport` records provider `openai`, model `gpt-5.5`. Re-applying the channel switch patched that live session to `gpt-5.6-sol`, proving the persistent profile exists but is not used by the inbound execution model-selection path.

Code inspection points to a split implementation:

- `src/channels/model-overrides.ts` implements `resolveChannelRuntimeProfile()`.
- `src/gateway/session-utils.ts` uses it mainly to enrich session-list display rows when no live model exists.
- `src/auto-reply/reply/get-reply.ts` and `src/auto-reply/reply/dispatch-from-config.ts` choose the turn model through `resolveChannelModelOverride()` guarded by `channels.modelByChannel`; they do not use `runtimeByChannel` as the canonical model source.

Thus Mission Control now correctly exposes the conflict, but OpenClaw creates/executes the new session with the global default instead of the persistent channel runtime profile.

## Goal

Make inbound Discord channel execution honor `channels.runtimeByChannel.<provider>.<target>` for model, thinking level, reasoning level, and text verbosity, with the documented precedence:

1. explicit live/session override,
2. persistent `runtimeByChannel`,
3. legacy `modelByChannel` fallback,
4. global/default runtime.

Do not solve this only in Gateway session-list projection or Mission Control. Fix the authoritative inbound execution path.

## Required work

1. Add characterization/regression tests for a fresh Discord channel session with:
   - runtime profile model `openai/gpt-5.6-sol`, thinking `high`, reasoning `on`, verbosity `low`;
   - no legacy entry;
   - global default `openai/gpt-5.5`;
   - expected selected turn model/runtime from the profile.
2. Cover precedence explicitly:
   - live session override beats runtime profile;
   - runtime profile model beats conflicting legacy `modelByChannel`;
   - legacy remains fallback if runtime profile has no model;
   - global default remains fallback when neither channel layer supplies a model.
3. Wire the existing canonical resolver into the real inbound auto-reply/dispatch path rather than duplicating matching semantics.
4. Ensure thinking/reasoning/text verbosity are applied to a fresh channel turn while preserving explicit live/session overrides.
5. Keep heartbeat and explicit run overrides unchanged unless tests demonstrate they are part of the same precedence seam.
6. Add a focused restart/new-session regression: construct a fresh session entry with no stored model override and prove the persistent profile is selected without any `sessions.patch` call.

## Likely files

- `src/auto-reply/reply/get-reply.ts`
- `src/auto-reply/reply/dispatch-from-config.ts`
- `src/channels/model-overrides.ts` only if a shared effective-profile helper is needed
- focused tests adjacent to the inbound model/runtime selection path

Do not modify Mission Control; its display fix is already landed and correctly reported `selectionSource: live-session` plus `liveRuntimeConflict: true` before the live patch.

## Acceptance

- A new Discord channel session selects `runtimeByChannel` model/runtime without helper re-application.
- Existing explicit session override remains highest priority.
- Canonical runtime model wins over conflicting legacy config.
- Focused tests and the smallest relevant broader auto-reply/gateway suite pass.
- Record RED/GREEN evidence showing the pre-fix fresh-session fallback to global default and post-fix profile selection.
