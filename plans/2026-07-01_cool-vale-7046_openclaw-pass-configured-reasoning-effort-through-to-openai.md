# Plan 2026-07-01: OpenAI-Compatible Reasoning Effort Passthrough

Use the existing OpenAI-compatible `reasoningEffort` option and the existing model `params` config bag to pass explicit provider-facing effort strings into request builders unchanged.

_Status: DRAFT_
_Created: 2026-07-01_

## Progress

- [x] Phase 0: Config + Init
- [x] Phase 1: Research
- [x] Phase 2: Knowledge
- [x] Phase 3: Synthesis

## Analysis

### Codebase Context

- `src/agents/openai-transport-stream.ts`: exported `buildOpenAIResponsesParams` and `buildOpenAICompletionsParams` already accept `options.reasoningEffort`; completions already uses `compat.reasoningEffortMap`, responses resolves supported efforts directly.
- `src/agents/openai-transport-stream.test.ts`: focused builder tests already assert `reasoning`, `reasoning_effort`, provider guards, and unsupported Mistral behavior without network calls.
- `src/agents/openai-reasoning-effort.ts`: model support gate reads `compat.supportsReasoningEffort` and `compat.supportedReasoningEfforts`; fallback logic still maps unsupported `xhigh` to `high`, so explicit config must also declare support when `xhigh` is valid.
- `src/agents/openai-reasoning-compat.ts`: `reasoningEffortMap` is an explicit provider compatibility map; do not use it for the GPT-5.5 bridge unless the configured value still passes through unchanged.
- `src/llm/providers/openai-completions.ts`: legacy builder maps `options.reasoningEffort` through `model.thinkingLevelMap` before `reasoning_effort`; change only if the fork path still uses this provider builder.
- `src/llm/providers/openai-responses-shared.ts`: legacy Responses helper maps `options.reasoningEffort` through `model.thinkingLevelMap` before `reasoning.effort`; change only if the fork path still uses this provider builder.
- `src/llm/providers/simple-options.ts`: `buildBaseOptions` drops unknown `SimpleStreamOptions` fields; add `reasoningEffort` here only if configured effort enters through simple provider options.
- `packages/llm-core/src/types.ts`: `StreamOptions` and `SimpleStreamOptions` do not define provider-facing `reasoningEffort`; add a string field only if needed to avoid casts at the simple-options seam.
- `src/config/types.models.ts` and `src/config/zod-schema.core.ts`: `models.providers.*.models[].params` already accepts `Record<string, unknown>`; prefer `params.reasoningEffort` over a new top-level schema key.
- `src/agents/model-thinking-default.ts`: existing precedent for reading per-model `params.thinking`; mirror the lookup shape only if config-to-runtime propagation needs a resolver.

### Relevant Documentation

- No user-visible docs or PlantUML updates are needed for this internal fork-only request-builder change.
- Root `AGENTS.md` requires minimal fork-friendly diffs, no hidden compat unless a shipped contract exists, and focused verification of touched surfaces.
- `src/agents/AGENTS.md` requires lightweight focused agent tests and avoiding broad runtime imports in agent tests.

### Knowledge Base

- `learnings/architecture/openclaw-channel-runtime-profile-resolver-seam.md`: use focused tests across affected seams; do not patch only one projection when a setting must reach runtime.
- `learnings/tooling/fork-rebase-divergence-silent-build-break.md`: this fork rebases often; keep imports/surfaces narrow and run a build when touching shared types or lazy/provider boundaries.
- QMD collection `openclaw-fork-learnings` was unavailable; grep fallback found no reasoning-effort-specific learning.

## Available Skills

- `tdd`: use first during implementation because this is testable request-builder behavior; write RED tests before changing builders.
- `openclaw-testing`: use after implementation to choose the smallest safe local verification plus any build/check escalation.
- `validate-implementation`: use after implementation if schema/shared type surfaces are changed.
- `autoreview`: use before handoff if code is implemented in a later task.
- `save-learning`: run at closeout after implementation or planning discoveries; this planning task runs it before final response.

## Solution

- Reuse the provider-facing option name `reasoningEffort`; do not add `thinkingLevel` mappings or new effort aliases.
- Prefer config shape `models.providers.<provider>.models[].params.reasoningEffort: "high"` or `agents.defaults.models["provider/model"].params.reasoningEffort: "high"` only if the implementation proves configured model params are the existing source for runtime options.
- Propagate explicit `reasoningEffort` from config/runtime to OpenAI-compatible options without normalizing through `thinkingLevelMap`.
- Keep `thinkingLevelMap` for legacy thinking-level-to-provider-value compatibility only; do not apply it to already provider-facing `reasoningEffort`.
- Preserve support gating with `model.reasoning` and `compat.supportsReasoningEffort` / `supportedReasoningEfforts`; for custom GPT-5.5 bridge config, declare `supportedReasoningEfforts: ["low", "medium", "high", "xhigh"]` when `xhigh` is valid.
- Preserve default behavior when no explicit `reasoningEffort` is set; do not remove existing default-off payloads unless the touched seam already omits them today.

## Implementation

1. Add RED tests in `src/agents/openai-transport-stream.test.ts` for explicit configured/requested `reasoningEffort` passthrough on both `openai-completions` and `openai-responses` builder seams.
2. Add a RED regression in the legacy provider test only if the fork route still reaches `src/llm/providers/openai-completions.ts` or `src/llm/providers/openai-responses-shared.ts`.
3. Add the smallest resolver for configured explicit effort only if needed: read `params.reasoningEffort` as a non-empty string from the same model config location that currently reads `params.thinking`.
4. If simple provider options carry the value, add `reasoningEffort?: string` to `StreamOptions` or `SimpleStreamOptions` in `packages/llm-core/src/types.ts` and copy it in `src/llm/providers/simple-options.ts`.
5. In OpenAI-compatible builders, emit the configured value directly:
   - Chat Completions: `params.reasoning_effort = options.reasoningEffort`.
   - Responses: `params.reasoning = { effort: options.reasoningEffort, summary: ... }`.
6. Keep `resolveOpenAIReasoningEffortForModel` for support checks and provider compat maps, but do not pass `thinkingLevelMap` as a fallback for explicit `reasoningEffort`.
7. Leave Anthropic, channel/session routing, UI, copilot bridge, and broad model config refactors untouched.
8. Run focused tests, then run the smallest broader command chosen by `openclaw-testing`; run `pnpm build` if `packages/llm-core`, lazy provider boundaries, or exported types changed.

## Files to Modify

| File                                                        | Change                                                                                                                           |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `src/agents/openai-transport-stream.test.ts`                | Add focused builder tests for direct `reasoningEffort` passthrough, no remap, unset behavior, and non-OpenAI guard.              |
| `src/agents/openai-transport-stream.ts`                     | Adjust only if builder currently remaps or drops explicit configured effort on the active fork path.                             |
| `src/llm/providers/openai-completions.ts`                   | Remove `thinkingLevelMap` mapping for explicit `options.reasoningEffort` only if legacy builder is on the active path.           |
| `src/llm/providers/openai-completions.test.ts`              | Add legacy Chat Completions request payload regression only if `openai-completions.ts` changes.                                  |
| `src/llm/providers/openai-responses-shared.ts`              | Remove `thinkingLevelMap` mapping for explicit `options.reasoningEffort` only if legacy Responses builder is on the active path. |
| `src/llm/providers/openai-responses-shared.test.ts`         | Add legacy Responses payload regression only if `openai-responses-shared.ts` changes.                                            |
| `src/llm/providers/simple-options.ts`                       | Forward `reasoningEffort` only if simple provider options carry configured effort.                                               |
| `packages/llm-core/src/types.ts`                            | Add `reasoningEffort?: string` only if needed for typed simple options.                                                          |
| `src/agents/model-thinking-default.ts` or adjacent resolver | Add `params.reasoningEffort` lookup only if config-to-runtime propagation does not already exist.                                |

## TDD

Implement the TDD cycle with `skill:tdd` and record RED/GREEN evidence in `plans/checkpoints/cool-vale-7046.red-green-proof.md`.

### Targeted Tests

**Test file:** `src/agents/openai-transport-stream.test.ts`  
**Framework:** Vitest via repo wrapper  
**Run command:** `pnpm test src/agents/openai-transport-stream.test.ts -- --runInBand`  
**Edit hint:** append near existing `buildOpenAICompletionsParams` reasoning tests around line 5267 and Responses builder tests around line 7055.

```ts
it("passes explicit OpenAI-compatible chat reasoningEffort through without thinkingLevelMap remap", () => {
  const params = buildOpenAICompletionsParams(
    {
      id: "gpt-5.5",
      name: "GPT-5.5",
      api: "openai-completions",
      provider: "openai",
      baseUrl: "http://127.0.0.1:18800/v1/openai",
      reasoning: true,
      input: ["text"],
      cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
      contextWindow: 200000,
      maxTokens: 8192,
      thinkingLevelMap: { xhigh: "high" },
      compat: {
        supportsReasoningEffort: true,
        supportedReasoningEfforts: ["low", "medium", "high", "xhigh"],
      },
    } satisfies Model<"openai-completions">,
    { systemPrompt: "system", messages: [], tools: [] } as never,
    { reasoningEffort: "xhigh" } as never,
  ) as { reasoning_effort?: unknown };

  expect(params.reasoning_effort).toBe("xhigh"); // RED: fails if explicit effort is mapped through thinkingLevelMap.
});

it("passes explicit OpenAI-compatible Responses reasoningEffort through unchanged", () => {
  const params = buildOpenAIResponsesParams(
    {
      id: "gpt-5.5",
      name: "GPT-5.5",
      api: "openai-responses",
      provider: "openai",
      baseUrl: "http://127.0.0.1:18800/v1/openai",
      reasoning: true,
      input: ["text"],
      cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
      contextWindow: 200000,
      maxTokens: 8192,
      thinkingLevelMap: { xhigh: "high" },
      compat: {
        supportsReasoningEffort: true,
        supportedReasoningEfforts: ["low", "medium", "high", "xhigh"],
      },
    } satisfies Model<"openai-responses">,
    { systemPrompt: "system", messages: [], tools: [] } as never,
    { reasoningEffort: "high" } as never,
  ) as { reasoning?: { effort?: unknown } };

  expect(params.reasoning?.effort).toBe("high"); // RED if explicit value is dropped or remapped.
});

it("keeps reasoning effort absent when no explicit effort is configured on guarded providers", () => {
  const params = buildOpenAICompletionsParams(
    {
      id: "mistral-large-latest",
      name: "Mistral Large",
      api: "openai-completions",
      provider: "mistral",
      reasoning: true,
      input: ["text"],
      cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
      contextWindow: 200000,
      maxTokens: 8192,
    } as never,
    { systemPrompt: "system", messages: [], tools: [] } as never,
    undefined,
  );

  expect(params).not.toHaveProperty("reasoning_effort");
});
```

| Test                                  | RED                                            | GREEN                                  |
| ------------------------------------- | ---------------------------------------------- | -------------------------------------- |
| explicit chat `xhigh` passthrough     | `reasoning_effort` becomes `high` or is absent | `reasoning_effort` is exactly `xhigh`  |
| explicit Responses `high` passthrough | `reasoning.effort` is absent or mapped         | `reasoning.effort` is exactly `high`   |
| unset guarded provider                | unsupported provider emits effort              | unsupported provider remains unchanged |

### Regression

- [ ] `pnpm test src/agents/openai-transport-stream.test.ts -- --runInBand`
- [ ] Add and run `pnpm test src/llm/providers/openai-completions.test.ts src/llm/providers/openai-responses-shared.test.ts -- --runInBand` only if legacy provider files change.
- [ ] Run `pnpm build` if shared types, lazy provider exports, or package boundaries change.

## Dependencies

- Custom GPT-5.5 bridge model config must mark the model as reasoning-capable and declare support for the exact efforts it accepts when using non-default values.
- The copilot bridge is already implemented and remains out of scope.
- No GitHub, git commit, UI, channel, or bridge changes are part of this task.
