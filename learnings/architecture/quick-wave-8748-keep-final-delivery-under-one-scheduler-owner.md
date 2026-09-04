---
title: "Keep final delivery under one scheduler owner"
date: 2026-08-24
category: architecture
component: backend
tags: [service-ownership, scheduler, delivery, singleton]
---

Replacing the plugin-owned final-delivery service with a `deliver-once` CLI created competing ownership and removed automatic delivery from the enabled plugin lifecycle. Restore one explicit owner: register exactly one `deliberation-final-delivery` service when enabled and none when disabled. Avoid introducing callable or cron-driven alternatives unless the existing scheduler is deliberately retired across all repositories and deployment configuration.
