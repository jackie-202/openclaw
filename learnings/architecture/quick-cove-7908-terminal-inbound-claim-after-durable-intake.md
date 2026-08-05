---
title: "Terminalni inbound claim az po uspesnem durable intake"
date: 2026-08-02
category: architecture
component: backend
tags: [openclaw, plugins, inbound-claim, deliberation, fail-closed]
file_type: rules
---

# Terminal inbound claims must follow durable intake success

For a plugin that intercepts normal dispatch through `inbound_claim`, successful side-effect completion and terminal ownership are one state transition. Await the durable intake first, then return exactly `{ handled: true }` with no reply payload. Returning `{ handled: false }` after a successful enqueue allows the ordinary model and delivery pipeline to run and can create a public duplicate response.

Failure handling is a separate concern. Deliberation keeps disabled, malformed, unmatched, and KM-error intake paths non-claiming because an independent high-priority `before_dispatch` guard owns fail-closed silence for configured source routes. Do not turn error paths into success claims or weaken the guard to fix a successful-path fallthrough.

Regression proof should cover both boundaries:

- Plugin test: realistic canonical Discord identity (`channelId=discord`, `accountId=default`, `conversationId=channel:<id>`), exactly one intake, exact `{ handled: true }`, no `reply`, and no intake/claim for another channel.
- Core test: a handled broadcast claim never invokes the reply resolver or any dispatcher method (`sendToolResult`, `sendBlockReply`, `sendFinalReply`).
