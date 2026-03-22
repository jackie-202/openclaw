---
title: "Dispatch: inbound claim broadcast vs message_received context"
date: 2026-03-21
category: architecture
component: backend
tags: [plugins, hooks, dispatch, testing]
---

# Broadcast inbound_claim behavior in dispatch

When wiring `runInboundClaim` into `dispatchReplyFromConfig`, the broadcast claim event and the `message_received` context are not identical.

- `runInboundClaim` receives conversation identifiers derived from inbound claim context (for grouped/threaded inputs this can resolve to scoped IDs like `-10099:topic:77` with `parentConversationId`).
- `runMessageReceived` context can still carry the route-oriented conversation reference (for example `telegram:-10099`) used for message_received observability.

Practical testing rule:

1. Assert `runInboundClaim` and `runMessageReceived` arguments independently.
2. Do not assume their `conversationId` values always match in thread/group channels.
3. For plugin-owned bindings with targeted claim status `handled`/`declined`/`error`, broadcast `runInboundClaim` remains uncalled because those paths return early.
4. For fallback paths (`missing_plugin`/`no_handler`) and unbound conversations, broadcast `runInboundClaim` runs before agent dispatch.
