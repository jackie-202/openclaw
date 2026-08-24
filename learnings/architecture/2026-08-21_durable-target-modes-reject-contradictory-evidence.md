---
title: "Durable target modes must reject contradictory inbound evidence"
date: 2026-08-21
category: architecture
component: shared
tags: [deliberation, pipeline-routing, delivery-target, discord, fail-closed]
file_type: rules
---

# Durable target modes must reject contradictory inbound evidence

Per-pipeline delivery cannot represent Discord source-default roots with only an optional `threadId`. The durable target needs a closed mode discriminator:

- `root` means an exact channel root and has no `threadId`.
- `thread` means an exact existing thread and requires `threadId`.
- `source_anchor` means a source message whose attached thread must be created or reused and requires the source message ID as `threadId`.

Persist both `pipelineId` and the complete target unchanged through intake, ready, reservation, invocation, completion, and historical attempt evidence. Provider adapters should consume that evidence directly instead of consulting current config or inferring mode from identifier shape.

The admission boundary must also reject contradictory evidence before deriving a mode. In particular, a Discord event with `threadId` but no authenticated `parentConversationId` is neither a proven child thread nor a root message. Silently ignoring that `threadId` misclassifies the event as a source anchor. Reject it fail-closed, and cover the negative case alongside valid root and child events.

For channel ownership, expose one narrow generic source-thread operation. Discord owns create-or-reuse behavior and returns the receipt from exactly one text send inside the resolved thread; callers must not pass a source message ID to ordinary exact-thread delivery.
