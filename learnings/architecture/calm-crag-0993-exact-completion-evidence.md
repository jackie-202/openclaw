---
title: "Dokončení musí svázat přesnou identitu životního cyklu"
date: 2026-08-22
category: architecture
component: shared
tags: [deliberation, completion, replay, receipts, cas]
file_type: rules
---

# Exact completion evidence spans lifecycle semantics

When validating a KM completion replay, matching the attempt ID, envelope, target, idempotency keys, and provider evidence is not enough. The returned attempt must also match the reservation ordinal, and its `reservedRecordVersion` must equal the version on which the reservation CAS ran.

In this protocol, the reservation response's `version` is already incremented. Therefore the exact comparison is:

```ts
attempt.ordinal === reservation.ordinal;
attempt.reservedRecordVersion === reservation.version - 1;
```

Comparing `reservedRecordVersion` directly with `reservation.version` rejects valid replays. Omitting the comparison accepts stale lifecycle evidence.

Terminal outcome evidence must also be mutually exclusive. A `FAILED` attempt may carry failure class/evidence but must keep `providerReceiptId` and `providerMessageId` null. Non-null platform IDs contradict definitive failure and can hide an accepted send behind a failed state.

Focused replay tests should include:

- mismatched ordinal;
- mismatched pre-CAS record version;
- exact replay acceptance;
- `FAILED` plus a non-null receipt ID;
- `FAILED` plus a non-null message ID.
