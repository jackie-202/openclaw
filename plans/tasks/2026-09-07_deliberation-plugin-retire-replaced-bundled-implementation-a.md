# Deliberation plugin: retire replaced bundled implementation and host path coupling

Implementation M; openclaw-fork repository ONLY. Proposal `proposal-20260831-170956-a06505`, section `externalize-openclaw-plugin`.

## Current technical context

Read repo-local `plans/checkpoints/deliberation_external_plugin_cutover.md` and `plans/checkpoints/deliberation_bundled_registration_removal.md`. The build/discovery/package exclusion work is already implemented. Do not repeat externalization, install another plugin, recreate removed full-gate tooling, or rewrite generic native APIs.

Remaining domain copy: `extensions/deliberation` (host inspection: 43 files, 15 native test files). It is replaced in production by the external `@openclaw-deliberation/plugin` package. Read the supplied repo-local `plans/handoffs/deliberation-plugin-retirement/accepted-host-contract.md`, `plugin-retirement-manifest.json` and `external-native-suite-host.log` for accepted public boundary, file hashes, scenario mappings and fresh full external native test evidence. An unrelated KM/provider extraction receipt is not a plugin transfer manifest. Filename/count parity alone is not scenario equivalence.

## Deliverable

Remove only manifest-proven replaced `extensions/deliberation` sources, tests, local contracts and package metadata. Record exact removed/retained paths and why each is safe to retire. Preserve generic OpenClaw transport, history, hooks, runtime, channel APIs and unrelated fork work.

Reconcile the obsolete lockfile workspace importer/dependencies and any remaining exported API, discovery, build or test coupling that genuinely consumes the retired implementation. Inspect actual references rather than assuming the September task's old affected-file list is still correct. In particular, explicit npm exclusion of `dist/extensions/deliberation/**` and negative bundled-artifact tests are intentional absence protections unless evidence proves otherwise; do not delete them merely because their strings mention the old path. Do not reintroduce `scripts/deliberation-full-gate.ts` or its removed command.

Any remaining host integration test that actually needs the plugin must use the supplied separately packaged public API/test contract, not sibling sources, deep host internals, a retained vendored copy, runtime downloads or a second maintained implementation. Preserve wire pin and producer-owned domain semantics. No silent skips, test exclusion or assertion weakening to make removal pass. Record a concrete missing technical input or exposed public API dependency without crossing repository boundaries or expanding architecture.

## Scope and verification

All worker reads/writes are repo-local. Do not inspect sibling repos, home configuration, live endpoints or installed releases. No install, link, live restart/config change, cron mutation, replay, provider call or real message. Host owns deployment policy and runtime validation; worker must not query pipeline task/batch state or schedule successors.

Characterization first: identify existing affected registry/discovery/package/contract coverage, preserve relevant scenarios and add a focused absence/public-boundary regression where missing. Run focused affected host tests and adequate source-level type checks under the supplied isolated verification policy. The live global CLI is still linked to this fork: do not rebuild or overwrite live `dist` as a worker verification shortcut. The full `npm test` pipeline gate remains configured; no suite may be skipped merely to pass cleanup. An external native suite is a supplied technical acceptance input, not proof inferred from Python-only tests. Do not demand an entire production rebuild/deploy merely for source retirement.

Output `plans/checkpoints/deliberation_bundled_plugin_retirement.md`: exact file manifest, test ownership/scenario mapping and evidence, classified remaining references, focused commands/results, any intentionally retained negative protection, public API compatibility, and post-cleanup operator verification checklist. No source backup copies. Preserve rollback artifacts/evidence outside retired sources under host ownership. Source-only completion means one maintained domain plugin outside this fork, with host consumers using public package boundaries; it does not claim runtime reload.

## Previous Plan (rejected - attempt 1)

Plan file: /Users/michal/Projects/openclaw-fork/plans/2026-10-04_calm-fork-3432_deliberation-plugin-retire-replaced-bundled-implementation.md
Review feedback: The plan is heavily overengineered for retiring one bundled plugin and updating its consumers, adding extensive ledgers, checkpoints, custody gates, and external-artifact prerequisites beyond a direct deletion-and-decoupling solution.
Read the previous plan, understand what was wrong, and produce a corrected plan.
