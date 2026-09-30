---
title: "Oddělit timeout autorizace od doručení"
date: 2026-09-14
category: architecture
component: backend
tags: [deliberation, timeout, lease, idempotency]
file_type: rules
---

# Bound authorization separately from delivery

When a KM invocation authorizes a provider send after synchronous freshness I/O, it is a pre-send phase, not provider-delivery evidence. Keep its timeout separate from short health and readiness checks, cap it by the remaining reservation lease, and reject expired leases before transport.

Do not retry after a lost, malformed, mismatched, or timed-out authorization response. The adapter may send only after it receives and validates the exact invocation evidence. A provider error after that point remains delivery uncertainty and must not be reclassified as authorization failure.

For fake-timer tests, replace `AbortSignal.timeout` with an abort-aware timer implementation. Node's native timeout signal is not advanced by Vitest fake timers, which can otherwise make a delayed-response timeout test pass without exercising the timeout boundary.
