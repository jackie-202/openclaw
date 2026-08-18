---
title: "Validate exact Slack accounts and real receipt IDs"
date: 2026-08-17
category: security-issues
component: backend
tags: [slack, account-routing, receipts, fail-closed]
---

An explicit Slack `accountId` is not sufficient unless that named account actually exists in configuration. Resolve and validate the exact account before durable invocation so delivery cannot silently fall back to another account. After sending, also reject absent IDs and helper sentinel values such as `"unknown"`; only a real bounded platform message ID is valid receipt evidence for KM completion.