---
title: "Safety audits must cross abstraction and fixture boundaries"
date: 2026-08-21
category: architecture
component: shared
tags: [audit, deliberation, contracts, fixtures, delivery, at-most-once]
file_type: checklist
---

# Safety audits must cross abstraction and fixture boundaries

A passing hash check or a single mocked adapter call is not enough to prove delivery safety.

For mirrored closed contracts, validate each fixture request and response semantically against the current schema. Hashes prove byte stability, but stale fixtures can still omit newly required fields while selective contract assertions pass.

For at-most-once delivery, trace below the feature-owned sender interface into the channel adapter and transport. One feature-level `send` invocation may contain webhook-to-bot fallback or SDK retry behavior, so the audit ledger must separately count feature calls, channel-adapter calls, and actual provider/API attempts.

When external systems are outside scope, report their convergence as unknown rather than treating repository-local provenance text as independent deployment proof.
