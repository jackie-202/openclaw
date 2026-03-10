---
title: "Gateway announce delivery: bounded in-band retry plus durable async fallback"
date: 2026-03-10
category: tooling
component: backend
tags: [gateway, cron, announce, delivery-reliability, event-loop]
file_type: rules
---

# Gateway announce resilience planning notes

When a cron/subagent completion path uses direct `callGateway` with long request timeouts and in-band retries, delivery failures can consume the whole cron wall-clock budget even though the actual agent turn has already finished successfully.

## Practical takeaway

- Keep in-band completion delivery attempts short and bounded.
- Move long-tail retries to a durable async queue that survives gateway or process restarts.
- Preserve idempotency keys across retries to avoid duplicate user-visible completions.

## Event loop protection takeaway

- Add explicit event loop lag monitoring in gateway runtime (`p99`/`max` lag + utilization), otherwise freezes look like random WS timeouts and are difficult to triage.
- Track lag near gateway maintenance/runtime wiring where lifecycle and logging already exist.

## Planning pattern that worked

- Start from the exact hot path (`cron/isolated-agent/delivery-dispatch.ts` -> `agents/subagent-announce.ts` -> `gateway/call.ts`) before proposing architecture changes.
- Reuse existing resilient primitives (durable queue pattern in `infra/outbound/delivery-queue.ts`) instead of inventing a parallel mechanism from scratch.
