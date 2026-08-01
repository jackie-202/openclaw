---
title: "Plugin planning must stop at an unspecified external authority contract"
date: 2026-07-27
category: architecture
component: backend
tags: [openclaw, plugins, contracts, delivery, reconciliation, planning]
file_type: rules
---

# Plugin planning must stop at an unspecified external authority contract

When an OpenClaw plugin delegates durable authority to an external system, public SDK feasibility is not enough to begin production implementation. The repository-local plan must first pin every wire-level decision that affects identity, authorization, and replay.

For a bounded delivery plugin, require fixtures and closed interfaces for:

- missing provider message ID behavior in the deterministic inbound key;
- exact authenticated request paths, methods, headers, and response schemas;
- atomic ready-to-sending reservation and immutable attempt identity;
- completion categories that distinguish pre-send failure, partial send, and unknown acceptance;
- reconciliation evidence required before a fresh reservation can send again.

If these facts are absent, do not invent HTTP routes or fallback identities and do not inspect the external authority outside the allowed project scope. Plan the plugin modules and tests, but make contract completion the first blocking implementation step.

For OpenClaw specifically, keep the boundary external-compatible: use focused `openclaw/plugin-sdk/*` imports, `api.registerService` for a bounded polling loop, `before_dispatch` for local terminal silence, and one `sendDurableMessageBatch` call site. Polling is preferable to an authenticated wake route when the wake authentication and replay contract is not already defined.
