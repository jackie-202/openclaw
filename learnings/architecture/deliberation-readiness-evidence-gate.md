---
title: "Deliberation: keep rollout readiness separate from local behavior proof"
date: 2026-08-17
category: architecture
component: backend
tags: [deliberation, slack, readiness, evidence, e2e, fail-closed]
file_type: rules
---

# Keep rollout readiness separate from local behavior proof

A hermetic registered-plugin test can prove the OpenClaw side of a cross-provider flow without proving that an external owner is ready for rollout. For Deliberation, the useful local harness registers the real plugin and joins captured intake hooks, keyed Slack child-to-thread state, Gateway history reads, the real KM HTTP parser, the final-delivery service, and fake provider adapters. This catches orchestration drift while avoiding a duplicate test implementation of production logic.

Readiness remains a separate evidence gate. Passing root/reply, destination-matrix, fail-closed, replay, and receipt tests cannot replace missing stable final evidence from upstream batch slices or an unavailable mandatory proposal. Report `NOT READY` with the exact absent artifacts instead of traversing a forbidden repository or synthesizing the owner's contract.

For bounded pilots, keep the runbook asymmetric and reversible: one explicitly allowlisted source, one immutable destination, zero fallback routes, no native destination activation, observable provider-call counts, and fail-closed disable steps. Preserve the configured source while disabled when the runtime uses that route to keep source traffic silent.
