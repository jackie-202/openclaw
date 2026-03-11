---
title: "Gateway session lane starvation: prioritize inside one session lock"
date: 2026-03-11
category: runtime-errors
component: backend
tags: [gateway, session-lane, queue-priority, subagent, cron]
file_type: rules
---

# Gateway session-lane starvation triage pattern

When interactive and background work share the same session lane, plain FIFO scheduling can make user messages wait minutes behind cron/subagent retries.

## Key insight

Prefer **priority queues inside a single session lane lock** over splitting one session into multiple independently draining lanes.

- Single lane lock preserves transcript ordering and avoids concurrent writers.
- Priority dequeue (`interactive` before `background`) removes user-visible starvation without breaking session safety.

## Why separate per-session lanes are risky

Creating `session:...:interactive` and `session:...:background` lanes may run concurrently unless an extra mutex is added, which can corrupt per-session sequencing assumptions.

## Practical implementation shape

1. Keep one lane state per session key.
2. Store two internal queues (`interactiveQueue`, `backgroundQueue`).
3. Drain interactive first, background second.
4. Keep existing `maxConcurrent` and non-preemptive behavior.
5. Tag subagent announce and cron/system retries as background.

## Related safeguard

Even with priority queues, long announce retries should be bounded (short timeout and capped retry window) so background pressure does not persist indefinitely.
