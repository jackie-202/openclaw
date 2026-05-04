---
title: "Use concrete Vitest file globs when directory targets hit the wrong project config"
date: 2026-05-03
category: tooling
component: tooling
tags: [vitest, pnpm-test, project-routing, cron, trajectory]
---

Running `pnpm test` with a directory argument was not reliable in this repo. `pnpm test src/cron/` and `pnpm test src/trajectory/` were routed into Vitest configs that excluded those directories, producing confusing `No test files found` failures or false-success no-op runs. The reliable workaround was to pass concrete file globs or explicit test files instead, for example `pnpm test "src/cron/**/*.test.ts"` and explicit `src/trajectory/*.test.ts` paths.

Reuse this when validating scoped changes in a multi-project Vitest setup: prefer concrete test file patterns over directory-form arguments unless you already know the repo's test-project router maps that directory to the intended config.
