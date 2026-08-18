---
title: "Separate generic owner contracts from provider overlays"
date: 2026-08-17
category: architecture
component: shared
tags: [contracts, wire-schema, provider-adapters, provenance]
---

The KM owner contract needed generic structured destinations `{ provider, accountId, channelId, threadId? }`, while OpenClaw still required stricter Discord- and Slack-specific validation and evidence. The implementation kept the owner mirror provider-neutral and moved provider-specific vectors and constraints into `openclaw-overlay-v1.json`. Reuse this separation when mirroring externally owned protocols: preserve the owner's exact semantics in the mirror and enforce local adapter constraints in an explicit overlay rather than silently narrowing the shared wire contract.