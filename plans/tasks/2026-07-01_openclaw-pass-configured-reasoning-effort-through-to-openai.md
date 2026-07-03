# OpenClaw: pass configured reasoning effort through to OpenAI-compatible providers

## Goal

Add minimal OpenClaw support for sending the exact configured reasoning effort value to OpenAI-compatible model requests, so GPT-5.5 requests routed through the local copilot bridge receive the same value the operator configured.

This is specifically for the OpenClaw fork. The copilot bridge side is already implemented and verified: direct calls to `http://127.0.0.1:18800/v1/openai/chat/completions` with `reasoning_effort: "high"` produce bridge log evidence like:

```text
[reasoning-observability] backend=codex route=/v1/openai/chat/completions model=gpt-5.5 incoming_source=reasoning_effort incoming_effort=high outgoing_effort=high tools_count=0
-> POST chatgpt.com/backend-api/codex/responses model=gpt-5.5 clientStream=false translated=true
tools=0 tool_choice=unset reasoning=high input_items=1
```

Now OpenClaw must propagate the configured value into its outbound OpenAI-compatible payload.

## Product decision / constraint

Do **not** implement hidden mapping from OpenClaw names to model names.

We want the value in our configuration/runtime to be the exact value sent to the model/provider. If a model accepts `high`, config should say `high`. If it accepts `xhigh`, config should say `xhigh`. If that changes per model, we fix the config, not a secret translation table.

Bad:

```ts
thinkingLevel: "xhigh" -> reasoning_effort: "high"
```

Good:

```json
"reasoningEffort": "high"
```

Outbound payload contains exactly:

```json
"reasoning_effort": "high"
```

or the equivalent Responses shape if that provider adapter already uses it internally:

```json
"reasoning": { "effort": "high" }
```

The important invariant: configured effort value is passed through 1:1, not semantically remapped.

## Scope

Keep the diff intentionally tiny because this fork is regularly merged with upstream.

Change the minimum number of files needed to:

1. Add or reuse an explicit config/runtime field for provider/model reasoning effort.
2. Propagate that exact string into outbound OpenAI-compatible request payloads for models/providers that support reasoning effort.
3. Preserve existing behavior when no explicit effort is configured.
4. Add focused tests around the request builder/adapter seam only.

Prefer an existing config surface if one already exists. Schema inspection showed model config already has compatibility metadata that may be relevant:

- `models.providers.*.models[].compat.supportsReasoningEffort`
- `models.providers.*.models[].compat.supportedReasoningEfforts`
- `models.providers.*.models[].compat.reasoningEffortMap`
- `models.providers.*.models[].thinkingLevelMap`
- provider/model `params`

But the product requirement is no hidden mapping for this use case. If `reasoningEffortMap` is only for provider-specific compatibility, do not use it for the OpenClaw GPT-5.5 bridge path unless the configured value still passes through unchanged.

## Suggested implementation approach

Investigate the current OpenAI-compatible provider request construction in `~/Projects/openclaw-fork` and choose the narrowest seam.

Likely acceptable design:

- Introduce an explicit string field such as `reasoningEffort` at the narrowest existing runtime/config level that already feeds model request construction.
- If there is already a canonical field with the same semantics, reuse it instead of adding a new name.
- When building OpenAI-compatible chat/completions or responses payloads, include `reasoning_effort: <configured value>` or `reasoning: { effort: <configured value> }` only when:
  - the value is set, and
  - the target model/provider declares or otherwise already supports reasoning effort.
- Do not infer `reasoningEffort` from `thinkingLevel` unless the runtime value is already explicitly the provider-facing reasoning effort value. Avoid new conversion tables.
- Do not change Anthropic adaptive thinking behavior.
- Do not touch unrelated session/channel routing, UI, or bridge code.

If schema/config typing must be updated, keep it localized and documented with one concise field description: exact provider-facing reasoning effort value, passed through unchanged.

## Acceptance criteria

1. Minimal diff: only files directly required for config/schema/request-builder/tests are changed.
2. No hidden mapping from `thinkingLevel` to provider effort for this feature.
3. Configured effort string is passed through exactly into OpenAI-compatible request payload.
4. When effort is unset, payload remains unchanged from current behavior.
5. Existing `thinkingLevel`, `reasoningLevel`, text verbosity, and Anthropic/tool behavior continue to work.
6. Focused tests prove:
   - configured `high` produces outbound `reasoning_effort: "high"` or `reasoning.effort: "high"` as appropriate for the adapter;
   - configured `xhigh` is not remapped and is sent as `xhigh` if configured;
   - no effort field is emitted when unset;
   - unsupported/non-OpenAI adapter behavior is unchanged or explicitly guarded.
7. Verification includes the narrow test command and the smallest relevant broader test/build command available for OpenClaw fork.

## Evidence to mention in final note

- Exact files changed.
- Exact config field used/added.
- Test command(s) and result(s).
- One short explanation of why this is merge-friendly with upstream.

## Out of scope

- No copilot bridge changes.
- No broad refactor of model config or provider adapters.
- No UI work.
- No PR creation/merge.
- No git operations in the task instructions.
