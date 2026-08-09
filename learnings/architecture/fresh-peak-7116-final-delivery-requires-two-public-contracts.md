---
title: "Final delivery requires two public contracts"
date: 2026-08-07
category: architecture
component: shared
tags: [deliberation, plugin-sdk, delivery, authority]
---

Do not implement the Deliberation final-provider adapter until both independent contracts exist.

- KM must provide a versioned immutable delivery envelope plus durable provider-invocation acknowledgement. Reservation and completion APIs alone cannot establish at-most-once invocation.
- The public Plugin SDK must provide an account-bound, non-durable one-shot sender with target-bound success evidence or a closed failure. `sendDurableMessageBatch` is unsuitable because its durable lifecycle owns retry and recovery semantics.

Do not bypass these missing seams by importing another extension's local runtime API. The minimal generic SDK seam is a lazy `sendOneShot` capability accepting exact channel, account, target, and text, performing exactly one provider invocation with no persistence, retry, replay, or reroute.
