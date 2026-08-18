---
title: "Reuse canonical identity parsers at outbound boundaries"
date: 2026-08-13
category: security-issues
component: backend
tags: [destination-validation, fail-closed, discord, canonical-identity]
---

A local destination parser initially accepted any non-empty account and channel segments. Autoreview showed that whitespace and other contract-invalid characters could pass through to the Discord route. The implementation was corrected to reuse the existing source-identity parser that owns the exact `v1:<provider>:<account>:<channel>` grammar. Reuse canonical parsers across intake and delivery boundaries; do not implement weaker ad hoc validation for security-sensitive routing identifiers.