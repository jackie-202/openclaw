---
title: "Single-attempt delivery needs a distinct adapter contract"
date: 2026-08-21
category: architecture
component: shared
tags: [deliberation, delivery, discord, slack, idempotency, at-most-once]
file_type: rules
---

# Single-attempt delivery needs a distinct adapter contract

An owner-level sender call is not evidence of one platform attempt. Discord's ordinary adapter contains both transport retries and webhook-to-bot fallback, while Slack's ordinary sender retries DNS failures and posts every rendered chunk.

For a workflow with an at-most-once requirement, add a distinct channel-owned operation instead of flags on the ordinary send path. That operation should:

- render provider-specific tables, mentions, and markup before any message-create request;
- reject unless the rendered output is exactly one platform message;
- choose one native route once and prohibit retry, fallback, and rechunking;
- return a closed `sent | rejected | unknown` result;
- report whether the durable attempt key was applied natively or is unsupported;
- preserve the existing ordinary adapter behavior unchanged.

Composition proof must load the real channel adapter and mock only the native HTTP/SDK boundary. Count feature calls, adapter calls, and native requests separately, especially for accepted-then-error and partial-send scenarios.

Discord bot sends can carry the durable key through `nonce` plus `enforce_nonce`; Discord webhooks and Slack `chat.postMessage` have no accepted idempotency field in the currently installed/public request contracts, so unsupported handling must be explicit rather than silently dropping the key.
