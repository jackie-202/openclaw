---
title: "Production-shape integration tests must exercise the real secret source"
date: 2026-08-25
category: test-failures
component: e2e
tags: [secretinput, integration-test, destination-integrity, fixtures]
---

An integration test initially claimed to cover the deployed configuration but still supplied an environment-backed credential. Autoreview caught that the production file-backed `singleValue` SecretInput path was never exercised. The corrected isolated lifecycle test resolved a disposable credential file through the deployed-shaped client and asserted the exact provider, account, channel, and thread through ready, reservation, invocation, provider call, and completion.

A production-shape fixture should reproduce the configuration mechanism, not merely an equivalent final value. For delivery lifecycles, also assert identity and destination at every boundary so independently generated fixture responses cannot hide target drift.
