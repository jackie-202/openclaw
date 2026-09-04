# Fix: Deliberation final delivery — Discord idempotency key exceeds 25 chars

## Context

Repo: `/Users/michal/Projects/openclaw-fork`

The deliberation plugin final delivery service (`extensions/deliberation/src/final-adapter.ts`) derives the provider attempt id as:

```ts
export function deriveProviderAttemptId(attemptId: string): string {
  return `provider:${attemptId}`;
}
```

`attemptId` is a 32-char hex uuid, so the result is 41 chars. This value is passed as `idempotencyKey` into the Discord outbound adapter (`extensions/discord/src/outbound-adapter.ts`), which enforces `DISCORD_NONCE_MAX_LENGTH = 25`:

```
Discord idempotency key must contain 1-25 characters
```

Result: every Discord final delivery attempt is rejected with `providerFailureClass: "rejection"` and the record transitions to terminal `FAILED / delivery_failed`. Observed live on 2026-08-25 (three records failed at 13:01 UTC+2: 6488c0ba…, f78294f7…, 04c48a7c…).

## Required change

1. Make the idempotency key passed to the Discord provider fit within 25 characters while remaining deterministic per delivery attempt (same attemptId → same key, different attemptId → different key). Suggested approach: keep `deriveProviderAttemptId` (41 chars) as the KM-side provider attempt id if the KM contract requires that exact shape, but derive a separate `idempotencyKey` for the provider send call, e.g. a truncated/hashed form of the attemptId ≤ 25 chars (document collision reasoning — 24 hex chars of sha256 is fine). Do NOT change `DISCORD_NONCE_MAX_LENGTH` — the 25-char limit is Discord's nonce contract.
2. Check the Slack provider path in `extensions/deliberation/index.ts` for the same problem; Slack idempotency limits differ — verify against the slack outbound adapter validation and apply the same treatment if needed.
3. Keep the KM completeDelivery payload (`providerAttemptId`) consistent with whatever the KM listener validates (see `src/km-client.ts` schemas) — the KM-side id and the provider-side idempotency key are allowed to differ; just be explicit about which is which in the code.

## Acceptance

- Unit tests in `extensions/deliberation/src/final-adapter.test.ts` (or a new test file) covering: derived provider idempotency key length ≤ 25, determinism, and distinctness for different attempt ids.
- Existing deliberation + discord extension tests pass: run the repo's standard test command for these packages (e.g. `pnpm test extensions/deliberation extensions/discord` or the project-specific equivalent — check package.json).
- Build passes for the affected packages.
- No changes outside `extensions/deliberation` (and `extensions/discord` only if strictly necessary — prefer not touching it).
