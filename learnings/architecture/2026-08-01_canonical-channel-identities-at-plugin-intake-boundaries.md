---
title: "Canonical channel identities must be tested at plugin intake boundaries"
date: 2026-08-01
category: architecture
component: shared
tags: [openclaw, plugins, discord, inbound-claim, route-matching, testing]
file_type: rules
---

# Canonical channel identities must be tested at plugin intake boundaries

OpenClaw's inbound hook mapper delegates conversation identity to the channel plugin. For Discord channel messages, the runtime `conversationId` is canonicalized as `channel:<id>`, even when plugin configuration and public docs use a bare channel id.

Synthetic plugin tests that use the same bare value in config and hook context can therefore pass while every live event misses route matching. Intake tests must reproduce the payload emitted by `deriveInboundMessageHookContext` and `toPluginInboundClaimContext`, including channel-specific prefixes and attachment metadata.

Normalize at the owning plugin's route boundary, not in core and not with parallel fallback comparisons. Apply the same normalization to source and processing routes, and keep fail-closed skip paths diagnosable without logging message content, attachment paths, URLs, or credentials.
