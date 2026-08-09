---
title: "Strict admission preserves invalid duplicate facts"
date: 2026-08-07
category: architecture
component: backend
tags: [admission, fail-closed, discord, deliberation, identity]
file_type: rules
---

# Strict admission must preserve invalid duplicate facts

When an inbound hook repeats provider, account, channel, or provider-event-id facts across its event and context, validation must distinguish three states: omitted, present and valid, and present but invalid.

A helper that normalizes malformed values to `undefined` and then filters `undefined` before agreement checks is fail-open. For example, malformed `event.conversationId = "channel:source:extra"` can disappear, leaving a valid context conversation to admit the request. Validate every present representation first, then compare normalized values only after all present values are known valid.

Likewise, newly declared authoritative vocabulary such as provider, event type, and inbound event kind must be required at the admission boundary. Optional public type fields can preserve additive SDK compatibility, but the owning producer must reject missing values rather than silently treating them as defaults.

Focused rejection tests should assert that malformed duplicates, missing vocabulary, conflicts, processing routes, and wrong accounts all make zero downstream client calls.
