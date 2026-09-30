---
title: "Bound authorization timeouts separately from provider uncertainty"
date: 2026-09-14
category: architecture
component: shared
tags: [deliberation, timeout, authorization, delivery, idempotency]
file_type: rules
---

# Bound authorization timeouts separately from provider uncertainty

When a delivery authorization endpoint does synchronous freshness work before returning durable invocation evidence, a shared short HTTP timeout can stop the adapter before any provider call. Do not turn the late authorization marker into proof of provider state or retry delivery.

Keep the provider send after exact invocation validation. Give the authorization request an explicit budget bounded by the reservation lease, preserve short timeouts for unrelated KM operations, and test delayed authorization with an abort-aware fake transport plus provider call counts. If the producer does not publish its maximum authorization duration, record that as a contract requirement instead of guessing a safe retry path.
