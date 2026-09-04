---
title: "Slack freshness authority must match canonical source scope"
date: 2026-08-31
category: architecture
component: backend
tags: [slack, deliberation, history, watermark, plugin-sdk]
file_type: decisions
---

# Slack freshness authority must match the canonical source scope

When freshness is keyed by a channel-scoped `sourceTarget`, a thread-only provider read cannot claim complete evidence for a top-level cutoff. For Slack schema-v2 reads, capture a stable upper watermark first, then use one explicit authority rule:

- A root cutoff merges newer top-level messages from the exact authenticated account/channel with newer replies from that root thread.
- A reply cutoff remains confined to later replies in its mapped root thread.

Both surfaces must use the same immutable `(cutoff, watermark]` interval, exact decimal timestamp comparison, provider-event-ID conflict detection, and shared count/byte bounds. Slack top-level thread roots can be represented with either no `thread_ts` or `thread_ts === ts`; only rows where `thread_ts !== ts` are actual replies and must be rejected from channel-history evidence.

When adding the generic channel-page operation to the public Plugin SDK context, keep it optional for existing external implementations. The schema-v2 root path should require it at runtime and fail closed, while schema-v1 and reply-cutoff paths retain their existing capability requirements.
