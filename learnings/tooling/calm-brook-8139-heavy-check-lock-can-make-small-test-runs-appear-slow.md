---
title: "Heavy-check lock can make small test runs appear slow"
date: 2026-06-10
category: tooling
component: tooling
tags: [test-lock, vitest, serialization, latency, local-checks]
---

A targeted `pnpm test` invocation spent over a minute waiting behind a local heavy-check lock before the actual Vitest shards ran, even though the tests themselves completed quickly. The delay was caused by serialized access to the shared heavy-check pipeline, not by test failures.

Avoid misdiagnosing this as flaky tests or a hung runner. Reuse this understanding when estimating verification time, reading CI-like local logs, or deciding whether a test run is actually blocked versus simply queued behind another check.
