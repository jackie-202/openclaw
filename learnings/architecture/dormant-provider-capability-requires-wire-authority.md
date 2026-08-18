---
title: "Dormant provider capability still requires wire authority"
date: 2026-08-16
category: architecture
component: shared
tags: [deliberation, slack, wire-contract, provider-routing, rollout]
file_type: rules
---

# Dormant provider capability still requires wire authority

When adding a dormant final-delivery provider, do not treat the absence of a live route as permission to widen an immutable external target schema. Check both the runtime parser and the accepted repository fixture: here the OpenClaw task required Slack support, but `km-wire-v1.json` still fixed `deliveryTarget.provider` to `discord`.

The implementation plan should therefore separate two gates:

1. Obtain KM-owner evidence authorizing the new provider and exact target bounds.
2. Only then add the dormant adapter through the generic channel outbound seam and prove that no config/default/live route activates it.

This preserves fail-closed contract ownership while still allowing the provider implementation and rollout decision to remain separate changes.
