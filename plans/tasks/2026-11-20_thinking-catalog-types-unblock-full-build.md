# Deliverable: repair reasoning-catalog type consistency blocking the complete fork build

## Outcome

Restore the repository-supported complete build by fixing the existing type errors in reasoning-profile/catalog handling. Preserve the actual provider/catalog thinking-level policy, including explicit off-only models, catalog-authorized effort lists and provider-owned binary behavior. Do not turn a successful transpile into a claimed complete build.

## Observed defect and reproduction

Host ran the standard complete `pnpm build` after the scoped oMLX repair. Plugin assets, tsdown, CLI bootstrap guards and runtime postbuild succeeded. The `build:plugin-sdk:dts` step (`node scripts/run-tsgo.mjs -p tsconfig.plugin-sdk.dts.json --declaration true`) failed with:

- `src/auto-reply/thinking.ts(104,15): TS2551: Property supportsReasoningEffort does not exist on type { thinkingFormat?: string | undefined; supportedReasoningEfforts?: readonly string[] | null | undefined; }`.
- `src/auto-reply/thinking.ts(254,24)` and `(254,35): TS2322: Type off is not assignable to type adaptive | high | low | max | medium | minimal | xhigh`.
  The first boundary reads `ThinkingCatalogEntry["compat"]`; its declaration is in `src/auto-reply/thinking.shared.ts`. The second filters off from a mapped array before unshifting the off option, letting inference narrow the array too far. Inspect the actual owner types before choosing a fix; these are observations, not permission to bypass validation.

The failing code predates the current oMLX diff. Host preserved the previous generated runtime artifacts before the attempt and restored them after failure. This task owns source/types/tests only, not deployment.

## Scope and design

Repository-local source and inert evidence in this checkout only. Inspect complete relevant functions, callers and provider/catalog contracts. Expected implementation scope: `src/auto-reply/thinking.ts`, `src/auto-reply/thinking.shared.ts`, adjacent existing thinking tests; change another actual owning type only if evidence requires it and explain the boundary. Inspect canonical `packages/model-catalog-core/src/model-catalog-types.ts`, configuration model compat declarations and provider-thinking contracts before duplicating or widening a type.

Use the smallest coherent type/implementation correction. Do not add unsafe casts, `any`, ignore directives, suppressions, skipLibCheck, relaxed compiler flags, typecheck/build exclusions, fallback model aliases or relaxed reasoning capability policy to obtain green. No new runner, generated-source workaround, dependency version changes or runtime config edits. Do not change declared model capabilities, provider-specific behavior, selection defaults, reasoning effort normalization, catalog opt-out precedence or binary profile authority merely to satisfy the compiler. Where declarations are missing an existing canonical field, represent the actual optional contract rather than assume every model supports it. Correct contextual types without changing returned values unintentionally.

The oMLX source/docs/tests currently present are outside this repair. Preserve them and all unrelated artifacts. No sibling-repo/private-home/runtime-data reads, imports or commands; no services, schedulers, channel messages, provider/inference/network probes, deployment, restart, task lifecycle, credentials or DB access.

## Verification and acceptance

1. Follow the repository planning/review/TDD owner. Capture genuine causal RED/GREEN at the actual failing type-check boundary; do not present an unrelated failing assertion or a passing baseline as RED. Add focused behavioral regression only where characterization is missing. Record what actually failed before the correction.
2. Canonical shared type and runtime consumer agree on supportsReasoningEffort semantics. Off can be restored to a profile when authorized without violating the inferred array type. Preserve reasoning=false off-only behavior, provider-authoritative profiles, binary provider behavior and valid/invalid/empty catalog effort handling. Use adjacent existing tests and their true contracts; do not rewrite expectations solely to bless a changed capability policy.
3. Rerun the exact failed declaration command above and focused `pnpm test src/auto-reply/thinking.test.ts src/auto-reply/thinking.shared.test.ts` (discover actual existing adjacent filenames; do not invent missing tests). Select file-scoped formatting/lint and changed lanes using the repository testing owners. Record any genuine environment prerequisite separately from source/type correctness. Do not run a broad/full suite locally or provision cloud infrastructure to replace a missing prerequisite.
4. Do not run `pnpm build` or deployment/installation here: the linked installation uses this checkout, so full in-place generation and recovery remain host-owned. The named declaration check is the narrow compile oracle for this task. Do not remove/clean generated artifacts as part of the repair.
5. Final checkpoint must list exact changed source/types, commands and exit/results, source-versus-runtime limits, any blocked checks and the rationale that behavior is preserved. Independent acceptance is required; no claim the gateway is deployed or that all gates ran from a narrow pass.

## Previous Plan (rejected - attempt 1)

Plan file: /Users/michal/Projects/openclaw-fork/plans/2026-11-20_task-12a6fb6a-4c67-4999-9e01-4f345d0e9f35_deliverable-repair-reasoning-catalog-type-consistency.md
Review feedback: The plan proposes a minimal root-cause correction and an appropriate required-TDD decision, but omits the task’s mandatory independent acceptance step.
Read the previous plan, understand what was wrong, and produce a corrected plan.
