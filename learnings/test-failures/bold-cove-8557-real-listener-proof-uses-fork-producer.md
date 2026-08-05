---
title: "Real listener proof must exercise the fork-owned intake producer"
date: 2026-08-04
category: test-failures
component: e2e
tags: [deliberation, http, contracts, integration-testing, diagnostics]
file_type: rules
---

# Real listener proof must exercise the fork-owned intake producer

When an external listener is healthy but an intake POST fails before persistence, separate health evidence from intake evidence. A health request does not prove POST media headers, body schema, timestamp canonicalization, or intake response parsing.

For Deliberation, reproduce with `createInboundClaimHandler` composed with the real `KmClient`, not a hand-built HTTP body. Compare only bounded facts: route, header names/presence, normalized timestamp shape, HTTP status, canonical KM code, parser stage, and persisted record count. Never capture credentials, content, sender values, endpoint URLs, or raw listener messages in runtime diagnostics.

Leave a fork-owned executable producer fixture that accepts a Discord-shaped event and environment-supplied credential. The external owner can invoke that fixture against its real temporary listener, preventing its E2E from drifting into a synthetic request that bypasses OpenClaw's producer.
