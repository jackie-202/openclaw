---
title: "WhatsApp plugin-only delivery suppression keeps hooks active"
date: 2026-03-21
category: architecture
component: backend
tags: [whatsapp, plugins, hooks, delivery-policy]
file_type: decisions
---

# WhatsApp plugin-only delivery suppression

When WhatsApp auto-reply needs to keep `message_received` hooks active but must not send immediate replies, suppress only inside the final `deliver` callback in `process-message`.

## Why this works

- `dispatchReplyWithBufferedBlockDispatcher` still executes end-to-end, so inbound hooks and context/session side effects run.
- Returning early in `deliver` for final payloads drops external WA delivery without bypassing dispatch.

## Implementation pattern

1. Add a generic group config flag: `deliveryPolicy: "auto-reply" | "plugin-only"`.
2. Resolve effective policy with normal group precedence (specific group -> `*` -> default).
3. In WhatsApp `deliver`, if chat is group and policy is `plugin-only`, return before `deliverWebReply`.

## Guardrail

Do not short-circuit before dispatcher invocation, otherwise plugin inbox hooks stop firing.
