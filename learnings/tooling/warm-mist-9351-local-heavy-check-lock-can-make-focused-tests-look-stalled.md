---
title: "Local heavy-check lock can make focused tests look stalled"
date: 2026-06-10
category: tooling
component: tooling
tags: [tests, locking, vitest, local-runner, false-alarm]
---

A focused `pnpm test` invocation was delayed by the local heavy-check lock and printed repeated wait messages for 15s and 30s before any shard started. The run eventually completed successfully, so the delay was contention, not a hung test process. Reuse this interpretation when the project test wrapper reports queueing behind an existing heavy-check holder: wait for the lock owner unless there is evidence of a real dead process. Avoid treating these wait messages as immediate proof that Vitest or the wrapper is broken.
