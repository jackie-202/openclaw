---
title: "Claim inbound events only after durable intake"
date: 2026-08-02
category: architecture
component: backend
tags: [fail-closed, durability, event-claim, intake]
---

A successful Deliberation intake must terminally claim the inbound event only after the KM intake operation succeeds. Claiming earlier risks losing an event that was never durably accepted; failing to claim after success allows downstream handlers to process or reply to traffic that Deliberation owns. Keep failure handling independently fail-closed, use sanitized logging, and test both successful terminal claim and intake-failure suppression.
