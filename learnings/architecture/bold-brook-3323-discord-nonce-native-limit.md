---
title: "Discord nonce musí odpovídat nativnímu limitu"
date: 2026-08-21
category: architecture
component: shared
tags: [discord, idempotency, deliberation, outbound-sdk]
file_type: decisions
---

# Provider idempotency must fit the native field

Discord's create-message request accepts `nonce` and `enforce_nonce`, but the nonce is limited to 25 characters. A durable application key can satisfy the SDK type while still being silently ineffective at the provider when it exceeds that limit.

For Deliberation, derive the KM-owned provider-attempt identity before invocation as a deterministic 24-character value:

```ts
const digest = sha256(domainSeparator + attemptId)
  .base64url()
  .slice(0, 22);
const providerAttemptId = `p:${digest}`;
```

Persist this compact value in KM invocation/completion evidence and pass the same value unchanged through the outbound adapter into Discord's native nonce. The Discord adapter should still reject keys outside `1..25` before any message-create request, because other callers may not use the Deliberation derivation.

This ownership order matters:

1. The durable workflow derives one provider-portable attempt identity.
2. KM persists that exact identity before dispatch.
3. The adapter forwards it unchanged when the provider supports idempotency.
4. Provider-specific limits are validated before invocation rather than silently truncating or re-hashing inside the adapter.

Always inspect dependency source or official API docs for idempotency field limits. A field's TypeScript type (`string`) does not prove every string is accepted or enforced.
