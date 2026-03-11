---
title: "Gateway session lanes: prioritize inside one lock"
date: 2026-03-11
category: runtime-errors
component: backend
tags: [gateway, session-lane, queue-priority, subagent, cron, retry]
file_type: rules
---

# Gateway session lanes: keep one lock, prioritize inside it

When background work and direct user messages share the same per-session lane, plain FIFO scheduling can starve interactive turns for minutes.

## What worked

- Keep a single session-lane lock so one session still has one writer.
- Split the internal lane queue into `interactive` and `background` buckets.
- Dequeue `interactive` work before `background` work after the current active task finishes.
- Classify cron, inter-session announce, and other system-originated retries as `background`.

## Why this shape is safer

Creating separate `session:...:interactive` and `session:...:background` lanes risks concurrent execution against the same transcript unless another mutex is added on top. Priority queues inside one lane preserve transcript ordering and still unblock user-visible work.

## Retry budget lesson

Priority alone is not enough if announce retries stay in-band for too long.

- Keep completion announce timeouts short.
- Cap retry count aggressively.
- Track a total retry window so completion retries give up quickly instead of holding pressure for minutes.

## Observability lesson

Emit queue-wait diagnostics with lane composition (`interactiveAhead`, `backgroundAhead`) when a wait threshold is exceeded. That makes starvation visible and tells clients the gateway is busy rather than dead.
