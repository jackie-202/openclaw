---
title: "Keep provider credential selection centralized"
date: 2026-08-25
category: security-issues
component: backend
tags: [slack, credentials, tokens, history-read, least-privilege]
---

Slack account startup and history reads had to use consistent read-token selection. Divergent token resolution can make registration succeed while history calls fail with different scopes or account identity. Reuse one credential resolver for all read-side Slack operations, preserve scope-aware failures, and never include token values in diagnostics.
