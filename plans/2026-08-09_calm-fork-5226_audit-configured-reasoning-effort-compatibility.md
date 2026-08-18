# Plan 2026-08-09: Audit configured reasoning effort compatibility

Trace each repository-local reasoning-effort source to its final provider payload and compare the fork behavior with the upstream wrapper stack.

## Progress

- [x] Phase 0: Config + Init
- [x] Phase 1: Research
- [x] Phase 2: Knowledge
- [x] Phase 3: Synthesis

## Analysis

### Codebase Context

- `docs/proposals/proposal-20260809-165021-f994b3_openclaw-upstream-sync-compatibility-review.md:105` requires a source-to-wire compatibility gate across values, translation, precedence, unsupported providers, visibility, and tests.
- `031cdbf89477` changed `src/llm/providers/openai-completions.ts` and `src/llm/providers/openai-responses-shared.ts` so explicit `reasoningEffort` bypasses `thinkingLevelMap`; its four focused tests cover passthrough, unset values, and one unsupported-provider case.
- `src/agents/embedded-agent-runner/extra-params.ts:84` merges default, model, agent, and request parameters; `src/plugin-sdk/provider-stream.ts:109` composes the current OpenAI wrapper stack.
- `src/llm/providers/stream-wrappers/openai.ts:488` rewrites payload effort from canonical session thinking, while `src/agents/openai-reasoning-effort.ts:70` and `src/agents/openai-reasoning-compat.ts:38` define supported values and provider maps.
- `src/status/status-message.ts:820` and `src/gateway/session-utils.ts:1565` expose canonical thinking/session defaults, not an obvious explicit configured `reasoningEffort` field.

### Relevant Documentation

- `docs/gateway/config-agents.md:464` documents model-level `supportedReasoningEfforts` and `reasoningEffortMap` as shared menu, validation, and transport metadata.
- `docs/tools/thinking.md:29` documents provider-specific effort mappings and custom OpenAI-compatible opt-in behavior.
- `docs/proposals/proposal-20260809-165021-f994b3_openclaw-upstream-sync-compatibility-review.md:105` is the proposal authority for this investigation.
- No PlantUML document was found for this provider option flow; derive the source-to-wire graph directly from source and tests.

### Knowledge Base

- `learnings/architecture/openai-compatible-reasoning-effort-passthrough.md`: explicit `reasoningEffort` is provider-facing; do not remap it through `thinkingLevelMap`.
- `learnings/architecture/cool-vale-7046-explicit-reasoningeffort-must-bypass-thinkinglevelmap-at-provider-seams.md`: prior fork behavior fixed accidental `high`/`xhigh` rewriting at both completion and Responses seams.
- `learnings/architecture/2026-07-28_residue-audits-require-activation-proof.md`: build an activation ledger from entry point through caller to side effect; literal matches are inventory only.
- `recall-knowledge` used local fallback because QMD collection `openclaw-fork-learnings` was absent; most returned Deliberation-specific learnings were not applicable beyond the activation-proof rule.

## Available Skills

- `compound-plan`: owns this plan workflow and canonical plan path.
- `recall-knowledge`: supplied repository audit and wire-contract learnings.
- `save-learning`: mandatory final planning action after the plan is complete.

## Solution

- Build one evidence ledger keyed by source, accepted value, precedence rank, active caller chain, support gate, translation, final wire field, visibility, and existing test.
- Compare immutable repository objects with read-only `git show`; do not infer compatibility from ancestry or broad whole-tree diffs.
- Produce exactly one verdict: `retain`, `replace`, or `remove` the fork behavior, with confidence, concrete risks, and line/commit citations.

## Implementation

1. **Reproduce:** inspect `031cdbf89477` and its parent with read-only `git show`; reconstruct its four payload scenarios without executing tests, recording configured values, model compat metadata, expected payloads, and whether each assertion still maps to a current callable builder.
2. **Trace:** at `4b85d834ed1586062f31bded2f358fc5192d1674`, follow model/default params through `resolveExtraParams`, `resolvePreparedExtraParams`, provider hook composition, `SimpleStreamOptions`, completion/Responses builders, and `createOpenAIThinkingLevelWrapper`; record overwrite order for model defaults, agent/session thinking, and request overrides.
3. **Trace:** enumerate provider branches for OpenAI, OpenAI-compatible, OpenRouter, DeepSeek, Together, ZAI/Qwen, Mistral, and providers with reasoning disabled; map accepted canonical levels and explicit strings to `reasoning_effort`, `reasoning.effort`, boolean/thinking objects, omission, fallback, or rejection.
4. **Trace:** inspect status, Gateway session rows, Control UI options, logs/transport debug, and usage/event metadata; distinguish displayed canonical thinking from the actual translated wire effort and mark absent telemetry explicitly.
5. **Diagnose:** cross-check every matrix row against current focused tests and commit-era tests; classify proof as direct payload assertion, indirect resolver assertion, stale/inactive path, or uncovered, without running any command that executes tests.
6. **Diagnose:** compare fork intent with current wrapper ownership and choose exactly one proposal verdict; state confidence from active caller and payload proof, list only concrete compatibility risks, and preserve unknowns where repository evidence cannot prove provider behavior.
7. **Write report:** before writing, check for and prefer `python3 scripts/investigation-path.py --task-id calm-fork-5226 --project . --touch`. If absent, create `plans/investigations/` if needed and write `plans/investigations/calm-fork-5226_audit-configured-reasoning-effort-compatibility.md`. Include the evidence ledger, source-to-wire matrix, coverage gaps, exactly one verdict, confidence, risks, and repository-relative source/commit citations.

## Files to Modify

| File | Change |
| --- | --- |
| `plans/investigations/calm-fork-5226_audit-configured-reasoning-effort-compatibility.md` | Write the final investigation report only if the path helper remains absent; otherwise use its returned path under `plans/investigations/`. |

## Files to Inspect

| File | Evidence |
| --- | --- |
| `docs/proposals/proposal-20260809-165021-f994b3_openclaw-upstream-sync-compatibility-review.md` | Scope, compatibility gate, and cross-family session interaction. |
| `src/agents/embedded-agent-runner/extra-params.ts` | Config/request merge order and provider-wrapper composition. |
| `src/plugin-sdk/provider-stream.ts` | Active OpenAI wrapper order and ownership. |
| `src/llm/providers/stream-wrappers/openai.ts` | Session thinking translation and payload overwrite behavior. |
| `src/agents/openai-reasoning-effort.ts` | Accepted values, fallback, and unsupported-value behavior. |
| `src/agents/openai-reasoning-compat.ts` | Provider/model-specific effort maps. |
| `src/llm/providers/openai-completions.ts` | Provider-specific Chat Completions wire fields. |
| `src/llm/providers/openai-responses-shared.ts` | Responses wire field and explicit-effort passthrough. |
| `src/status/status-message.ts`, `src/gateway/session-utils.ts`, `ui/src/ui/views/chat.ts` | Status/session/UI visibility and precedence projections. |
| Adjacent `*.test.ts` files | Direct versus missing coverage for each matrix row. |

## TDD: skip

This is a read-only diagnostic investigation; existing tests are evidence to audit, not commands to execute or behavior to implement.

## Dependencies

- Both named commit objects must exist locally; do not fetch, checkout, switch branches, rebase, commit, or contact external repositories.
- Do not edit product code, run tests, use live configuration, make network calls, or claim external provider contracts beyond repository evidence.

---
*Created: 2026-08-09*
*Status: DRAFT*
