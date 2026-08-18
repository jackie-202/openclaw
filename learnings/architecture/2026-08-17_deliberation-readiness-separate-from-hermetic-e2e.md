---
title: "Readiness is a separate gate from hermetic E2E success"
date: 2026-08-17
category: architecture
component: e2e
tags: [deliberation, e2e, readiness, contract-provenance, fail-closed]
file_type: rules
---

# Readiness is a separate gate from hermetic E2E success

For a cross-repository Deliberation rollout, repository-local E2E tests can prove OpenClaw orchestration but cannot prove that every upstream batch slice produced accepted evidence.

Use two independent gates:

1. Exercise the registered plugin through `createTestPluginApi`, a loopback KM HTTP fake, injected channel history, keyed state, and fake outbound adapters. This proves public OpenClaw intake, history, KM-client, final-delivery, receipt, replay, and sole-send seams without importing another plugin's internals.
2. Inventory every required sequence's final checkpoint or supplied pipeline artifact and verify accepted contract provenance. Missing evidence must produce `NOT READY` even when all hermetic tests pass.

Do not fill missing sequence evidence by inspecting the owner repository when the task forbids traversal, and do not treat mirrored contract hashes as proof that every required implementation slice was completed. Name the exact missing artifact in the verdict so an operator can close the gate later without rerunning discovery.
