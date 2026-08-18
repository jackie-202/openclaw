---
title: "Keep source event and thread identities distinct"
date: 2026-08-17
category: patterns
component: backend
tags: [slack, discord, threading, intake, camelcase]
---

KM intake required the exact camelCase field `sourceThreadId`, but the producer omitted it. The corrected normalization uses the Slack root thread identity for replies and falls back to the provider event ID for Slack roots and Discord messages. Preserve `providerEventId` as the actual event identity and transmit conversation identity separately; do not overload one field or introduce snake_case aliases at a strict wire boundary.