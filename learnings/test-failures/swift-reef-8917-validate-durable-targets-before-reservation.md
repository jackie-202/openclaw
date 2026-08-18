---
title: "Validate durable delivery targets before reservation"
date: 2026-08-14
category: test-failures
component: e2e
tags: [openclaw, deliberation, km-system, durable-fencing, cross-repository]
file_type: checklist
---

# Validate durable delivery targets before reservation

Cross-repository delivery consumers must receive the effective durable target in the KM ready item, not discover it only in the reservation response.

## Failure mode

If target parsing happens after `reserve`, a malformed durable target can leave a reservation active without a valid invocation or a terminal failure path. Re-polling may repeatedly encounter or recycle work that OpenClaw can never safely deliver.

## Boundary rule

The listener should expose the target selected by durable KM state on the ready item. The consumer validates that target before reservation, passes the prepared target into `reserve`, and then checks that the reservation response contains the same target and source provenance.

This ordering provides two distinct guarantees:

1. Invalid destinations are rejected before acquiring durable work.
2. A changed destination between readiness and reservation is detected as a fencing mismatch rather than sent to the fake or real provider.

Cross-repository tests should cover both the default source-derived route and the operator override route through ready, reserve, invoke, provider capture, completion, provenance assertions, and mismatch fencing.
