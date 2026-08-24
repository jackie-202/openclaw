---
title: "Ověřené směrování vláken odděluje source parent od thread ID"
date: 2026-08-21
category: architecture
component: shared
tags: [deliberation, plugins, routing, thread-identity, wire-contract, provenance]
file_type: rules
---

# Authenticated thread routing separates the source parent from the reply anchor

For plugin `inbound_claim`, a threaded provider event can expose two different route facts: `PluginHookInboundClaimContext.parentConversationId` identifies the configured parent source, while `PluginHookInboundClaimEvent.threadId` identifies the existing reply thread. Treating `conversationId` as both facts causes a Discord thread message either to miss its configured parent pipeline or to derive the wrong delivery anchor.

At admission, validate agreement among event/context provider, account, direct conversation, parent conversation, message ID, and thread evidence before selecting the indexed pipeline. Match a Discord thread through the authenticated parent channel and preserve its thread ID; match a root through the source channel and use the provider event ID as the new reply-thread anchor. Slack keeps the channel route stable and uses its validated root timestamp as the thread anchor.

Keep `providerEventId` as the per-message intake and dedupe identity. The thread anchor supplies history and delivery context only, so multiple messages in one thread remain separate intakes.

When the external owner contract has not adopted new producer fields, version the proposed producer extension in an owner-local overlay and state the consumer adoption blocker explicitly. Do not mutate a pinned external-owner mirror or present local hashes as proof of external acceptance.
