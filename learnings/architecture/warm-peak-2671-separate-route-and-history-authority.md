---
title: "Preserve parent route authority while storing exact history identity"
date: 2026-08-21
category: architecture
component: shared
tags: [deliberation, discord, threads, history, route-authority, fail-closed]
file_type: rules
---

# Preserve parent route authority while storing exact history identity

Discord child events carry three distinct facts: the configured parent channel that owns pipeline admission, the direct child thread that owns history, and the delivery target. A history reader that receives only the parent-scoped `sourceTarget` cannot reconstruct whether an event was root or child without guessing.

At authenticated admission, derive a separate exact history target from the agreed direct conversation and persist it atomically under `sourceTarget + providerEventId` before external intake. History requests should authorize the parent source first, then require that stored mapping; they must never derive history from the delivery target or fall back to the parent when a child mapping is absent.

For Discord response validation, the runtime returns full `APIMessage` objects and the upstream `discord-api-types` contract requires `channel_id`. Carry that field through the existing SDK message type and reject rows whose `channel_id` differs from the stored history target. This turns sibling/parent contamination in mocks or adapters into a fail-closed error instead of trusting only the request argument.
