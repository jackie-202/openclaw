---
title: "Claim inbound events only after durable intake"
date: 2026-08-02
category: architecture
component: backend
tags: [inbound-claim, durability, fail-closed, dispatch]
---

A configured source event should return `{ handled: true }` only after KM intake succeeds, terminally preventing ordinary agent dispatch without emitting a reply. Unmatched routes remain unclaimed, while intake failures rely on the independent fail-closed dispatch hook. Preserve this ordering so an event is never claimed before durable intake, and verify both the plugin handler and generic dispatch boundary, including absence of tool, block, and final replies.
