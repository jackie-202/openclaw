---
title: "Keep routing identity outside closed external wires"
date: 2026-08-16
category: architecture
component: shared
tags: [deliberation, routing, thread-history, sqlite, wire-contract]
---

Slack required both the child message timestamp and normalized thread timestamp, but adding `threadId` to the established KM request or encoding it into `sourceTarget` would have changed the external contract.

Preserve the child provider event ID in the existing wire shape and store child-to-thread correlation in durable plugin state. Resolve the thread identity internally when reading history. This pattern adds provider-specific routing metadata without leaking it into a closed shared protocol.