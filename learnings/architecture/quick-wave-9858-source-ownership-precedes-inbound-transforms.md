---
title: "Zdrojove vlastnictvi musi predchazet inbound transformacim"
date: 2026-08-21
category: architecture
component: shared
tags: [deliberation, routing, inbound, debounce, discord, fail-closed]
file_type: checklist
---

# Zdrojove vlastnictvi musi predchazet inbound transformacim

Per-source plugin admission cannot be proven only at the final hook payload. Channel preprocessing may already have changed the facts that identify the configured source.

In the Deliberation audit, Discord `autoThread` replaced the original channel target with a newly created thread before `inbound_claim` and `before_dispatch`. Because the synthetic thread did not retain the authenticated parent source, exact source matching missed both admission and fail-closed suppression. Discord and Slack debounce also merged multiple provider events into one synthetic inbound before admission, violating one-item-per-event semantics even though the claim handler itself called intake only once.

For source-owned workflows:

- Decide ownership from authenticated original provider/account/channel/message facts before auto-threading, session retargeting, debounce aggregation, or command shortcuts.
- Carry original source identity separately from current conversation and delivery identity; do not reconstruct it from transformed `To`, `OriginatingTo`, or thread fields.
- Bypass aggregation when each provider event is a durable work item, or invoke source-owned intake separately for every buffered event.
- Place fail-closed suppression before fast paths such as abort replies, not only immediately before model dispatch.
- Test configured root and child messages with auto-thread enabled, nonzero debounce, disabled/failing intake, empty content, unsupported event kinds, and fast-abort commands.

An admission unit test over already-canonical facts is necessary but insufficient. The proof must start at the channel event and cross every preprocessing boundary before the ownership hook.
