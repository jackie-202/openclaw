---
title: "Crabbox check:changed can fail before repo checks run"
date: 2026-07-01
category: tooling
component: ci-cd
tags: [crabbox, check-changed, fallback, verification]
---

`pnpm check:changed` delegated to Blacksmith Testbox via Crabbox and failed at the local Crabbox wrapper sanity check (`selected binary failed basic --version/--help sanity checks`) before any repository lint/type/test checks executed. When this happens, do not treat it as a code failure. Record it as tooling-blocked and run scoped local fallback checks for the touched lanes, such as focused tests, scoped lint, scoped format, type checks, and build where appropriate.
