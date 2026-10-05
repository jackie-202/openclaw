# Fix GPT-6.1 model-ops metadata and live thinking compatibility

## User outcome

Make the supported model-ops workflow able to register `openai/gpt-6.1-sol` with the reasoning capabilities required by Gateway, so a channel-scoped switch to `thinking=high` and `reasoning=on` succeeds for an existing live Discord session.

## Live evidence

On 2026-10-01 the repository-owned `km-system/scripts/model-ops.py` flow registered `openai/gpt-6.1-sol` with:

- `contextWindow: 200000`
- `maxTokens: 16384`
- `thinkingLevelMap: low|medium|high|xhigh|max`

The registration capability currently rejects or cannot express the remaining protected model metadata (`reasoning`, `compat.supportsReasoningEffort`, `compat.supportedReasoningEfforts`, and related canonical model fields). The resulting Gateway catalog still reports `reasoning:false`.

A scoped switch for `discord:1483778179700228147` persisted the intended channel configuration successfully:

- model `openai/gpt-6.1-sol`
- thinking `high`
- reasoning `on`
- text verbosity `low`

But its live `sessions.patch` failed with:

`thinkingLevel "high" is not supported for openai/gpt-6.1-sol (use off)`

Do not add channel-specific exceptions. Fix the model capability/registration contract so all normal consumers see one truthful model profile.

## Required behavior

1. The protected `model_ops_register_installed_model` path can safely register the complete supported metadata needed for a reasoning model, including at least:
   - `api: "openai-completions"` when appropriate
   - `reasoning: true`
   - `input: ["text"]`
   - cost fields
   - `contextWindow` and `maxTokens`
   - `compat.supportsReasoningEffort: true`
   - `compat.supportedReasoningEfforts: ["low", "medium", "high", "xhigh", "max"]`
   - `thinkingLevelMap` for those same levels
2. Validation remains fail-closed: reject malformed metadata, unknown fields, sensitive/provider-auth mutations, duplicate registration, config drift, and immutable-field changes.
3. Gateway thinking-profile/session validation must accept `high` for the resulting registered `openai/gpt-6.1-sol` and reject unsupported `off` if the declared effort set excludes it.
4. Existing registrations and removals remain compatible. Do not weaken protected-config guards or broaden tool authority beyond model catalog metadata plus the existing selectable-model entry.
5. Preserve the existing model-ops plan/apply approval semantics and immutable projections.

## Scope and ownership

- Work only in the OpenClaw fork.
- Prefer the narrow model-ops registration contract plus shared model metadata/profile owners.
- Do not edit runtime config, session stores, or channel mappings from this task.
- Do not restart or kill Gateway.
- Do not perform live provider requests.

## Tests

Use TDD and add focused coverage for:

- plan/apply registration with complete reasoning metadata;
- malformed/unknown/sensitive metadata rejection;
- immutable projection and config-drift behavior unchanged;
- resulting catalog/profile accepts `high` and excludes unsupported `off` for GPT-6.1;
- `sessions.patch` accepts `high` when given that truthful catalog entry;
- existing non-reasoning and off-capable model cases remain unchanged.

Run the smallest relevant test suites plus repository-required type/lint/build checks for changed published/plugin surfaces. Record RED/GREEN evidence in the task checkpoint.

## Acceptance

The implementation is complete when tests prove that the same metadata envelope accepted by the protected registration tool is sufficient for Gateway to expose `low|medium|high|xhigh|max` for `openai/gpt-6.1-sol`, without direct config edits or a channel-specific bypass.
