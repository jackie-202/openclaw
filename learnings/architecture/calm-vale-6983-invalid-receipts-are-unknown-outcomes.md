---
title: "Invalid provider receipts are unknown delivery outcomes"
date: 2026-08-17
category: architecture
component: backend
tags: [deliberation, delivery, receipts, recovery, slack]
file_type: rules
---

# Treat invalid receipts as unknown delivery outcomes

When a durable sender records invocation before calling a provider, a resolved provider call and a rejected provider call have different recovery semantics.

If the provider rejects before confirming delivery, the sender can complete a bounded definitive `FAILED` result. If the provider call resolves but its receipt is missing, sentinel-valued, malformed, or oversized, the message may already exist on the platform. Completing that attempt as `FAILED` is unsafe because a retry can duplicate delivery and the durable record misstates what happened.

Keep provider invocation failure handling separate from receipt validation:

1. Record the durable invocation marker.
2. Catch provider-call rejection and complete a classified `FAILED` result.
3. Validate receipt and message IDs only after the provider call resolves and outside that catch.
4. If resolved-call evidence is invalid, leave the attempt unresolved so the durable owner can terminalize it as `DELIVERY_UNKNOWN`.

Provider adapters that detect missing IDs after their transport helper resolves need a distinct unknown-outcome error. The lifecycle adapter must rethrow that error rather than classifying it as a provider rejection.

Contract projections must use the same bounds as completion input. Otherwise the wire schema can accept persisted provider evidence that the runtime client correctly rejects.
