---
title: "Separate event identity from delivery thread routing"
date: 2026-08-25
category: architecture
component: shared
tags: [discord, routing, thread-identity, idempotency]
---

A provider event or message ID can remain the stable source-correlation and idempotency key, but it must not automatically become an outbound Discord `threadId`. Root-channel messages must deliver without `threadId`; only authenticated evidence that the source is a real Discord thread should provide the delivery thread channel ID. Preserve this distinction in parameter names and tests so identity metadata cannot accidentally influence destination routing.
