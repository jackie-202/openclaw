---
title: "Approval controls must bypass the whole blocking lifecycle"
date: 2026-09-08
category: architecture
component: backend
tags: [approvals, reply-admission, session-lifecycle, acp, command-routing]
file_type: rules
---

# Approval controls must bypass the whole blocking lifecycle

When a control command resolves a request that the active agent run is waiting on, skipping only reply-run admission is insufficient. The command must also avoid every path that can consume or mutate an ordinary turn before command handling.

In OpenClaw this means all three boundaries must agree on the same normalized approval-command classification:

- `dispatch-from-config` must not acquire, wait for, abort, complete, or replace the active reply operation.
- ACP dispatch must classify the command as local control so it cannot become an ACP/model prompt.
- `getReplyFromConfig` must handle the command before session initialization, because idle/daily rollover can archive or replace the active session even without reply-operation acquisition.

The early path should still call the canonical approval handler. That preserves sender and account authorization, gateway scopes, exact request identity, decision validation, expiry, and idempotency in their existing owners. Command reply payloads must also retain `markReplyPayloadForSourceSuppressionDelivery`; otherwise errors and confirmations disappear in `message_tool_only` channels.

Regression proof should keep an active operation registered and unresolved while asserting that the gateway resolver is reached, the stale persisted session ID is unchanged, and command feedback is delivered under source suppression. Separate tests should cover normalized colon syntax and ACP bypass for bare approval forms.
