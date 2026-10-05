---
title: "Plugin SDK test helpers require aligned public metadata and production build selection"
date: 2026-09-30
category: architecture
component: tooling
tags: [openclaw, plugin-sdk, exports, packaging, testing]
file_type: checklist
---

# SDK test helpers need aligned public metadata and production build selection

When exposing an OpenClaw SDK helper to installed external plugins, adding `package.json#exports` alone is insufficient. `scripts/lib/plugin-sdk-private-local-only-subpaths.json` determines `publicPluginSdkEntrypoints`, which `tsdown.config.ts` uses for production JS emission; `package.json#files` can also separately exclude generated JS and declarations. `scripts/lib/plugin-sdk-deprecated-public-subpaths.json` may still classify a formerly local-only test helper as deprecated after publication.

For `plugin-test-api` and `test-env`, the compiler inventory already includes both. Promotion therefore means removing them from local-only classification, syncing only the two new export keys with `pnpm plugin-sdk:sync-exports`, removing four explicit pack exclusions, reconciling deprecated metadata and docs, then checking build output, pack inventory, and imports from an isolated consumer. Existing published exports use `types` and `default` conditions. The bundled-plugin build-entry test covers another owner; `src/plugins/contracts/plugin-sdk-package-contract-guardrails.test.ts` is the focused package export contract test.
