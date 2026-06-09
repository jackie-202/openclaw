# OpenClaw: persistent per-channel runtime profiles for model/thinking/reasoning

## Context

`#einstein-mode` should reliably run as `openai/gpt-5.5` with `thinkingLevel=xhigh` and `reasoningLevel=on`.

Current setup is split:

- Persistent model routing lives in `channels.modelByChannel.discord.<channelId>` in `openclaw.json`.
- Runtime thinking/reasoning live in `~/.openclaw/agents/main/sessions/sessions.json` fields (`thinkingLevel`, `reasoningLevel`).

This was verified to survive a normal gateway restart, but it failed when the Discord channel session entry was reconstructed: `modelProvider/model` were restored from `modelByChannel`, while `thinkingLevel/reasoningLevel` disappeared. `/status` then showed `Think: off` despite the channel still being routed to GPT-5.5.

Knowledge note with exact incident/procedure:
`/Users/michal/.openclaw/workspace/knowledge/systems/openclaw-session-runtime-state.md`

## Goal

Add a declarative, doctor-valid, persistent per-channel runtime profile mechanism so channel/session parameters survive session reconstruction and gateway restarts.

Recommended shape (exact naming can be adjusted if a better existing config pattern exists):

```json
{
  "channels": {
    "runtimeByChannel": {
      "discord": {
        "1494790764134273195": {
          "model": "openai/gpt-5.5",
          "thinkingLevel": "xhigh",
          "reasoningLevel": "on",
          "textVerbosity": "low"
        }
      }
    }
  }
}
```

Alternative name if it fits the codebase better: `sessionProfilesByChannel`.

## Required behavior

1. Config schema accepts the new key; `openclaw doctor --non-interactive` must pass with the new config shape.
2. On session create/load/reconstruction for a channel, OpenClaw applies runtime profile values in precedence order:
   - agent defaults
   - per-channel runtime profile
   - existing explicit session override
   - per-turn/slash-command override
3. `channels.modelByChannel` remains supported for backward compatibility.
   - Prefer either mapping `modelByChannel` internally into `runtimeByChannel.*.*.model`, or keeping it as a legacy alias with clear precedence.
4. `/status` should display the effective model/think/reasoning correctly after reconstruction.
   - Bonus: include source labels such as `channel profile` if status infrastructure already supports source attribution; not required for first slice.
5. Existing global defaults (`agents.defaults.thinkingDefault`, `agents.defaults.reasoningDefault`) must continue to work.
6. No raw mutation of user `sessions.json` as the persistence strategy. The source of truth should be config, not a watchdog repairing runtime state.

## Suggested code areas to inspect

- `src/config/zod-schema.providers.ts` / channels schema
- `src/config/types.channels.ts`
- `src/config/validation.ts` (`allowedChannels` currently includes `defaults`, `modelByChannel`, channel ids)
- `src/config/model-refs.ts` for model reference validation
- `src/config/schema.labels.ts`, `schema.help.ts`, `schema.hints.ts`
- session creation/load utilities under `src/gateway/` / `src/agents/`
- status rendering:
  - `src/status/status-message.ts`
  - `src/status/status-text.ts`
  - `src/agents/openclaw-tools.session-status.test.ts`

Relevant grep from investigation showed existing support for:

- `agents.defaults.thinkingDefault`
- `agents.defaults.reasoningDefault`
- `channels.modelByChannel`

## Acceptance

- Add tests covering config schema validation for the new per-channel runtime profile.
- Add tests covering effective runtime resolution for a Discord channel:
  - profile sets `model=openai/gpt-5.5`, `thinkingLevel=xhigh`, `reasoningLevel=on`
  - reconstructed/new session without those fields still resolves status/runtime to xhigh/on.
- Add/update doctor validation test proving the new key is not treated as stale plugin/channel config.
- Add/update model reference validation so profile `model` is validated like `modelByChannel`.
- Backward compatibility test: existing `channels.modelByChannel.discord.<id>` still works.
- Run the smallest meaningful validation:
  - targeted unit tests for config/session/status behavior
  - `openclaw doctor --non-interactive` if practical in repo context, or equivalent config validation test if doctor is too integration-heavy.

## Planning guidance for next attempt

The previous attempts failed because the generated plan was a WIP scaffold. Do **not** produce another generic research outline. Produce a concrete implementation plan that starts from the runtime resolution seam.

Recommended order:

1. **Find the runtime resolution seam first**
   - Trace how an inbound Discord channel message becomes or loads a session.
   - Identify where `modelProvider/model`, `thinkingLevel`, `reasoningLevel`, and `textVerbosity` are currently read from session state, defaults, slash overrides, and `channels.modelByChannel`.
   - Name the exact functions/files and state which one should become the single resolver or call the resolver.

2. **Design one effective runtime profile resolver**
   - Plan a small helper such as `resolveChannelRuntimeProfile(config, channel, channelId, sessionState, turnOverrides)` or the project’s equivalent naming.
   - It must return the effective model/thinking/reasoning/verbosity plus enough information for status display if easy.
   - The precedence must be explicit and testable:
     1. agent defaults
     2. legacy `channels.modelByChannel` model alias
     3. new `channels.runtimeByChannel.<provider>.<channelId>` values
     4. existing explicit persisted session overrides
     5. per-turn/slash-command overrides
   - If the codebase has an existing precedence order that differs, document why and preserve compatibility, but do not silently skip this decision.

3. **Schema before config examples**
   - Add first-class config schema/types/help/validation support for `channels.runtimeByChannel` (or a better existing-pattern name).
   - Include validation for `model` using the same model reference validation path as `channels.modelByChannel`.
   - Validate supported thinking values per model/provider compatibility where existing machinery supports it; at minimum do not accept unknown config keys.
   - `openclaw doctor --non-interactive` or the equivalent config validation test must pass with the sample config.

4. **Session reconstruction behavior is the core acceptance**
   - The fix is not to mutate `sessions.json` after the fact.
   - A reconstructed/new Discord channel session with no `thinkingLevel/reasoningLevel` fields must still resolve effective runtime from config.
   - `/status` and `session_status` must show the effective values after reconstruction.

5. **Keep backward compatibility explicit**
   - Existing `channels.modelByChannel.discord.<id> = "openai/gpt-5.5"` must continue to work.
   - Decide and test how it interacts with `runtimeByChannel` when both are present. Recommended: `runtimeByChannel.*.*.model` wins over legacy `modelByChannel`, while legacy still fills model when profile model is absent.

6. **Minimum useful plan shape**
   - Do not leave sections as `[TODO]`.
   - Include exact files/functions to inspect or modify.
   - Include RED/GREEN tests before implementation steps.
   - Include validation commands.
   - Include rollback/backward-compat notes.

A plan that only says “research config/session/status” is not acceptable. The plan must describe where the resolver is introduced, how schema validation is wired, and how reconstruction/status tests prove `#einstein-mode` keeps `openai/gpt-5.5`, `thinkingLevel=xhigh`, and `reasoningLevel=on` without relying on `sessions.json` persistence.

## Notes

Do not include git operations in the implementation task. Local tests only.

## Previous Plan (rejected - attempt 1)

Plan file: /Users/michal/Projects/openclaw-fork/plans/2026-06-03_swift-fork-0523_openclaw-persistent-per-channel-runtime-profiles-for-model.md
Review feedback: The plan is only a WIP scaffold and silently omits the key requirements for persistent per-channel model/thinking/reasoning/verbosity resolution, so alignment cannot be established.
Read the previous plan, understand what was wrong, and produce a corrected plan.

## Planning guidance addendum after rejected attempt 5

Attempt 5 failed for the same reason as attempt 4: the produced plan file was only the default WIP template:

```md
## Analysis [WIP]

### Codebase Context [TODO]

### Solution [TODO]

### Implementation [TODO]

### Files to Modify [TODO]

### TDD [TODO]
```

This is not a content disagreement. It means the planner did not convert the task into a concrete implementation plan at all. For the next attempt, do not start from an empty planning template. Start by copying the concrete skeleton below and fill/verify it against the codebase. If any file/function name differs, replace it with the actual discovered name; do not leave `[TODO]` placeholders.

### Required concrete plan skeleton for next attempt

The plan must have these sections with real content:

1. **Config schema/type slice**
   - Inspect and modify, as applicable:
     - `src/config/zod-schema.providers.ts`
     - `src/config/types.channels.ts`
     - `src/config/validation.ts`
     - `src/config/model-refs.ts`
     - `src/config/schema.labels.ts`
     - `src/config/schema.help.ts`
     - `src/config/schema.hints.ts`
   - Add/extend a first-class channel runtime profile schema, likely under `channels.runtimeByChannel`.
   - Shape to support:
     - `model?: string`
     - `thinkingLevel?: off|low|medium|high|xhigh` or existing project enum
     - `reasoningLevel?: off|on` or existing project enum
     - `textVerbosity?: low|medium|high` or existing project enum
   - Validate `model` through the same model reference validation path used by `channels.modelByChannel`.
   - Add a doctor/config validation test proving `channels.runtimeByChannel.discord.1494790764134273195` is accepted and unknown keys are not.

2. **Runtime resolver slice**
   - Inspect current session/channel runtime resolution by grepping for:
     - `modelByChannel`
     - `thinkingLevel`
     - `reasoningLevel`
     - `textVerbosity`
     - `session_status`
     - `/status`
   - Introduce or identify one helper/resolver responsible for effective channel runtime. Name it something close to `resolveChannelRuntimeProfile` only if that matches code style.
   - The resolver must take config + channel provider + channel id + session state + turn/slash overrides and return effective:
     - model/provider or model id
     - thinking level
     - reasoning level
     - text verbosity
   - Required precedence to document and test:
     1. agent defaults
     2. legacy `channels.modelByChannel` as model-only fallback
     3. `channels.runtimeByChannel.<provider>.<channelId>`
     4. existing explicit persisted session override
     5. per-turn/slash-command override
   - If the implementation must preserve an existing different order, the plan must state the exact existing order and why it is preserved.

3. **Session reconstruction slice**
   - Identify where Discord channel sessions are created/reloaded/reconstructed.
   - Plan the exact change so a reconstructed Discord session with no `thinkingLevel`/`reasoningLevel` persisted still resolves them from config at runtime.
   - Explicitly avoid repairing or mutating `sessions.json` as the persistence mechanism.

4. **Status/session-status slice**
   - Inspect:
     - `src/status/status-message.ts`
     - `src/status/status-text.ts`
     - `src/agents/openclaw-tools.session-status.test.ts`
   - Plan how `/status` and the `session_status` tool read/display the effective model/thinking/reasoning after channel profile resolution.
   - Acceptance target: reconstructed `#einstein-mode` status still shows `openai/gpt-5.5`, `thinkingLevel=xhigh`, `reasoningLevel=on`.

5. **Tests / RED-GREEN**
   The plan must include concrete tests before implementation:
   - config schema accepts `channels.runtimeByChannel.discord.1494790764134273195`
   - model reference validation rejects invalid profile model
   - backward compatibility: `channels.modelByChannel.discord.<id>` still routes model
   - conflict behavior: `runtimeByChannel.*.*.model` wins over legacy modelByChannel when both are present
   - reconstructed Discord session with missing persisted thinking/reasoning still resolves `xhigh/on`
   - `/status` or `session_status` displays effective values

6. **Validation commands**
   - Include exact smallest meaningful commands, such as targeted `npm test -- ...` / package test command found in repo.
   - Include `openclaw doctor --non-interactive` or the closest config validation test if full doctor is impractical.

### Hard fail condition for planning

If the generated plan contains any of these placeholders, it should be considered invalid without another review loop:

- `[TODO]`
- `[WIP]`
- `Phase 1: Research` without concrete file/function targets
- `Solution [TODO]`
- `Files to Modify [TODO]`

The planner should treat this task as already researched enough to produce a concrete code plan. Any additional research must be bounded and tied to the exact files/functions above.
