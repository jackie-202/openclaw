---
title: "Cross-repository delivery proof and contract drift"
date: 2026-08-14
category: test-failures
component: e2e
tags: [openclaw, deliberation, km-system, integration-testing, durable-fencing]
file_type: checklist
---

# Cross-repository delivery tests must verify both routing and durable fences

An isolated final-delivery integration test needs more than an assertion on the fake provider call. The useful proof chain is:

1. Intake preserves the canonical source identity while independently carrying the configured final target.
2. The real spool is advanced through source-context capture, drafting, freshness attachment, and review so the ready envelope is created by KM rather than fabricated in TypeScript.
3. Rejected invocation and completion targets are followed by immediate spool reads. Compare the attempt projection before and after rejection so a `409` cannot hide incorrectly persisted evidence.
4. The fake provider key must equal `provider:<reserved attemptId>` exactly, and the same identity must appear in durable invocation/completion evidence.

The KM source-context snapshot has a stricter message projection than the intake record. It requires exactly `providerEventId`, `senderId`, `senderIsBot`, `eventType`, `occurredAt`, and `content`; passing the raw spool message adds fields such as `inboundId` and fails review-contract validation.

A copied protocol contract does not prove the executable checkout implements it. In this task OpenClaw's contract declared optional intake `deliveryTarget`, while the available KM listener's `_handle_intake` still closed over fields without it and returned `400 SCHEMA_INVALID`. Keep that failure actionable rather than adding a test-only compatibility shim, because such a shim would stop proving the real cross-repository boundary.
