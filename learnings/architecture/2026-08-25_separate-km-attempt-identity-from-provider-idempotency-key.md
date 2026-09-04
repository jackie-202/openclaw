---
title: "Oddělte KM identitu od provider idempotency key"
date: 2026-08-25
category: architecture
component: shared
tags: [deliberation, discord, slack, idempotency, km-contract]
file_type: rules
---

# Separate KM attempt identity from provider idempotency tokens

When an external workflow contract and a transport use related idempotency values, do not assume they must share one representation. Deliberation's KM accepts and correlates `provider:<attemptId>` up to 256 characters, while Discord's native nonce rejects values longer than 25 characters. Slack carries the common field but does not provide native create-message idempotency.

Keep the authoritative KM identity unchanged when its contract requires that shape. Derive a second provider-bound token from the same attempt ID at the final delivery boundary, such as 24 lowercase hex characters from SHA-256. This gives 96 bits of collision resistance, remains deterministic per attempt, and fits Discord's contract without weakening KM invocation/completion evidence.

Tests must assert both sides independently:

- KM invocation and completion retain the full `provider:<attemptId>` identity.
- Provider send receives the bounded deterministic token.
- The real Discord composition forwards that token as `nonce` with enforcement.
- Slack needs no adapter-specific rewrite when it ignores the key and reports idempotency as unsupported.

This supersedes the narrower rule that the KM provider-attempt identity itself must always be made provider-portable. Preserve the external owner contract first; adapt only at the provider boundary.
