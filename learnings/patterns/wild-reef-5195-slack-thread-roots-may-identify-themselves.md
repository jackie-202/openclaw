---
title: "Slack thread roots may identify themselves"
date: 2026-08-31
category: patterns
component: backend
tags: [slack, thread-ts, validation, fail-closed]
---

Slack can represent a top-level thread root with either no `thread_ts` or `thread_ts === ts`. Root-history validation must accept both forms while rejecting actual replies where `thread_ts !== ts`. Treating every row with `thread_ts` as a reply incorrectly discards valid roots.
