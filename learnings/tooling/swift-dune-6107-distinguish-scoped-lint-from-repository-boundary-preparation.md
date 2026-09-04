---
title: "Distinguish scoped lint from repository boundary preparation"
date: 2026-08-25
category: tooling
component: tooling
tags: [oxlint, plugin-sdk, typescript, validation, dependencies]
---

The repository's `run-oxlint.mjs` wrapper performed plugin-SDK declaration preparation before linting and failed on unrelated missing `@modelcontextprotocol/sdk/shared/transport.js` types. Running `pnpm exec oxlint` directly on the changed files verified task-scoped lint independently. When a wrapper fails during prerequisite generation, report that gate separately and use the underlying scoped tool to determine whether the edited files themselves are clean; do not mislabel infrastructure or dependency failures as lint findings.
