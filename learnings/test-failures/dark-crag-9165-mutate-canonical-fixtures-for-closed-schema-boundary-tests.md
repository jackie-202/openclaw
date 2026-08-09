---
title: "Mutate canonical fixtures for closed-schema boundary tests"
date: 2026-08-09
category: test-failures
component: backend
tags: [contract-testing, fixtures, schema-validation]
---

Malformed contract fixtures can fail on an earlier missing or invalid field instead of reaching the boundary under test. Build a canonical, fully valid typed fixture first, then mutate exactly one field per negative case. This produced precise assertions for `deliveryEnvelope`, `deliveryEnvelopeDigest`, and `reviewedTextHash` and prevents stale fixtures from masking parser behavior.
