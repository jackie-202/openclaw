---
title: "Resolve exclusive inbound ownership before transport side effects"
date: 2026-08-23
category: architecture
component: shared
tags: [inbound, ownership, hooks, discord, slack]
---

Inbound ownership must be resolved before any irreversible or user-visible channel behavior. Discord and Slack now determine the authenticated exclusive owner before typing indicators, acknowledgement reactions, thread creation, normal dispatch, or fallback handling. Reuse this ordering whenever a plugin can exclusively claim an event; checking ownership later can leak side effects from events the host should never process.
