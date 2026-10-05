---
title: Deliberation OpenClaw retirement scope and native adapter test ownership
type: investigation
---

# Deliverable

Markdown-only report in plans/investigations identifying the remaining safe removal scope for old Deliberation plugin implementation/test coupling in OpenClaw, versus generic host/native transport features and tests that remain necessary. No code deletion or repair. Produce evidence-backed exact path/assertion classifications and minimal future cleanup recommendations.

# Inputs and explicit scope

Read/search non-secret source, tests, contracts, documentation and markdown evidence in /Users/michal/Projects/openclaw-fork, /Users/michal/Projects/deliberation-pipeline and /Users/michal/.openclaw/workspace/km-system only. Each AGENTS.md documents this scoped authority; project permissions forbid sibling writes and shell execution.
Fork plans/checkpoints/deliberation_bundled_plugin_retirement.md; plans/handoffs/deliberation-plugin-retirement/{plugin-retirement-manifest.json,accepted-host-contract.md,external-native-suite-host.log}; current source and tests. The 43 bundled files including15 old plugin test paths were removed from working tree; establish current state rather than treating the earlier partial checkpoint as final runtime truth.
Historical baseline resides in deliberation-pipeline/plans/handoffs/deliberation-retirement-audit-baseline-20261005/: host-prepared markdown excerpts, all43 original fork source hashes verified against retirement manifest. Evidence only, not runtime fixtures or source authority. Compare external plugins/openclaw-deliberation current public API/source/contracts/tests and domain tests, plus current KM tests/integration/test_deliberation_v2_e2e.py and its task-bde2f2fe checkpoint reports. User-reported live plugin success is not proof of all host adapter assertions or installed-package parity.
Priority native consumers: extensions/discord/src/monitor/message-handler.deliberation.test.ts; extensions/discord/src/monitor/message-handler.process.test.ts at runDeliberationIntegrationTest; extensions/slack/src/monitor/message-handler.deliberation.test.ts. Also inspect corresponding retained message handlers, Slack deliberation-history/provider, native outbound adapters, generic exclusive-owner tests and plugin discovery/build/package/docs references.

# Required analysis

1. Inventory all active remaining references to retired extensions/deliberation source, including split loader paths, public probes, runtime discovery/build/package metadata and tests. Distinguish removed plugin implementation, new public dependency, retained generic protocol/native transport and ordinary language/historical docs. Confirm consumers rather than inferring from name matches.
2. Classify exact path/symbol/test groups as REMOVE_RETIRED_CODE_OR_COUPLING, KEEP_GENERIC_HOST_OR_NATIVE_CONTRACT, REHOME_TEST_TO_PLUGIN, ADAPT_PUBLIC_DEPENDENCY_FIRST, HOLD_FOR_EVIDENCE or UNKNOWN, with caller/assertion evidence.
3. For each of the three loader consumers, map every important assertion to host adapter behavior versus retired plugin internals. Cover policy/claim/handoff, exclusive dispatch/no ordinary duplicate, enabled/disabled routes, Slack root/child/ambiguous-child, history registration, duplicate envelopes, identity/route isolation, bounded failures/silence and typing/send side effects. Identify the minimal host boundary contract that must remain if the plugin internals are fully external. Preserve unrelated assertions in mixed test files in recommendations.
4. Compare actual external assertions, not just titles/test counts, including dynamic Slack root/child orchestration and source-history identity migration. State exactly which host paths are not exercised by external plugin tests. Avoid both blanket deletion and indefinite retention of redundant plugin-internal assertions.
5. Identify whether a generic fixture, an installed public external plugin fixture or existing adapter tests are the smallest adequate future test seam; no new engine, vendoring or restoring bundled implementation. Cite current public API/package contract and existing evidence; do not build/install/run tests to decide.
6. Return SAFE_SCOPED_REMOVAL / NO_FURTHER_REMOVAL_PROVEN / INCONCLUSIVE plus exact remove/retain/adapt/blocked matrix, minimal future implementation scope and verification requirements. Separate source retirement from runtime discovery/installed integration and real provider proof.

# Safety and verification

Investigation only: write markdown under this repository's plans/. No implementation/deletion, test runs/builds/reproductions, source imports/copying, package installation, live requests/messages, runtime/config/scheduler/data changes, restarts/deployments, lifecycle commands or gate releases. This offline scope overrides general host-install/live-test guidance. Sibling inspection uses file read/search tools only; no .git, dependencies, secrets/credentials, private runtime/state/data. Verify each conclusion through exact current file/line/assertion references and existing evidence provenance. Mark stale or conflicting artifacts unknown. Do not inspect pipeline statuses, coordinate other agents or wait for another investigation.
