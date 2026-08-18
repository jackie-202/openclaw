---
title: "Preserve Slack error metadata through outbound helpers"
date: 2026-08-17
category: patterns
component: backend
tags: [slack, error-classification, delivery, redaction]
---

The generic Slack send helper enriched error messages but risked losing structured SDK metadata needed by Deliberation to distinguish rate limits, transport failures, missing scopes, authentication failures, and inaccessible targets. Preserve the original error object's structured fields when adding context, then classify from those fields rather than parsing message text. Keep resulting KM evidence bounded and secret-free.