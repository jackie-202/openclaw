---
title: "Dokončení retirement vyžaduje oddělený důkaz loaderu a assertions"
date: 2026-10-04
category: architecture
component: tooling
tags: [deliberation, acceptance, public-package, scenario-mapping, planning]
file_type: checklist
---

# Separate public-loader proof from transferred assertion proof

Planning task `task-29e25aa6-c5d5-4da5-ac89-e98c4538a2fc` found two independent
acceptance gaps after successful bundled source retirement. Discord/Slack loaders
still enabled Deliberation against a bundled root, while the external suite receipt
provided case counts without expanded Slack orchestration assertions.

- Obtain an owner-exported offline package with entry, manifest, public API/test
  contract and dependency setup. A package name and source-suite log are not a
  runnable package input. Load through `plugins.load.paths` and assert exactly one
  config-origin record plus plugin-owned hooks in each real consumer.
- Map root and child cases individually to immutable owner test locations and
  expected values: producer identity, bounded history, unrelated-thread exclusion,
  reservation/invocation/completion and receipt identity, one Discord send and zero
  Slack sends. Dynamic titles and count parity cannot establish these assertions.
- Keep inherited source-absence RED attributed to retirement. Capture fresh loader
  GREEN separately; do not recreate RED by restoring already removed sources.
- Treat acquiring missing owner inputs as repair work, not a reason to mark the
  same partial checkpoint complete again.

Evidence: `plans/checkpoints/deliberation_bundled_plugin_retirement.md:91,122-124`
and `plans/handoffs/deliberation-plugin-retirement/accepted-host-contract.md:7-19`.
This learning records planning findings; no implementation or fresh tests ran.
