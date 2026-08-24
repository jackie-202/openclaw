---
title: "Completion state requires positive evidence"
date: 2026-08-22
category: architecture
component: shared
tags: [deliberation, delivery, receipts, idempotency, conflicts]
file_type: rules
---

# Completion state requires positive evidence

For Deliberation delivery, durable invocation changes the error default. Once invocation is recorded, an arbitrary thrown transport or adapter error cannot prove that the platform rejected the message; only an explicit closed `rejected` result may become `FAILED`. Timeouts, connection loss, malformed success receipts, and unexpected adapter exceptions remain unresolved and must not trigger completion or retry.

`SENT` also needs positive, unique evidence: one raw canonical message ID must equal the receipt primary ID, its sole platform ID, and its sole part ID. KM responses must contain exactly one matching durable attempt, with unique attempt and provider-attempt identities, before replay evidence can be accepted.

Keep conflict interpretation at the operation owner. A shared HTTP helper should preserve non-2xx status and error code; reservation may translate its expected CAS/control conflicts into closed outcomes, while completion must retain a 409 conflict instead of collapsing it into a schema error.
