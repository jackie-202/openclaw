# Plan 2026-10-05: Deliberation retirement scope and native adapter test ownership

Produce an evidence-backed, markdown-only classification of safe future removal and retained host/native test scope. Investigation only; do not modify implementation or run tests/builds.

## Analysis

- Treat current OpenClaw fork source as runtime truth; use the retirement manifest and historical baseline excerpts/hashes only as provenance, not as current runtime fixtures.
- Inspect only non-secret source, tests, contracts, documentation, and markdown evidence in the three authorized roots. Read any scoped `AGENTS.md` before subtree work; do not inspect sibling `.git`, dependencies, private state, or credentials.
- Separate removed bundled implementation, public external-plugin dependency, generic host protocol/native transport, ordinary language references, and historical documentation.
- Classify exact paths/symbols/assertions as `REMOVE_RETIRED_CODE_OR_COUPLING`, `KEEP_GENERIC_HOST_OR_NATIVE_CONTRACT`, `REHOME_TEST_TO_PLUGIN`, `ADAPT_PUBLIC_DEPENDENCY_FIRST`, `HOLD_FOR_EVIDENCE`, or `UNKNOWN`.
- Compare the three Discord/Slack loader consumers assertion-by-assertion against external plugin tests. Record the actual gaps, including route/policy/handoff, exclusive dispatch, Slack root/child/ambiguous-child and history identity migration, duplicates/isolation, failures/silence, and transport side effects.

## Approach

1. **Reproduce:** Establish the current checkout and evidence state from the retirement checkpoint, manifest, accepted host contract, external native-suite host log, and current retained files. This is an offline documentary reproduction only: do not execute tests, builds, installs, requests, or messages. Mark stale/conflicting evidence unknown.
2. **Trace:** Inventory active retired-plugin references across runtime discovery, split loader paths, probes, build/package/docs, and tests. Trace each priority consumer through its retained handler/callees and map assertions to host adapter or plugin internals. Inspect corresponding Slack history/provider and native outbound adapters, generic exclusive-owner tests, and external plugin API/contracts/domain tests plus current KM integration evidence.
3. **Diagnose:** Compare actual assertions and caller paths; identify what external tests do not exercise. Decide whether generic fixtures, installed public-plugin fixtures, or existing adapter tests are the smallest adequate seam. Provide exact remove/retain/adapt/blocked matrix, minimal future cleanup scope, and verification requirements; separate source retirement, installed runtime discovery/integration, and real-provider proof.
4. **Write report:** Before writing the final investigation report, run `python3 scripts/investigation-path.py --task-id task-ef32aba1-f900-432a-a3fa-1ea1ce1a0961 --project . --touch` if present. If missing, create `plans/investigations/` and use `plans/investigations/task-ef32aba1-f900-432a-a3fa-1ea1ce1a0961_deliberation-openclaw-retirement-scope-and-native-adapter-test-ownership.md`. Report a conclusion of `SAFE_SCOPED_REMOVAL`, `NO_FURTHER_REMOVAL_PROVEN`, or `INCONCLUSIVE`; cite exact current paths/lines/assertions and evidence provenance. Keep all writes within this repository's `plans/`.

## Implementation

- No source, tests, package metadata, or runtime changes in this task.
- Keep a working evidence map of path/symbol, caller/assertion, classification, provenance, and confidence while investigating.
- Preserve unrelated assertions in mixed test files in any cleanup recommendation. Do not infer parity from test names/counts or user-reported live success.
- State missing evidence explicitly; do not claim installed-package parity without evidence.
- Final investigation deliverable is the report path resolved by the prescribed helper/fallback; include minimal future implementation and verification scope without performing it.

## Testing

- Do not run tests, builds, package installation, lifecycle commands, or live/provider operations.
- Validate report claims through read/search evidence only; ensure every conclusion has exact current path/line/assertion references and identifies stale or historical evidence as such.
- Check the final report and plan for scope compliance and `git diff --check` if applicable.

## TDD: skip

This task produces an investigation plan/report only and explicitly forbids implementation and test execution.

## Files

- `plans/handoffs/deliberation_bundled_plugin_retirement.md` — fork checkpoint and prior retirement reasoning to re-evaluate against current state.
- `plans/handoffs/deliberation-plugin-retirement/plugin-retirement-manifest.json` — retired-file provenance.
- `plans/handoffs/deliberation-plugin-retirement/accepted-host-contract.md` and `external-native-suite-host.log` — host contract and external suite evidence.
- `plans/handoffs/deliberation-retirement-audit-baseline-20261005/` in deliberation-pipeline — historical excerpts and verified hashes only.
- `extensions/discord/src/monitor/message-handler.deliberation.test.ts`, `message-handler.process.test.ts`, and retained corresponding handlers — Discord loader assertions and call paths.
- `extensions/slack/src/monitor/message-handler.deliberation.test.ts`, retained message handlers, deliberation-history/provider, and native outbound adapters — Slack adapter/history paths and assertions.
- Generic exclusive-owner tests, runtime discovery/build/package/docs references, and external `openclaw-deliberation` contracts/source/tests — classify ownership and compare actual test coverage.
- `test_deliberation_v2_e2e.py` and task-bde2f2fe checkpoint reports in km-system — current integration evidence, subject to provenance/staleness checks.
- Final report: path returned by `scripts/investigation-path.py`, or the deterministic fallback under `plans/investigations/` specified above.

## Progress

- [ ] Establish current evidence baseline and scoped instructions.
- [ ] Trace active references and three native loader consumers.
- [ ] Compare external assertions and diagnose exact removal boundary.
- [ ] Write and validate the evidence-backed investigation report.
