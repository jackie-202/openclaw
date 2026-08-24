---
title: "Preserve security guards while moving ownership earlier"
date: 2026-08-23
category: security-issues
component: backend
tags: [admission-control, allowlists, self-echo, ownership]
---

Moving exclusive ownership ahead of ordinary filtering does not mean bypassing every ingress guard. Self/webhook echo rejection and guild, channel, or member access controls remain security boundaries and may intentionally reject an event before owner claim. Mention requirements, bot-loop suppression, activity tracking, and responder preparation are ordinary behavior and should occur after ownership attribution.

When changing ingress order, classify each guard explicitly as security/authentication or ordinary processing. Move only the latter behind the exclusive terminal gate.
