---
title: "Destination provider must own final transport selection"
date: 2026-08-17
category: architecture
component: backend
tags: [cross-provider, sole-send, immutable-target, deliberation]
---

Cross-provider delivery must select the adapter from the immutable destination, never from the source event provider. The reliable lifecycle is `reserve -> invoke -> exactly one selected provider send -> complete`, with canonical destination equality checked at every KM boundary. Malformed, unsupported, or conflicting targets must fail before invocation and make zero provider calls; tests should explicitly prove that Slack destinations call only Slack and Discord destinations call only Discord.