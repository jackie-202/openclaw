---
title: "Synteticky auth marker musi odpovidat transportu, ktery maze hlavicku"
date: 2026-08-20
category: security-issues
component: backend
tags: [oauth, openai, provider-auth, compaction, credential-leakage, request-headers]
file_type: rules
---

# Synteticky auth marker musi odpovidat transportu, ktery maze hlavicku

Synthetic local authentication is safe only when the selected transport has a request-boundary rule that removes the SDK-generated credential header. A local `baseUrl` and a no-key provider configuration are not sufficient by themselves.

For OpenAI-compatible models in OpenClaw:

- `openai-completions` can use `CUSTOM_LOCAL_AUTH_MARKER` because `applyLocalNoAuthHeaderOverride()` sets `Authorization: null`.
- `openai-responses` must remain fail-closed until it has equivalent request-boundary protection; otherwise the SDK can send `Bearer custom-local`.
- Compatibility resolution and header sanitization predicates must cover exactly the same API family.

When extending synthetic auth to a new caller such as compaction, test three linked properties: the resolver substitutes the marker instead of the OAuth token, the effective model clears `Authorization`, and adjacent API transports without that clearing rule remain rejected.

Autoreview caught this boundary mismatch even though the intended completions regression and build were green. Review local-auth changes across both credential selection and final request construction rather than treating resolver success as sufficient proof.
