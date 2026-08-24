---
title: "Keep Discord message and thread identities separate in intake fixtures"
date: 2026-08-19
category: patterns
component: backend
tags: [deliberation, discord, intake, fixtures, optional-fields]
---

A Discord fixture with only a message-level override must not imply a thread identity. `sourceThreadId` is optional and should be omitted unless the incoming Discord context explicitly contains a thread. Update assertions to verify its absence for non-thread fixtures, while retaining `sourceTarget` assertions. Avoid treating message IDs or routing overrides as thread IDs.
