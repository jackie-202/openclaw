---
title: "Scoped tests still serialize on the heavy-check lock"
date: 2026-08-17
category: tooling
component: ci-cd
tags: [testing, vitest, heavy-check-lock, concurrency]
---

Both `pnpm test` and the scoped `scripts/run-vitest.mjs` wrapper honor the repository heavy-check lock. A focused test can therefore wait behind another active test process and exceed a default command timeout even when the test itself is fast.

Do not interrupt the lock holder solely to run a regression check. Retry with sufficient timeout or wait for the wrapper to acquire the lock, then record the lock contention separately from test failures. Once acquired, the scoped wrapper remains useful for validating a single Vitest file.