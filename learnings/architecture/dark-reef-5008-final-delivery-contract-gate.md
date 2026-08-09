---
title: "Gate Deliberation final delivery on both contracts"
date: 2026-08-07
category: architecture
component: shared
tags: [deliberation, plugin-sdk, provider-delivery, authority]
file_type: rules
---

# Gate Deliberation Final Delivery On Both Contracts

The Deliberation final-delivery adapter cannot be implemented from a reservation alone. Before adding code, verify both independently owned contracts:

- KM supplies a pinned, immutable delivery envelope plus a durable provider-invoked acknowledgement.
- The public Plugin SDK supplies an account-bound, non-durable, one-shot sender that returns a target-bound receipt.

The checked-in KM v1 wire contract exposes only `ready`, `reserve`, `complete`, and `reconcile`. Its public SDK alternative, `sendDurableMessageBatch`, owns durable generic delivery and is therefore unsuitable for a no-retry provider boundary. Do not fabricate the missing envelope, import core/private Discord code, or route through sessions or message tools. Report the two missing contracts and request the smallest generic sender seam instead.
