---
title: "Deliberation final delivery requires two public contracts"
date: 2026-08-07
category: architecture
component: shared
tags: [deliberation, plugin-sdk, delivery, authority]
file_type: rules
---

# Deliberation final delivery requires two public contracts

Do not implement the Deliberation final provider adapter until both independent contracts are available.

- KM must supply a versioned immutable delivery envelope and a durable provider-invoked acknowledgement. Reservations and completions alone cannot establish at-most-once invocation.
- The public Plugin SDK must expose an account-bound, non-durable one-shot sender with a target-bound receipt or closed failure. `sendDurableMessageBatch` is unsuitable because its durability lifecycle owns retry and recovery semantics.

A Deliberation plugin must not import another extension's local runtime API to bypass this gap. The smallest generic SDK addition is a lazy runtime `sendOneShot` capability that accepts exact channel, account, target, and text; makes one provider invocation with no retry, replay, reroute, or persistence; and returns closed target-bound evidence.
