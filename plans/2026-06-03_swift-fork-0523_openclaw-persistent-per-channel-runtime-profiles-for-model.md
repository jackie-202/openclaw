# Plan 2026-06-03: OpenClaw persistent per-channel runtime profiles

Persist model/thinking/reasoning/text verbosity per channel in config and resolve them as effective runtime state, so reconstructed channel sessions do not lose `#einstein-mode` settings.

Status: ready for implementation
Task: `swift-fork-0523`
Project: `openclaw-fork`

## Problem

`channels.modelByChannel.discord.<channelId>` persists only the model. Runtime fields (`thinkingLevel`, `reasoningLevel`, and text verbosity) currently live in session state, so they can disappear when a Discord channel session is reconstructed. After reconstruction, `/status` can still show `openai/gpt-5.5` but lose `Think: xhigh` / `Reasoning: on`.

The fix must make channel runtime policy declarative config, not a watchdog or one-off mutation of `~/.openclaw/agents/*/sessions/sessions.json`.

Target channel for regression tests:

- provider: `discord`
- channel id: `1494790764134273195`
- model: `openai/gpt-5.5`
- thinkingLevel: `xhigh`
- reasoningLevel: `on`
- textVerbosity: `low`

## Proposed config shape

Add first-class support for:

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

Keep `channels.modelByChannel` as a legacy model-only alias. When both exist for the same provider/channel, `runtimeByChannel.*.*.model` wins over `modelByChannel`.

## Current seams found

### Config schema and typing

Known files:

- `src/config/zod-schema.providers.ts`
  - currently defines `ChannelModelByChannelSchema`
  - `ChannelsSchema` includes `defaults` and `modelByChannel`
  - uses `.passthrough()` for plugin channel configs
- `src/config/types.channels.ts`
  - currently has `ChannelModelByChannelConfig = Record<string, Record<string, string>>`
  - `ChannelsConfig` has `modelByChannel?: ChannelModelByChannelConfig`
- `src/config/validation.ts`
  - `allowedChannels` currently includes `defaults`, `modelByChannel`, and bundled `CHANNEL_IDS`
  - must include `runtimeByChannel` so doctor/plugin validation does not treat it as stale/unknown channel config
- `src/config/model-refs.ts`
  - currently collects `channels.modelByChannel.<provider>.<target>` refs
  - must also collect `channels.runtimeByChannel.<provider>.<target>.model`
- `src/config/schema.labels.ts`
  - currently labels `channels.modelByChannel`
  - add label for `channels.runtimeByChannel`
- `src/config/schema.help.ts`
  - currently has help text for `channels.modelByChannel`
  - add help text for `channels.runtimeByChannel`
- `src/config/schema.hints.ts`
  - currently `CHANNEL_KERNEL_HINT_PREFIXES = ["channels.defaults", "channels.modelByChannel"]`
  - add `channels.runtimeByChannel`

### Existing model override seam

Known file:

- `src/channels/model-overrides.ts`
  - existing exported function: `resolveChannelModelOverride(params)`
  - currently reads `params.cfg.channels?.modelByChannel`
  - uses provider normalization + target candidate resolution
  - helper logic already handles direct ids, parent/thread candidates, wildcard, subject/channel fallbacks

This is the best starting point for runtime profile resolution. Do not duplicate candidate matching in an unrelated module unless necessary. Either extend this module or add a sibling module beside it.

### Status/session-status seam

Known files:

- `src/agents/tools/session-status-tool.ts`
  - builds `statusSessionEntry`
  - passes `resolvedThinkLevel: statusSessionEntry.thinkingLevel`
  - passes `resolvedReasoningLevel: statusSessionEntry.reasoningLevel ?? "off"`
  - passes `model/defaultModelForCard` based on runtime/session identity
- `src/status/status-message.ts`
- `src/status/status-text.ts`
- `src/agents/openclaw-tools.session-status.test.ts`

Status currently reads persisted session entry fields. The implementation must make status use the effective resolved channel runtime profile before falling back to persisted entry/defaults.

### Session reconstruction seam to inspect

Inspect these before implementation:

- `src/gateway/session-utils.ts`
  - `loadSessionEntry(sessionKey)`
  - `loadGatewaySessionRow(...)`
  - session row construction around model/runtime fields
- gateway/channel inbound path that calls `resolveChannelModelOverride`
- session create/load tests:
  - `src/config/sessions.test.ts`
  - `src/gateway/server.sessions.create.test.ts`
  - `src/gateway/session-utils.*.test.ts`

The acceptance is effective runtime after reconstruction, not persistence repair. A reconstructed Discord channel session with no persisted `thinkingLevel`/`reasoningLevel` must still resolve `xhigh/on` from config.

## Implementation plan

### 1. Add config types and schema

Files:

- `src/config/types.channels.ts`
- `src/config/zod-schema.providers.ts`

Add types similar to:

```ts
export type ChannelRuntimeProfileConfig = {
  model?: string;
  thinkingLevel?: string;
  reasoningLevel?: string;
  textVerbosity?: string;
};

export type ChannelRuntimeByChannelConfig = Record<
  string,
  Record<string, ChannelRuntimeProfileConfig>
>;
```

Prefer existing enum/schema constants if they already exist in the config layer. If there is no shared strict enum available without causing circular imports, define minimal zod enums in `zod-schema.providers.ts`:

- thinking: `off | low | medium | high | xhigh`
- reasoning: `off | on`
- text verbosity: `low | medium | high`

Schema shape:

```ts
const ChannelRuntimeProfileSchema = z.object({
  model: z.string().trim().min(1).optional(),
  thinkingLevel: z.enum([...]).optional(),
  reasoningLevel: z.enum([...]).optional(),
  textVerbosity: z.enum([...]).optional(),
}).strict();

const ChannelRuntimeByChannelSchema = z
  .record(z.string(), z.record(z.string(), ChannelRuntimeProfileSchema))
  .optional();
```

Add to `ChannelsSchema`:

```ts
runtimeByChannel: ChannelRuntimeByChannelSchema,
```

Keep `.passthrough()` for plugin channel configs.

### 2. Add doctor/plugin validation support

Files:

- `src/config/validation.ts`
- `src/config/plugin-auto-enable.shared.ts`
- `src/plugins/channel-presence-policy.ts`
- `src/plugins/uninstall.ts`
- any tests touching shared channel keys

Changes:

- Add `runtimeByChannel` to `allowedChannels` in `validation.ts`.
- Add `runtimeByChannel` to any shared/ignored channel-key sets that currently contain `defaults` and `modelByChannel`, so plugin auto-enable/uninstall does not treat it as a plugin channel id.

Known sets from grep:

- `src/config/plugin-auto-enable.shared.ts`
- `src/plugins/channel-presence-policy.ts`
- `src/plugins/uninstall.ts`

### 3. Add model reference validation

File:

- `src/config/model-refs.ts`

Extend `collectConfiguredModelRefs()` so it collects:

```ts
channels.runtimeByChannel.<provider>.<target>.model
```

Only collect non-empty string `model` values. Validation should use the same downstream path as `channels.modelByChannel`.

Test requirements:

- valid `openai/gpt-5.5` profile model is accepted
- invalid profile model is rejected by existing model-ref validation test path

Likely test file:

- `src/config/config.model-ref-validation.test.ts`

### 4. Add docs/help/schema metadata

Files:

- `src/config/schema.labels.ts`
- `src/config/schema.help.ts`
- `src/config/schema.hints.ts`

Add:

- label for `channels.runtimeByChannel`
- help text explaining provider -> channel id -> runtime profile, and legacy relation to `modelByChannel`
- hints prefix in `CHANNEL_KERNEL_HINT_PREFIXES`

Keep wording short. Do not over-document source labels/status attribution unless implemented.

### 5. Create/extend runtime resolver

Preferred file:

- `src/channels/model-overrides.ts`

Either extend this file or create a sibling:

- `src/channels/runtime-profiles.ts`

Recommended exported function:

```ts
export type ChannelRuntimeProfileOverride = {
  channel: string;
  model?: string;
  thinkingLevel?: string;
  reasoningLevel?: string;
  textVerbosity?: string;
  matchKey?: string;
  matchSource?: ChannelMatchSource;
};

export function resolveChannelRuntimeProfile(
  params: ChannelModelOverrideParams,
): ChannelRuntimeProfileOverride | null;
```

Reuse the same provider normalization and candidate matching logic as `resolveChannelModelOverride`:

- direct channel id
- parent/thread candidates
- provider-specific session conversation fallbacks
- group/channel subject fallbacks
- wildcard `*`

Conflict rule:

- If `runtimeByChannel.<provider>.<target>.model` exists, use it.
- Else, if `modelByChannel.<provider>.<target>` exists, use that as `model`.
- Runtime fields (`thinkingLevel`, `reasoningLevel`, `textVerbosity`) only come from `runtimeByChannel`.

Return the matched profile plus `matchKey`/`matchSource` if available.

Keep existing `resolveChannelModelOverride()` working. It can internally call the new resolver and return only `{ channel, model, matchKey, matchSource }`, preserving public behavior.

### 6. Wire resolver into inbound/session runtime

Find current call sites for `resolveChannelModelOverride` and wire `resolveChannelRuntimeProfile` at the same seam.

The effective precedence must be explicit and tested:

1. agent defaults
2. legacy `channels.modelByChannel` as model-only fallback
3. `channels.runtimeByChannel.<provider>.<channelId>`
4. existing explicit persisted session override
5. per-turn/slash-command override

Important nuance:

- Do not overwrite explicit session overrides with channel profile values.
- Do not mutate `sessions.json` just to persist profile-derived values.
- Channel profile should be applied as effective runtime when constructing context/session info for the turn and status.

If existing code already has a different established order for model overrides, preserve compatibility only if necessary and document it in code/tests. But the desired rule is: explicit session override beats channel profile; slash/per-turn beats all.

### 7. Wire status/session_status to effective runtime

Files:

- `src/agents/tools/session-status-tool.ts`
- `src/status/status-message.ts`
- `src/status/status-text.ts`
- tests in `src/agents/openclaw-tools.session-status.test.ts`

Change `session_status` so `statusSessionEntry` or the parameters passed to `buildStatusText()` include profile-resolved fields when the persisted session entry lacks them.

For a Discord channel session with:

- `channel` or `lastChannel` = `discord`
- session/group id matching `1494790764134273195`
- no persisted `thinkingLevel`
- no persisted `reasoningLevel`

`session_status` must display:

- model `openai/gpt-5.5`
- think `xhigh`
- reasoning `on`
- text verbosity `low` if displayed/supported by status card

Do not fake this only in status. The same resolver must be used by actual runtime selection.

### 8. Tests / RED-GREEN order

Add RED tests first, then implement.

#### Config/schema tests

Likely files:

- `src/config/zod-schema.providers.lazy-runtime.test.ts`
- `src/config/config.plugin-validation.test.ts`
- `src/config/config.model-ref-validation.test.ts`

Required cases:

1. accepts:

```ts
channels: {
  runtimeByChannel: {
    discord: {
      "1494790764134273195": {
        model: "openai/gpt-5.5",
        thinkingLevel: "xhigh",
        reasoningLevel: "on",
        textVerbosity: "low",
      },
    },
  },
}
```

2. rejects unknown profile keys because profile object is strict.
3. rejects invalid `thinkingLevel` / `reasoningLevel` / `textVerbosity` values.
4. rejects invalid `runtimeByChannel.*.*.model` through model-ref validation.
5. doctor/plugin validation does not treat `channels.runtimeByChannel` as a stale plugin/channel key.

#### Runtime resolver tests

Likely file:

- `src/channels/model-overrides.test.ts`

Required cases:

1. `runtimeByChannel.discord.<id>.model` resolves model.
2. legacy `modelByChannel.discord.<id>` still resolves model.
3. when both exist, `runtimeByChannel.discord.<id>.model` wins.
4. `runtimeByChannel.discord.<id>` resolves `thinkingLevel=xhigh`, `reasoningLevel=on`, `textVerbosity=low`.
5. wildcard fallback works if existing model override wildcard tests cover this behavior.

#### Session reconstruction/status tests

Likely files:

- `src/agents/openclaw-tools.session-status.test.ts`
- possibly `src/gateway/session-utils.*.test.ts`

Required case:

- Build a channel session entry representing reconstructed `#einstein-mode`:
  - provider/channel = Discord
  - channel id / group id / session conversation id = `1494790764134273195`
  - model override either absent or only legacy-resolved
  - `thinkingLevel` absent
  - `reasoningLevel` absent
- Config contains `channels.runtimeByChannel.discord.1494790764134273195` with GPT-5.5/xhigh/on/low.
- `session_status` output contains effective model and `Think: xhigh` / `Reasoning: on`.

Also add a negative/precedence case:

- persisted session entry has explicit `thinkingLevel: "high"`
- channel profile has `thinkingLevel: "xhigh"`
- status/runtime remains `high`, proving explicit session override wins.

### 9. Validation commands

Run the smallest meaningful test set first:

```bash
npm test -- src/config/zod-schema.providers.lazy-runtime.test.ts
npm test -- src/config/config.model-ref-validation.test.ts
npm test -- src/channels/model-overrides.test.ts
npm test -- src/agents/openclaw-tools.session-status.test.ts
```

Then run config/doctor validation if practical:

```bash
npm test -- src/config/config.plugin-validation.test.ts
npm test -- src/config/config.schema-regressions.test.ts
openclaw doctor --non-interactive
```

If `openclaw doctor --non-interactive` is not practical inside the repo/test environment, document the exact blocker and rely on the targeted config validation tests.

### 10. Rollback / compatibility notes

- Do not remove `channels.modelByChannel`.
- Do not migrate or edit user `sessions.json`.
- Do not change slash command/per-turn override behavior.
- Do not add git operations to the implementation task.
- If status source labels are difficult, skip them; source labels are bonus only.
- Keep implementation narrow: config schema + resolver + runtime/status wiring + targeted tests.

## Files expected to change

Expected core files:

- `src/config/types.channels.ts`
- `src/config/zod-schema.providers.ts`
- `src/config/validation.ts`
- `src/config/model-refs.ts`
- `src/config/schema.labels.ts`
- `src/config/schema.help.ts`
- `src/config/schema.hints.ts`
- `src/channels/model-overrides.ts` or new `src/channels/runtime-profiles.ts`
- current inbound/session runtime call site that uses `resolveChannelModelOverride`
- `src/agents/tools/session-status-tool.ts`

Expected tests:

- `src/config/zod-schema.providers.lazy-runtime.test.ts`
- `src/config/config.model-ref-validation.test.ts`
- `src/config/config.plugin-validation.test.ts`
- `src/channels/model-overrides.test.ts`
- `src/agents/openclaw-tools.session-status.test.ts`

Potential shared-key files from grep:

- `src/config/plugin-auto-enable.shared.ts`
- `src/plugins/channel-presence-policy.ts`
- `src/plugins/uninstall.ts`

## Acceptance checklist

- [ ] `channels.runtimeByChannel` accepted by schema/doctor validation.
- [ ] Unknown keys inside a runtime profile are rejected.
- [ ] Invalid profile model is rejected through existing model-ref validation.
- [ ] Legacy `channels.modelByChannel` still works.
- [ ] `runtimeByChannel.*.*.model` wins over legacy model when both are present.
- [ ] Reconstructed Discord channel session with no persisted thinking/reasoning resolves `thinkingLevel=xhigh` and `reasoningLevel=on` from config.
- [ ] `/status` / `session_status` displays effective model/thinking/reasoning after reconstruction.
- [ ] No persistence repair/watchdog mutation of `sessions.json` is used.
- [ ] Targeted tests pass.
