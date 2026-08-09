---
title: "Deliberation final delivery requires explicit one-shot authority"
date: 2026-08-07
category: architecture
component: shared
tags: [deliberation, plugin-sdk, delivery, contracts]
file_type: rules
---

# Do not substitute durable delivery for one-shot provider authority

For Deliberation final delivery, a reservation and completion protocol is not enough to safely activate a provider sender. The KM contract must first publish an immutable, versioned delivery envelope and durably acknowledge provider invocation before a call is made. This preserves the owner of the post-invocation unknown state.

The public Plugin SDK's `sendDurableMessageBatch` cannot stand in for a one-shot provider call. Its durable runtime owns queueing and recovery semantics that Slice 5B explicitly reserves for KM. A plugin must not bypass this with private core imports or invent an envelope schema.

When either contract is absent, record the capability, exact public APIs inspected, concrete mismatch, and the smallest generic seam in the task result. Mark TDD as explicitly skipped when no genuine pre-implementation RED exists; never retrofit or claim historical RED evidence that was not captured.
