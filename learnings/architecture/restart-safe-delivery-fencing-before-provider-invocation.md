---
title: "Restart-safe delivery fencing must precede provider invocation"
date: 2026-08-23
category: architecture
component: backend
tags: [deliberation, delivery, at-most-once, restart, reconciliation, not-sent]
file_type: decisions
---

# Restart-safe delivery fencing must be visible before invocation

When an external durable owner controls `ready` and reservation state, a process-local set of unknown attempts cannot enforce at-most-once delivery: it disappears on Gateway restart and cannot protect another worker.

Rejecting contradictory attempt history only while parsing a completion response is also too late. The second provider call has already happened by then.

The durable contract must expose enough closed reservation evidence for the sender to authorize the provider call before invocation. A first attempt is eligible directly. A later reservation is eligible only when durable predecessor evidence proves the prior reservation was never invoked or was reconciled to `NOT_SENT`; an invoked `DELIVERY_UNKNOWN` remains non-reservable. The plugin validates that evidence, then still uses the single canonical `ready -> reserve -> invoke -> send -> complete` path.

For cross-repository implementations, prove this with the real owner listener and disposable database across lease expiry and process/listener restart. A mocked in-memory client cannot establish restart safety.
