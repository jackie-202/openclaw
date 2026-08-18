# Plan 2026-08-09: Audit speech-core runtime export compatibility

Plan a read-only investigation of historical speech-core imports against the current export and plugin-loading architecture.

## Progress

- [x] Phase 0: Config + Init
- [x] Phase 1: Research
- [x] Phase 2: Knowledge
- [x] Phase 3: Synthesis

## Problem

Determine whether each historical speech-core runtime import is currently supported or unreferenced, and whether the retired package architecture fully removes the need for a compatibility alias.

## Analysis

### Codebase context

- `2c030c303aba` added support for `@openclaw/speech-core/runtime-api` and `@openclaw/speech-core/runtime-api.js` in package exports, TypeScript paths, source/dist SDK aliases, and resolver tests after a lazy Gateway reply failed.
- At base `4b85d834ed1586062f31bded2f358fc5192d1674`, `packages/speech-core/**` and `extensions/speech-core/**` are absent; runtime code is under `src/tts/**` and imports `./runtime-api.js` relatively.
- At that base, plugins still import `openclaw/plugin-sdk/speech-core`; root `package.json`, `scripts/lib/plugin-sdk-entrypoints.json`, and `src/plugin-sdk/speech-core.ts` define that replacement surface.
- `src/plugins/sdk-alias.ts` at the base resolves root plugin SDK subpaths and bundled plugin public surfaces but has no speech-core workspace-package alias.
- `src/plugin-sdk/facade-runtime.test.ts`, `src/plugins/sdk-alias.test.ts`, and TTS contract suites are the closest existing resolver/boot evidence; build checks include `scripts/check-plugin-sdk-exports.mjs` and `scripts/check-plugin-sdk-subpath-exports.mjs`.
- Keep historical package-qualified paths, current plugin SDK paths, and core-relative runtime imports as separate rows in the report map.

### Relevant documentation

- `docs/proposals/proposal-20260809-165021-f994b3_openclaw-upstream-sync-compatibility-review.md:117` requires source/reference search, package export resolution, DTS/export gates, and clean-checkout plugin boot proof before this family can be closed.
- `plans/tasks/2026-08-09_audit-speech-core-runtime-export-compatibility.md` constrains the work to a read-only repository/proposal/audit investigation at base `4b85d834ed1586062f31bded2f358fc5192d1674`.
- `2c030c303aba:learnings/tooling/2026-06-09_upstream-sync-speech-core-runtime-api-gateway-boot-audit.md` records the prior failure and historical validation evidence.

### Knowledge base

- Root architecture rules require direct source, caller, test, current behavior, and build/export contract proof before declaring compatibility obsolete.
- `src/plugin-sdk/AGENTS.md` permits compatibility only for shipped third-party APIs and requires package exports, entrypoint inventory, API baseline, docs, and export checks to stay aligned.
- `src/plugins/AGENTS.md` requires resolver evidence from generated fixtures and prohibits inferring loader behavior from a real bundled plugin source tree.
- Recall used the local fallback because QMD collection `openclaw-fork-learnings` was absent; the returned fork-compatibility learning was skeletal, so repository rules and the incident audit remain authoritative.

## Available Skills

- `compound-plan`: maintain and finalize this investigation plan.
- `recall-knowledge`: retrieve applicable fork compatibility learnings before synthesis.
- `save-learning`: record at least one planning-session learning after the plan is finalized.

## Solutions

Perform one read-only, commit-pinned evidence audit. Do not propose code until every historical specifier is classified as supported, replaced, or unreferenced in source and build/runtime outputs.

## Investigation Steps

1. **Reproduce the historical state from evidence.** Read `2c030c303aba` and its incident audit; extract each exact failing or supported specifier, resolution mode, artifact target, and historical assertion. At base `4b85d834ed1586062f31bded2f358fc5192d1674`, repeat repository searches for those exact strings and record positive and zero-match results without running code or tests.
2. **Trace current ownership and resolution.** Follow each surviving import from caller to `src/plugin-sdk/speech-core.ts` or `src/tts/runtime-api.ts`; inspect root package exports, plugin SDK entrypoint/private inventories, alias construction, bundled public-surface loading, build entries, DTS/export checks, and the nearest resolver, facade, TTS contract, and Gateway boot tests. Build an import/export table with historical path, base reference status, supported equivalent, source target, packaged target, loader involvement, and evidence.
3. **Diagnose alias necessity.** Compare the historical package-root architecture with the base's core-owned TTS architecture. Decide whether any source, generated DTS, package export, lazy chunk, or loader path can still emit `@openclaw/speech-core[/runtime-api[.js]]`; distinguish proof from gaps caused by the no-tests/no-build/no-live-smoke boundary. Select exactly one verdict: retain/add compatibility alias, or treat it as obsolete; attach one confidence rating and the evidence that would change it.
4. **Write the investigation report.** Before writing, run `python3 scripts/investigation-path.py --task-id quick-mist-3295 --project . --touch` if the helper exists. If it remains absent, create `plans/investigations/` if needed and write `plans/investigations/quick-mist-3295_audit-speech-core-runtime-export-compatibility.md`. Include the import/export map, source/build/test evidence, explicit verification gaps, and exactly one proposal verdict plus confidence.

## Files to Modify

| File | Change |
| --- | --- |
| `plans/investigations/quick-mist-3295_audit-speech-core-runtime-export-compatibility.md` | Add the read-only audit report when the path helper is unavailable; otherwise use only its returned path under `plans/investigations/`. |

## TDD: skip

The output is a read-only diagnostic report, and the scope explicitly forbids tests, builds, and live Gateway actions.

## Dependencies

- Pin all conclusions to `2c030c303aba` and base `4b85d834ed1586062f31bded2f358fc5192d1674`; do not use working-tree drift as base evidence.
- Limit evidence to repository content, the proposal, and audit documents cited by it; perform no source edits, external-repository work, tests, live actions, or Git lifecycle operations.
- Mark package-resolution, generated DTS, build-gate, and clean-checkout boot behavior as proof gaps unless static artifacts at the base prove them directly.

---
*Created: 2026-08-09*
*Status: DRAFT*
