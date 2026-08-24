---
title: "Scope synthetic auth to header-clearing transports"
date: 2026-08-20
category: security-issues
component: backend
tags: [auth, openai, oauth, local-provider, compaction]
---

A local OpenAI-compatible bridge may need a synthetic API key to satisfy resolver requirements while an OAuth profile is carried from the parent session. Only substitute that marker for `openai-completions`, where the request path explicitly clears the SDK-generated `Authorization` header. Keep OAuth rejected for `openai-responses` and other transports that do not prove header removal, so a local bridge never receives a forwarded OAuth token.
