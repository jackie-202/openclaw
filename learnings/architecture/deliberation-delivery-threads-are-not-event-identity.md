---
title: "Deliberation delivery threads are not event identity"
date: 2026-08-25
category: architecture
component: shared
tags: [deliberation, discord, routing, thread-identity, exactly-once]
file_type: rules
---

# Deliberation delivery threads are not event identity

In Deliberation admission, `providerEventId`, `sourceThreadId`, history identity, and the provider delivery target serve different owners. A Discord root message may still need its message ID for KM correlation, but that does not make the message snowflake a Discord channel or thread destination.

For a narrow routing repair, preserve the existing intake and exactly-once identity fields and derive delivery threading separately:

- Discord root source-default: source channel, no delivery `threadId`.
- Discord child source-default: authenticated parent channel plus the actual child thread channel ID.
- Slack root/reply: retain the normalized Slack thread timestamp.

Test this at both boundaries: route admission must produce the correct durable target, and the final provider invocation must omit or forward `threadId` exactly. Do not repair a bad durable target late in the final adapter, because reservation and invocation evidence must remain immutable.
