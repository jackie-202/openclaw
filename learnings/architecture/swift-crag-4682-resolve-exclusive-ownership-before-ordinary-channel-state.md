---
title: "Resolve exclusive ownership before ordinary channel state"
date: 2026-08-23
category: architecture
component: shared
tags: [exclusive-ownership, ingress-ordering, discord, slack]
---

Configured exclusive events were initially still exposed to ordinary admission filters and mutable channel behavior before reaching their owner. Discord mention filters, bot-loop tracking, binding startup, reactions, typing, and enqueue logic could drop or mutate an event first; Slack preparation could perform retry, thread, and history work first.

Resolve the ownership policy as early as authenticated channel and parent identity permit. After mandatory security and self/webhook guards, route exclusive or ambiguous events through a terminal claim gate before ordinary responder effects. Disabled, declined, missing, error, or ambiguous outcomes must also terminate without falling through to normal processing.
