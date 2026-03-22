---
title: "WhatsApp plugin-only suppression at delivery stage"
date: 2026-03-21
category: architecture
component: backend
tags: [whatsapp, plugins, hooks, delivery]
file_type: rules
---

# WhatsApp plugin-only delivery suppression should happen in deliver callback

When a WhatsApp group message is processed through `dispatchReplyWithBufferedBlockDispatcher`, plugin hooks (`message_received`) are emitted before channel delivery.

Practical rule for deliberation/inbox plugins:

1. Do not short-circuit before dispatch if you still need plugin inbox capture.
2. Suppress channel output at the `dispatcherOptions.deliver` stage, after `info.kind === "final"` check.
3. Use channel/group config (for example `deliveryPolicy: plugin-only`) instead of plugin-specific config coupling.

Why:

- In the WA extension path, outbound goes through `deliverWebReply` directly, not `infra/outbound/deliver.ts`, so `message_sending` hook cancellation is not a reliable suppression point.
- `inbound_claim` broadcast outcomes are available in gateway dispatch, but not directly as a routing signal in WA extension delivery logic.

Outcome:

- Group messages still enter plugin pipelines (triage/deliberation) via `message_received`.
- WA auto-replies are blocked only for explicitly configured groups.
