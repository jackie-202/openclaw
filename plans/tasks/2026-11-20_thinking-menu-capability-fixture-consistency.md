# Deliverable: repair stale /think catalog fixture and pin existing capability semantics

## Goal and evidence

Complete the adjacent command-menu regression coverage for the behavior-preserving reasoning-catalog type repair. Host review is materialized inside this repository at `plans/checkpoints/thinking-catalog-host-review-20261120.md`; read it first. Source already strictly requires `compat.supportsReasoningEffort === true` before effort labels are authoritative. That policy is NOT to be changed in this task.

Observed reproducible failure:
`pnpm test src/auto-reply/thinking.test.ts src/auto-reply/commands-registry.test.ts`
exit1, thinking40/40pass, commands-registry28/29pass. Test `uses configured model compat for /think arg menus`, `src/auto-reply/commands-registry.test.ts:752–780`, config line767 lacks the positive capability switch but expects xhigh at778. This is the same stale fixture mismatch already repaired in the nearby thinking test. Do not drop/weaken the xhigh assertion: supply a semantically valid explicitly enabled catalog model and verify the actual menu.

Current production correction ONLY adds optional supportsReasoningEffort boolean to local ThinkingCatalogEntry.compat and annotates mapped levels array as RankedThinkingLevelOption[]. Host same-options in-memory TypeScript transpilation demonstrated byte-identical emitted JS before/after for both changed files. Keep these type edits and existing oMLX changes intact. Original task-local compiler RED/GREEN proof belongs to `task-4670891c-252f-4234-a6e7-1a64e0725f1d`, must stay immutable/original identity; do NOT copy/relabel it or pretend passing characterization is your new compiler RED.

## Scope and intended implementation

Allowed writes: existing `src/auto-reply/commands-registry.test.ts`, `src/auto-reply/thinking.test.ts`, plus task-owned inert verification/checkpoint artifacts. Read relevant repo-local source/types/provider contracts as necessary. NO production-source, compiler/build config, dependencies, installed skill/helper, runtime/service/config edits. If evidence shows an actual production change is necessary, record the specific unsupported requirement rather than expand scope or change reasoning policy.

1. Fix the configured custom-gmn menu fixture with the canonical `supportsReasoningEffort: true` flag, keeping meaningful xhigh menu value/title assertions. Avoid `as never`/any additions or weakening existing behavior assertions.
2. Add small focused characterization for positive flag + advertised efforts, missing flag and explicit false (labels alone do not enable/restrict fallback); include existing exact-off policy: explicit [off] yields off-only; [off,high] retains allowed off/high; advertised non-off-only list must not silently gain off/minimal. Do not invent an always-visible-off product rule.
3. Make existing binary-priority coverage meaningful by using an explicitly enabled efforts list where required; verify binary fallback remains off/on rather than xhigh. Preserve reasoning=false opt-out and provider-authoritative precedence, reusing existing scenarios rather than duplicating a broad matrix.
4. Use the actual menu consumer as well as pure helper coverage; assertions should fail if configured-catalog propagation or strict capability gating regresses. No new harness, copied implementation or own-mock oracle.

## Runtime/proof inputs

For supported proof helper when applicability review requires it: caller has verified `/opt/homebrew/bin/python3.15` (Python3.15.0 matching `.python-version`); explicit alternative same runtime `/opt/homebrew/opt/python@3.15/bin/python3.15`. No pyenv/install/pin migration or external private venv is needed/authorized. Follow skill:tdd's supported command and current reviewed applicability. This is tests-only stale-fixture correction plus passing characterization; use an honest semantic applicability/provenance decision from planning/review, do not fabricate a failing new behavior test, delete source to force RED, import another task's proof or blanket waive gates. A real pre-correction menu test failure is available as a verification oracle; capture it through the supported owner if required.

## Verification and acceptance

- Reproduce the actual commands-registry failure before changing its fixture; then rerun the exact combined two-file standard command green. Record exact test count/results and any other failures honestly.
- Focused formatting/lint of touched tests, diff checks; no broad/full-suite/declaration generation or complete build required or authorized here.
- Scope must remain tests/evidence only; preserve production/type source and original proof identities. Normal reviewed planning and independent acceptance remain mandatory.
- Final checkpoint describes why the old fixture contradicted existing strict capability source, why changed assertion/fixture is valid, positive/negative semantics characterized, commands/results and remaining full-build/deployment limits. No claim of deploy/live behavior from source tests.

No sibling-repo/private-home/runtime-data/credential access, services/schedulers/task lifecycle, network/providers/models/inference, external publication or deployment/restart. Host owns full build, recovery and rollout separately.

## Previous Plan (rejected - attempt 1)

Plan file: /Users/michal/Projects/openclaw-fork/plans/2026-11-20_task-e1295a88-8ab7-49e2-9616-1feeab5a29ba_deliverable-repair-stale-think-catalog-fixture-and-pin.md
Review feedback: The plan’s `required` TDD decision has a sound fixture-regression rationale, but it omits the mandatory supported proof-capture workflow and independent acceptance.
Read the previous plan, understand what was wrong, and produce a corrected plan.
