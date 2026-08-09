---
title: "Constrain broad Vitest runs when output stalls"
date: 2026-08-09
category: tooling
component: ci-cd
tags: [vitest, workers, timeouts, diagnostics]
---

The broad extension test command produced no output for 120 seconds and was killed by the tool timeout. Re-running with `OPENCLAW_VITEST_MAX_WORKERS=1` and a larger execution bound completed quickly enough to expose the actual failing tests. For large sharded suites in constrained environments, reduce worker concurrency before treating silence as a deadlock.
