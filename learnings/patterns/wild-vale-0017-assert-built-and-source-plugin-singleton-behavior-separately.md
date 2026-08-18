---
title: "Assert built and source plugin singleton behavior separately"
date: 2026-08-18
category: patterns
component: tooling
tags: [plugin, singleton, build, runtime, testing]
---

For plugin services that must have sole-send ownership, add both source-runtime and built-plugin assertions for the exact service identity and cardinality. This catches cases where TypeScript source is correct but emitted plugin metadata/runtime assets are stale or duplicate the final-delivery service. Keep focused behavior tests alongside `pnpm build` and the built-plugin singleton verification.