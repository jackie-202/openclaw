# Fix Deliberation live intake canonical UTC timestamps

## Observed production failure

A real Discord message in `#test-deliberation` (`providerEventId=1534097014340456599`, 2026-08-04 09:13:50 Europe/Prague) matched the configured source and reached the loaded Deliberation plugin, but no spool record was created. Gateway logged at 09:13:51:

`deliberation intake failed: reason=km-request-failed error=Error`

The KM listener is healthy and a direct Node `fetch` health request returns HTTP 200. A direct intake using JavaScript `Date.toISOString()` returns HTTP 400 `SCHEMA_INVALID`: `occurredAt must be a normalized UTC timestamp`. The KM spool canonical timestamp format omits `.000` when there are no microseconds, while `extensions/deliberation/src/intake.ts` sends both `receivedAt` and `occurredAt` via `Date.toISOString()`, which always includes milliseconds. Existing hook tests expect `.000Z` and mock the KM client, so they miss this live protocol incompatibility.

## Objective

Make the OpenClaw Deliberation plugin emit canonical UTC timestamps accepted by the real KM wire contract, preserving non-zero fractional precision where relevant and omitting a zero millisecond fraction.

## Scope boundary

Work only in `/Users/michal/Projects/openclaw-fork`. Do not inspect or edit other repositories or runtime config. The cross-repository evidence above is sufficient.

## Required changes

- Add a small timestamp normalization seam used for Deliberation intake payload timestamps.
- Ensure exact-second values serialize as `YYYY-MM-DDTHH:mm:ssZ`, not `.000Z`.
- Define and test behavior for non-zero milliseconds consistently with the KM canonical contract (fractional precision must be accepted and normalized, not silently corrupted).
- Update hook/intake tests so the live wire incompatibility is pinned; do not rely only on a mocked client that accepts any timestamp string.
- Keep fail-closed source behavior unchanged.

## Verification

- Run focused Deliberation unit tests, including hook/intake and KM client tests.
- Run the smallest relevant typecheck/build gate for the extension/package.
- Record exact commands and results in the final note.

## Acceptance criteria

- A live-shaped event timestamp at an exact second produces canonical `...ssZ` for both occurred/received timestamps where applicable.
- Non-zero fractional timestamps follow the canonical wire format.
- Existing routing, duplicate handling, and fail-closed behavior remain unchanged.
- Tests fail against the old `Date.toISOString()` behavior and pass with the fix.
