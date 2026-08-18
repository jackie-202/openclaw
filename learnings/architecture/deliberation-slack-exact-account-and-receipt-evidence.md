---
title: "Preserve exact Slack delivery evidence across generic outbound seams"
date: 2026-08-17
category: architecture
component: backend
tags: [deliberation, slack, delivery, account-routing, error-classification, receipts]
file_type: rules
---

# Preserve exact Slack delivery evidence across generic outbound seams

A generic channel outbound adapter can accept an explicit `accountId` and still route through the wrong credentials when the provider's account resolver inherits channel-level defaults for unknown named accounts. Cross-provider durable delivery must verify that a non-default named account exists before invoking the outbound adapter; otherwise a typo can send to a channel with the same ID in the root token's workspace.

Provider wrappers must also preserve structured SDK errors. Slack's send helper enriched `missing_scope` messages by replacing the SDK error with a plain `Error`, which discarded `code` and `data` and made deterministic KM classification impossible. Mutating only the original error's message preserves the provider metadata without exposing raw payloads in durable evidence.

Finally, treat provider success sentinels as failures. Slack can return `messageId: "unknown"` when `chat.postMessage` has no timestamp, while its receipt intentionally omits that sentinel. Durable completion must require a real receipt ID and reject `unknown` or `suppressed` message IDs rather than recording a false `SENT` outcome.

For Slack rate limits, inspect the installed SDK behavior rather than assuming every 429 has the typed rate-limit error shape. With non-rejecting rate limits and zero configured retries, the SDK waits and throws a plain `A rate limit was exceeded ... retry-after: N` error. Normalize that exact dependency-backed shape into bounded `rate_limit` evidence without persisting the URL or provider message.
