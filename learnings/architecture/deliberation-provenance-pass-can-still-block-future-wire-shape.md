---
title: "Deliberation: passing provenance does not satisfy a future wire shape"
date: 2026-08-16
category: architecture
component: backend
tags: [deliberation, contract, provenance, tdd, cross-provider]
file_type: rules
---

# Cross-provider delivery planning must verify target-shape provenance

A task description can name a future structured destination while the registered repository still pins an older target representation. For Deliberation, the current accepted fixture and parser use a `v1:<provider>:<account>:<channel>` string, while the pilot task expects `{ provider, accountId, channelId, threadId }`.

Before writing behavioral RED tests or production parsing code, locate repository-local owner evidence that fixes exact fields, optionality, bounds, lifecycle placement, equality semantics, and provenance hashes. If it is absent or contradictory, mark the implementation plan blocked rather than deriving a wire schema from prose or traversing the owner repository.

Provider capability is a separate question from wire authority. The existing generic Discord outbound adapter already supports `threadId`; that proves the host delivery seam can carry the value, but it does not authorize the KM target shape.
