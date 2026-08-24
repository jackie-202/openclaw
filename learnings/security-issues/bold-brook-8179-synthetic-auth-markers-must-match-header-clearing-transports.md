---
title: "Synthetic auth markers must match header-clearing transports"
date: 2026-08-20
category: security-issues
component: backend
tags: [oauth, openai, provider-auth, compaction, request-headers]
---

A synthetic local-auth marker is safe only on request transports that explicitly remove or replace the resulting `Authorization` header. Applying the marker to local `openai-responses` caused the SDK to emit `Authorization: Bearer <marker>` because header clearing existed only for `openai-completions`.

Keep synthetic local authentication narrowly scoped to validated local `openai-completions` configurations until equivalent Responses header handling exists. Add fail-closed tests for remote endpoints and unsupported APIs, alongside a request-boundary assertion that neither OAuth tokens nor synthetic markers are sent as bearer credentials.
