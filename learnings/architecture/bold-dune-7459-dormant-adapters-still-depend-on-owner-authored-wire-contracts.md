---
title: "Dormant adapters still depend on owner-authored wire contracts"
date: 2026-08-17
category: architecture
component: shared
tags: [contracts, km, rollout, provenance]
---

Repository-local Slack delivery can be fully implemented and tested while remaining unusable end to end if the pinned KM owner contract still accepts only Discord targets. Do not widen copied schemas or fabricate provenance from the consumer repository. Keep the adapter rollout-disabled, record the contract mismatch explicitly, and require the owning system to update reservation, invocation, and completion schemas before activation.