---
title: "Uzavřené HTTP kontrakty vyžadují zachycení generovaných hlaviček"
date: 2026-08-04
category: runtime-errors
component: backend
tags: [openclaw, deliberation, http, node-fetch, contract-testing]
file_type: rules
---

# Closed HTTP contracts require client-generated header capture

When a listener validates a closed header allowlist, inspecting only application headers is insufficient. Node's global `fetch` added `accept-language: *` after the caller supplied its headers, while the pinned KM transport contract allowed `sec-fetch-mode` and other generated headers but not `Accept-Language`. The listener therefore rejected an otherwise valid authenticated intake before persistence.

## Diagnostic method

Capture the exact request emitted by the production HTTP client against a temporary listener. Compare method, path, application header values, generated header names, body schema, timestamps, HTTP status, and bounded protocol error code independently. This ruled out the initial fractional-timestamp hypothesis: `2026-08-04T12:50:19.483Z` fit the mirrored schema and represented the correct instant.

## Durable regression proof

The regression fixture should reject every header outside the pinned application and transport allowlists, then persist by canonical provider event ID. Send the same Discord-shaped event twice and assert both requests succeed while the store contains one record. A permissive fetch mock cannot prove this boundary because it never observes headers generated below `RequestInit`.

## Fix boundary

If the external listener contract cannot be changed in the current task, use a transport whose emitted metadata satisfies that contract. Keep credential resolution, endpoint validation, protocol headers, response schema validation, timeout behavior, and fail-closed claiming unchanged. Surface only a closed diagnostic stage, optional status, and bounded protocol code; never log credentials, bodies, content, endpoints, or raw listener messages.
