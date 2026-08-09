---
title: "Gate provider adapters on public seams"
date: 2026-08-07
category: architecture
component: shared
tags: [deliberation, plugin-sdk, provider-delivery, authority]
file_type: rules
---

# Gate Provider Adapters On Public Seams

For a plugin-confined final-delivery adapter, distinguish a public sender that happens to exist from a sender that meets the authority contract. `channel-outbound` exposes `sendDurableMessageBatch`, but its durable batch semantics conflict with a provider call that must happen once with no retry, reconciliation, or reroute.

Before designing plugin code, read the owner-controlled delivery envelope and inspect the public SDK types. If the contract or an account-bound one-shot sender is unavailable, stop with an evidence-backed blocker rather than importing private core code or inventing an alternate delivery schema.
