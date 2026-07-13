---
title: "Serialize repository gates protected by a shared lock"
date: 2026-07-13
category: tooling
component: ci-cd
tags: [lint, typecheck, timeout, locking]
---

Running core lint and typecheck in parallel did not improve throughput because the repository's heavy-check lock serialized them. Both commands exceeded the 120-second shell timeout and exited with code 143, which looked like gate failures despite no reported findings at that point.

Run lock-protected heavy gates sequentially and assign a timeout that covers lock wait plus execution time. Treat exit code 143 with timeout metadata as infrastructure termination, not evidence of a lint or type error.
