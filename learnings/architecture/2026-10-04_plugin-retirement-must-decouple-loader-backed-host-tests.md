---
title: "Plugin retirement must decouple loader-backed host tests"
date: 2026-10-04
category: architecture
component: tooling
tags: [plugins, retirement, public-api, scenario-transfer, testing]
file_type: rules
---

# Find consumers through loader configuration, not only imports

During planning for `calm-fork-3432`, direct retired-path searches missed real
Deliberation consumers. Discord and Slack integration tests set the bundled root
to `extensions`, enable `plugins.entries.deliberation`, then expect real hooks and
intake requests. They contain no direct import of the retired package.

- Inspect `setBundledPluginsDirOverrideForTest`, enabled plugin configuration and
  loader calls alongside imports when retiring a bundled implementation.
- Keep real domain integration scenarios on the separately packaged public entry;
  request a repo-local immutable test artifact and resolution contract if absent.
  An accepted package name and external test log do not supply runnable local code.
- Replace generic discovery tests that symlink retired sources with tiny generated
  metadata fixtures. Do not use those fixtures to duplicate domain behavior.
- Keep negative package exclusions, discovery protections and stale-index rejection
  separate from executable consumers; source deletion does not remove stale dist.
- Compare expanded parameterized scenarios and assertions where test bytes changed.
  The retirement manifest's empty literal-title arrays for orchestration coexist
  with two passing native cases; filename/count parity cannot prove their semantics.

Evidence: `plans/handoffs/deliberation-plugin-retirement/accepted-host-contract.md`,
its manifest/log, `src/plugins/source-checkout-runtime.test.ts:53-67`,
`extensions/discord/src/monitor/message-handler.deliberation.test.ts:138-186`,
`extensions/discord/src/monitor/message-handler.process.test.ts:608-643`, and
`extensions/slack/src/monitor/message-handler.deliberation.test.ts:106-161`.
This records planning discoveries, not implementation or freshly executed tests.
