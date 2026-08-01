# Audit Deliberation v1 residue in OpenClaw fork

## Objective

After Deliberation v2 implementation and cleanup, independently audit `/Users/michal/Projects/openclaw-fork` for remaining Deliberation/thoughtful-response v1 residue. Produce a `CLEAN` or `NOT CLEAN` verdict with exact evidence. Investigation only; do not repair source, change SDK/core behavior, delete fixtures, or mutate live config/runtime state.

## Scope boundary

Allowed root: `/Users/michal/Projects/openclaw-fork` only. Do not inspect workspace, KM System, Mission Control, `~/.openclaw/openclaw.json`, channels, crons or other repositories. Use repository-local proposal/investigation/task artifacts as context and report external unknowns instead of crossing boundaries.

Audit plugin registrations, hook wiring, bundled/external plugin package code, SDK integrations, outbound sender paths, tests, fixtures, config schema/examples and compatibility shims. The v2 implementation must remain a standard plugin; generic OpenClaw functionality that resembles its hooks is not v1 residue unless it is specifically wired to the retired authority/path.

## Search model

Use investigation `docs/investigations/deliberation-v2-standard-plugin-capability-investigation.md` and completed implementation task `bright-wave-6041` as repository-local evidence. Search literal identifiers and behavioral remnants:

- retired thoughtful-response/deliberation plugin registrations
- v1 intake or message gate hooks
- old sender/fallback paths and multiple source-channel send call sites
- marker authorization such as `__deliberated__`
- v1 routes, state paths, config keys and compatibility aliases
- dual-write/fallback behavior
- executable `_legacy`, `.bak`, disabled or commented fallback branches
- tests/fixtures imported by production code or capable of registration
- channel-specific v1 bypasses hidden behind generic adapters

## Classification

Classify every match as exactly one of:

1. `executable_residue`
2. `runtime_or_config_reference`
3. `fallback_or_dual_authority`
4. `test_fixture_only`
5. `historical_document_or_audit`
6. `generic_openclaw_capability`
7. `false_positive`

A `CLEAN` verdict permits categories 4–7 only with evidence that they cannot activate v1 behavior. Categories 1–3 require `NOT CLEAN`.

## Required evidence

- Record searched roots, identifiers, registrations, imports and behavioral patterns.
- Trace suspicious hooks/senders from registration to runtime call sites.
- Verify one v2 final-send adapter call site and absence of v1 sender fallback/dual authority.
- Verify no v1 plugin/config alias can be loaded through manifest or compatibility registration.
- Distinguish normal shared SDK hooks from Deliberation-specific residue.
- Rerun bounded static scans and focused tests only where needed; cite paths and symbols/line ranges.

## Deliverable

Write `docs/investigations/deliberation-v1-residue-audit-openclaw-fork.md` containing:

- verdict: `CLEAN` or `NOT CLEAN`
- scope/exclusions and inventory sources
- commands/scans and focused test results
- categorized findings and negative evidence
- repair recommendations for blocking findings
- machine-readable summary with `project`, `verdict`, `blocking_findings`, `archival_findings`, `generic_capabilities`, `searched_roots`, and `unknowns`

## Acceptance

- Audit remains fork-local and does not misclassify generic SDK behavior as v1 residue.
- Verdict is independent, evidence-backed and checks registrations plus executable call paths, not names alone.
- No production/source/config/runtime mutation occurs.
- Any blocking finding names an exact owner-scoped repair.
- Missing evidence or ambiguous activation yields `NOT CLEAN`.

## Batch verdict contract

`CLEAN` permits the next final audit. `NOT CLEAN` stops parent-batch completion; create/insert an `openclaw-fork` repair task before remaining audits and rerun this audit after repair. Do not implement repairs here.
