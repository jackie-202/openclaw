---
title: "Do not share ordinary retry bookkeeping with exclusive events"
date: 2026-08-23
category: patterns
component: backend
tags: [slack, deduplication, concurrency, app-mention]
---

Slack can deliver one provider event through both `message` and `app_mention`. Priming the ordinary app-mention retry allowance before resolving ownership allowed concurrent deliveries to enter the exclusive owner path twice; clearing the marker only after the first asynchronous claim was insufficient.

Resolve ownership before seen/retry bookkeeping. Exclusive events should never arm an ordinary fallback mechanism. Test this race by delivering both listener forms concurrently and asserting exactly one targeted owner claim.
