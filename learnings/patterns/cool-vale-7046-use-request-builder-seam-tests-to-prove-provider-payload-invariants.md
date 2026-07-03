---
title: "Use request-builder seam tests to prove provider payload invariants"
date: 2026-07-01
category: patterns
component: backend
tags: [tests, provider-params, onPayload, red-green]
---

The task proved the bug without network calls by testing the OpenAI-compatible request-builder seam. Chat completions used `onPayload` to capture the outgoing payload and throw before network I/O; Responses tested `applyCommonResponsesParams` directly. This produced narrow RED failures exactly on the remapping behavior and fast GREEN verification. Reuse this pattern for provider payload changes instead of broader integration tests when the invariant is purely request-shaping.
