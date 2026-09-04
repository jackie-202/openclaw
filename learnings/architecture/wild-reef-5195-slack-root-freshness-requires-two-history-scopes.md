---
title: "Slack root freshness requires two history scopes"
date: 2026-08-31
category: architecture
component: backend
tags: [slack, history, threads, watermark, pagination]
---

For a cutoff at a Slack root message, freshness evidence cannot come from `conversations.replies` alone. It must merge newer top-level messages from bounded `conversations.history` with replies from the mapped root thread. A cutoff at a child reply must remain thread-only. Capture one inclusive read-start watermark, reject post-watermark arrivals, preserve exact account/channel/thread identity, detect repeated cursors, and mark evidence incomplete when page, count, or byte limits truncate the result.
