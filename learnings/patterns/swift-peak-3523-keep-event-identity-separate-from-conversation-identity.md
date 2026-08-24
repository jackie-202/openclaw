---
title: "Keep event identity separate from conversation identity"
date: 2026-08-21
category: patterns
component: shared
tags: [threads, slack, discord, provenance]
---

Cross-provider routing needs distinct identities for the source event, its parent or normalized conversation, and the eventual delivery target. Slack child timestamps must not be collapsed into root thread timestamps, and Discord child messages may match through an authenticated parent while retaining the child identity. Reuse explicit fields and contradiction checks rather than overloading one thread identifier; reject conflicting account, channel, parent, child, sender, or chronology evidence.
