---
title: "Keep Slack routing identity outside a closed external wire"
date: 2026-08-16
category: architecture
component: shared
tags: [deliberation, slack, thread-history, plugin-state, runtime-context, wire-contract]
file_type: rules
---

# Keep provider routing identity outside a closed external wire

When a provider needs a conversation key that the accepted external request does not carry, do not overload the provider event ID or channel-scoped source identity and do not add an unowned wire field.

For Deliberation Slack intake, keep three facts distinct:

- `providerEventId`: the admitted child message timestamp (`message.ts`, with `event_ts` only as the missing-`ts` fallback).
- `threadId`: `thread_ts ?? providerEventId`.
- `sourceTarget`: `v1:slack:<account>:<channel>`.

Persist `sourceTarget + providerEventId -> threadId` in the plugin's SQLite-backed keyed state before external intake. The unchanged history request can then resolve the exact thread after restart. Identical duplicate mappings are safe; conflicting mappings, missing state, provider errors, and account/channel mismatches must fail closed.

Keep provider API ownership in the channel plugin. Register an account-scoped reader through the generic channel runtime-context registry rather than importing another plugin's internals. For Slack freshness, use an exact root lookup to capture the read-start watermark and cursor-paginated thread replies for the bounded artifact. Compare Slack decimal timestamps exactly, never as Discord snowflakes, JavaScript numbers, or unvalidated lexical strings.
