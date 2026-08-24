---
title: "Substitute transport auth instead of relaxing validation"
date: 2026-08-20
category: security-issues
component: backend
tags: [oauth, openai, provider-auth, compaction, credential-leakage]
file_type: rules
---

# Substitute transport auth; do not merely relax validation

When a local OpenAI-compatible bridge needs a non-empty SDK `apiKey` but must not receive a real upstream credential, an OAuth-vs-API-key mismatch cannot be fixed by declaring OAuth acceptable. That would let the resolved OAuth access token continue into SDK auth storage and become `Authorization: Bearer ...`.

Resolve the whole auth result at the shared provider-auth boundary instead:

- Keep compatible direct API-key auth unchanged.
- For a configuration that already qualifies for synthetic local auth, replace the incompatible selected profile with the existing non-secret marker.
- Preserve fail-closed validation for public/remote OpenAI endpoints and incompatible provider bindings.
- At request construction, pass the marker only as the SDK constructor credential and set `Authorization: null` on the model.

OpenAI SDK 6.x preserves explicit null headers and treats a null `Authorization` header as intentional auth omission. Tests should therefore prove both halves: the resolver returns the marker rather than the OAuth token, and the effective request model has `Authorization: null` rather than `Bearer <marker>`.

Compaction and ordinary turns should call the same resolver. A compaction-only exception is a drift risk and can pass validation without preventing credential leakage.
