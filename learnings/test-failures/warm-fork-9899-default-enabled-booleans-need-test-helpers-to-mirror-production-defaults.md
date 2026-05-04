---
title: "Default-enabled booleans need test helpers to mirror production defaults"
date: 2026-05-03
category: test-failures
component: backend
tags: [test-helpers, defaults, trajectory, tsgo, cron]
---

After introducing the optional `trajectory` field, the implementation treated trajectory as enabled by default, but an existing cron test helper had to be fixed to default `trajectoryEnabled` to `true` as well. Without that alignment, repo TypeScript test checks (`pnpm tsgo:core:test`) exposed the mismatch.

Avoid this class of failure by updating builders, fixtures, and helper factories at the same time you introduce optional config flags with implicit defaults. Production behavior and test scaffolding must encode the same default semantics, or targeted tests may pass while broader type-aware test suites fail.
