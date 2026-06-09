# OpenClaw CLI: channel runtime profiles for Discord/session model, thinking, reasoning

## Context

OpenClaw now has declarative channel runtime profiles in config:

```json5
{
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
  },
}
```

The legacy `channels.modelByChannel.<provider>.<target>` still exists for model-only overrides, but new configuration should prefer `channels.runtimeByChannel` because it keeps model + thinking + reasoning + text verbosity together.

Manual JSON edits are error-prone. We need a small, consistent CLI surface for reading and changing these profiles, especially for Discord channels like `#einstein-mode`.

Relevant existing files to inspect:

- `src/config/zod-schema.providers.ts`
- `src/config/types.channels.ts`
- `src/config/model-refs.ts`
- `src/config/schema.labels.ts`
- `src/config/schema.help.ts`
- `src/config/schema.hints.ts`
- `src/commands/configure.channels.ts`
- `src/commands/configure.channels.test.ts`
- CLI command registration / command dispatcher files near other `src/commands/*` entries
- `docs/gateway/config-channels.md`

Do not include git operations in this task. Local code edits + tests only.

## Goal

Add a first-class OpenClaw CLI command for managing `channels.runtimeByChannel` profiles.

The interface should be optimized for the common case: “pin this Discord channel/session to a model and its runtime knobs”. It must be simpler and safer than editing `openclaw.json` manually.

## Recommended CLI UX

Prefer this command family unless the existing CLI naming conventions strongly argue otherwise:

```bash
openclaw channel-runtime list
openclaw channel-runtime get discord 1494790764134273195
openclaw channel-runtime set discord 1494790764134273195 --model openai/gpt-5.5 --think xhigh --reasoning on --text low
openclaw channel-runtime unset discord 1494790764134273195 --think
openclaw channel-runtime clear discord 1494790764134273195
```

Use `channel-runtime`, not a generic `runtime`, because this is a persistent channel/transport-target config profile, not a live session patch.

### Flags and naming

Primary flags:

- `--model <provider/model-or-alias>` maps to `model`
- `--think <level>` maps to `thinkingLevel`
- `--reasoning <off|on|stream>` maps to `reasoningLevel`
- `--text <low|medium|high>` maps to `textVerbosity`

Accepted `--think` values must match the current schema:

- `off`, `minimal`, `low`, `medium`, `high`, `xhigh`, `adaptive`, `max`

Add friendly aliases if easy, but store canonical config keys:

- `--thinking` as alias for `--think`
- `--verbosity` or `--verbose` as alias for `--text`

### Subcommands

#### `list`

Show all configured runtime profiles grouped by provider and target.

Expected human output shape:

```text
discord
  1494790764134273195  model=openai/gpt-5.5  think=xhigh  reasoning=on  text=low
```

Include legacy `channels.modelByChannel` entries either under a separate “Legacy modelByChannel” section or with a clear marker, but do not silently mix them as full profiles.

#### `get <provider> <target>`

Show:

- configured `runtimeByChannel` profile, if any
- legacy `modelByChannel` value for the same provider/target, if any
- effective config-level profile after applying legacy fallback for model only

If there is an easy existing way to resolve live session state, optionally include live session override information, but do not make live-session resolution a blocker for the first implementation. The command must at least explain config-level effective values.

Expected output shape:

```text
discord:1494790764134273195

Runtime profile:
  model: openai/gpt-5.5
  think: xhigh
  reasoning: on
  text: low

Legacy modelByChannel:
  none

Effective config:
  model: openai/gpt-5.5
  think: xhigh
  reasoning: on
  text: low
```

#### `set <provider> <target> [flags]`

Create or update only the fields supplied by flags. Preserve unspecified existing fields.

Examples:

```bash
openclaw channel-runtime set discord 1494790764134273195 --model openai/gpt-5.5
openclaw channel-runtime set discord 1494790764134273195 --think xhigh --reasoning on
openclaw channel-runtime set discord 1494790764134273195 --text low
```

Rules:

- At least one field flag is required.
- Validate values through the same config validation path used by config load/doctor where practical.
- Validate model references using the same model-ref path as `channels.modelByChannel` / `channels.runtimeByChannel` already use.
- If a legacy `channels.modelByChannel.<provider>.<target>` exists and the user sets a runtime profile:
  - do not delete it by default;
  - print a warning that `runtimeByChannel.<provider>.<target>.model` wins when present;
  - if the runtime profile does not set `model`, explain that legacy model still acts as model fallback.

Optional but useful:

- `--migrate-legacy` moves existing legacy model into `runtimeByChannel.<provider>.<target>.model` and removes the legacy entry.

#### `unset <provider> <target> [field flags]`

Remove selected fields from an existing runtime profile.

Preferred flags:

- `--model`
- `--think` / `--thinking`
- `--reasoning`
- `--text` / `--verbosity`
- `--all` as alias for `clear`

If the profile becomes empty, remove the target entry entirely. If the provider map becomes empty, remove it too if that fits existing config writer style.

#### `clear <provider> <target>`

Remove the whole `channels.runtimeByChannel.<provider>.<target>` profile. Do not touch legacy `modelByChannel` unless a future explicit flag exists; if legacy remains, print a warning that model-only routing may still apply.

## Implementation guidance

1. Inspect existing command/config write patterns (`configure.channels.ts` is likely the closest starting point).
2. Implement a small command module, likely `src/commands/channel-runtime.ts`, using existing config loader/writer utilities rather than ad-hoc file edits.
3. Wire the command into the OpenClaw CLI registry.
4. Keep config mutation idempotent and minimal: only touch `channels.runtimeByChannel` and optionally legacy `channels.modelByChannel` under `--migrate-legacy`.
5. Prefer human-readable output by default. If the CLI has a standard `--json` convention, support it for `list` and `get`; otherwise do not invent a large output framework.
6. Add docs to `docs/gateway/config-channels.md` near “Channel model overrides”. Document `runtimeByChannel` as the preferred modern form and `modelByChannel` as legacy/model-only.

## Acceptance criteria

- `openclaw channel-runtime set discord 1494790764134273195 --model openai/gpt-5.5 --think xhigh --reasoning on --text low` writes/updates `channels.runtimeByChannel.discord.1494790764134273195` with the canonical keys.
- `get` and `list` display configured profiles clearly.
- `unset` removes only selected fields and cleans up empty target/provider objects.
- `clear` removes the runtime profile and warns if legacy `modelByChannel` still exists for the same target.
- Existing `channels.modelByChannel` remains backward compatible and is not silently deleted.
- Invalid `--think`, `--reasoning`, `--text`, or model values fail with a useful error and do not corrupt config.
- Tests cover:
  - setting a full profile
  - partial update preserving existing fields
  - unsetting fields and cleanup of empty profile
  - clearing profile while preserving legacy modelByChannel
  - legacy warning/effective fallback behavior
  - invalid enum values
  - command registration/help if the project has CLI help snapshot tests
- Documentation updated with examples.

## Validation commands

Run the smallest meaningful checks for this repo. Prefer targeted tests around the new command and existing config validation tests, for example:

```bash
npm test -- channel-runtime
npm test -- configure.channels
npm test -- config.model-ref-validation
```

If this repo uses a different test runner command, inspect package scripts and use the closest targeted equivalent.

If practical, run:

```bash
openclaw doctor --non-interactive
```

or an equivalent config validation test if running doctor against the local dev tree is not safe/practical.
