---
title: "Zachovej identitu provider eventu pred agregaci kanalu"
date: 2026-08-21
category: architecture
component: shared
tags: [deliberation, inbound, debounce, discord, slack, source-ownership]
file_type: rules
---

# Preserve provider-event identity before channel aggregation

When a plugin owns configured inbound sources, a terminal claim after channel normalization is too late to protect event identity: Discord and Slack may already have merged multiple provider events and retained only the final `MessageSid`.

The bounded pattern is:

1. Keep source matching in the owning plugin; channels must not read `plugins.entries.<id>.config`.
2. Expose a generic pre-aggregation policy carrying authenticated provider, account, conversation, and parent-conversation facts.
3. Let a matching owner veto debounce for that event, while reusing the existing keyed debouncer so pending ordinary traffic still flushes in order.
4. Resolve Discord parent identity before auto-thread retargeting and carry that prepared fact forward. Do not reconstruct the parent from the created reply thread later.
5. Keep history and batch ID arrays as context only; durable intake identity remains the individual provider event ID.

Fast control paths need the same ordering audit. A `/stop` side effect may run early, but its confirmation must wait until source-suppression hooks have had a chance to terminate the turn.
