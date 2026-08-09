---
title: "Separate scoped verification from unrelated dirty-worktree failures"
date: 2026-08-09
category: test-failures
component: tooling
tags: [test-isolation, dirty-worktree, vitest, verification]
---

The focused timestamp suite passed all 27 tests, while a broader combined run failed two `km-client.test.ts` reservation-schema cases affected by concurrent, pre-existing KM changes. The package TypeScript gate and scoped autoreview still passed.

In heavily modified worktrees, run the narrowest relevant test first, then broader gates. Record unrelated failures with their exact suite and error instead of treating them as regressions from the scoped change. Use focused tests, type checking, diff checks, and scoped review together to establish evidence without modifying unrelated work.
