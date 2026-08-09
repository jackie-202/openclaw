# Fix Deliberation intake canonical timestamp serialization

## Observed failure

Discord message `1535684929403359352` (`Jdeme testovat`, occurred `2026-08-08T16:23:38.816Z`) matched the configured Deliberation source, reached the KM listener, and failed with HTTP `400 SCHEMA_INVALID` at `2026-08-08T16:23:40.926Z`.

The OpenClaw plugin serializer in `extensions/deliberation/src/intake.ts` currently does:

```ts
timestamp.replace("Z", "000Z");
```

for timestamps with milliseconds. Thus `2026-08-08T16:23:38.816Z` becomes malformed/non-normalized `2026-08-08T16:23:38.816000Z` (six digits were intended, but three extra digits are appended, producing nine fractional digits). KM validates timestamps by parsing and reserializing to exactly six fractional digits, so it rejects the request.

## Required change

In `~/Projects/openclaw-fork`:

1. Correct `canonicalUtcTimestamp()` so it emits KM's canonical UTC form:
   - whole seconds: `YYYY-MM-DDTHH:mm:ssZ`
   - fractional seconds: exactly six digits, e.g. `.816000Z`
2. Add focused tests covering whole seconds and non-zero milliseconds. Include the concrete `.816Z` regression case.
3. Verify Deliberation plugin tests and the smallest relevant type/build gate.
4. Do not alter listener schema strictness or weaken timestamp validation.

## Acceptance criteria

- `new Date("2026-08-08T16:23:38.816Z")` serializes to `2026-08-08T16:23:38.816000Z`.
- `new Date("2026-08-08T16:23:38.000Z")` serializes to `2026-08-08T16:23:38Z`.
- Existing intake behavior and idempotency remain unchanged.
- Tests prove the old nine-digit output cannot regress.
