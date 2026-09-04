---
title: "Trusted sender identity must be assembled before exclusive claim"
date: 2026-08-31
category: architecture
component: shared
tags: [deliberation, discord, slack, inbound-claim, identity, contracts]
file_type: rules
---

# Trusted sender identity must be assembled before exclusive claim

Deliberation receives configured Discord and Slack events through the early `inbound_claim` path, before the ordinary finalized message context. Trusted names that exist only in `FinalizedMsgContext` therefore do not automatically reach the plugin.

For Discord, preserve the resolved opaque sender ID (`sender.id ?? author.id`) independently from textual indicators. Assemble display name, native username, and tag from the authenticated channel event before claim; do not reuse the rendered sender label because it can combine several indicators into one unstable string.

For Slack, the existing native name resolver runs after the early claim. A plugin that needs trusted identity hints must move that resolution before claim while retaining the same provider source and fallback order.

At the external wire boundary, keep these facts in an optional bounded object separate from `senderId`. Normalize only channel-owned fields, omit invalid hints rather than rejecting the underlying event, and prove with a composed channel-to-request test that spoofed message text cannot alter the object.
