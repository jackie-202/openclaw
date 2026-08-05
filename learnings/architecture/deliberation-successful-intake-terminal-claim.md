---
title: "Deliberation terminal claim follows successful intake"
date: 2026-08-02
category: architecture
component: backend
tags: [deliberation, inbound-claim, discord, fail-closed, dispatch]
file_type: rules
---

# Deliberation claims only after successful intake

The Deliberation `inbound_claim` handler has two separate responsibilities: enqueue an eligible source message and tell core whether normal dispatch must stop. A successful `client.intake(...)` followed by `{ handled: false }` is a split-brain outcome: the KM receives the message, but core still runs the model and may publicly reply.

Return `{ handled: true }` only after the awaited intake resolves. Keep disabled, unmatched, malformed, and KM-error paths non-claiming; the independent `before_dispatch` source guard remains responsible for fail-closed silence in those cases.

Regression coverage should prove the chain in two layers:

- Plugin test: realistic Discord `channelId`, `accountId`, and canonical `conversationId: "channel:<id>"` enqueue exactly once and return a reply-free terminal claim.
- Core test: any terminal broadcast claim skips the reply resolver and every dispatcher send method.

Do not replace the independent guard with the success claim. The two hooks protect different states: successful ownership transfer versus fail-closed outage behavior.
