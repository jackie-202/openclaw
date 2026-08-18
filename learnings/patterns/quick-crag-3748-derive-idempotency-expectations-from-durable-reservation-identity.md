---
title: "Derive idempotency expectations from durable reservation identity"
date: 2026-08-14
category: patterns
component: e2e
tags: [idempotency, delivery, reservation, assertion-quality]
---

The initial provider assertion populated its expected idempotency key from the observed provider call, making it tautological; a prefix check only proved formatting. The meaningful invariant is that the provider key is derived from the persisted reservation attempt.

Assert the exact value, such as `provider:${reserved.reservation.attemptId}`, and correlate it with persisted invocation evidence. Expected identities should come from durable upstream state, never from the output under test.