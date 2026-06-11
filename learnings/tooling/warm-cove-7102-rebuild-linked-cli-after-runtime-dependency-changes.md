---
title: "Rebuild linked CLI after runtime dependency changes"
date: 2026-06-10
category: tooling
component: tooling
tags: [openclaw, dist, linked-cli, runtime-deps, rebuild]
---

The task diagnosis showed a mismatch between source and the executable runtime path: source code had already moved to `@openclaw/proxyline`, but the linked CLI was still loading stale built output from `dist` that imported `global-agent`. Updating `package.json` and `npm-shrinkwrap.json` alone was not enough; the fix only became real after a full `pnpm build`, which regenerated the runtime artifacts the CLI actually executes. Reuse this pattern whenever CLI behavior disagrees with source: verify what `dist` imports, rebuild before retesting, and treat linked/built entrypoints as the source of truth for runtime debugging.
