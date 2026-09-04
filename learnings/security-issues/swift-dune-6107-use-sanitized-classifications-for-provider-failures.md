---
title: "Use sanitized classifications for provider failures"
date: 2026-08-25
category: security-issues
component: backend
tags: [error-handling, redaction, slack, gateway, fail-closed]
---

Deliberation history diagnostics needed actionable internal classifications without exposing credentials or message content, while the public contract continued returning `SOURCE_HISTORY_UNAVAILABLE`. Preserve a stable generic external error and attach only allowlisted metadata such as classification and scope names. Tests should explicitly reject credential and content leakage.
