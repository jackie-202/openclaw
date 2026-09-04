---
title: "Slack freshness authority follows cutoff shape"
date: 2026-08-31
category: architecture
component: shared
tags: [slack, deliberation, freshness, threads, pagination]
file_type: rules
---

# Slack freshness authority follows cutoff shape

When a canonical Slack source is channel-scoped but event history also carries a thread root, one history rule cannot safely serve both root and reply cutoffs.

- A root cutoff needs the union of newer top-level messages in the exact configured channel and newer replies to that root.
- A reply cutoff must remain inside its mapped root thread so unrelated channel roots and sibling-thread replies do not become evidence.
- Capture the maximum channel/thread watermark before paging, then admit only exact-decimal Slack timestamps in `(cutoff, watermark]`.
- Expose channel paging through the existing channel runtime context and centralized read token; do not create provider clients or credential paths in the consuming plugin.

This keeps channel freshness observable without weakening thread isolation, provenance, pagination bounds, or fail-closed provider validation.
