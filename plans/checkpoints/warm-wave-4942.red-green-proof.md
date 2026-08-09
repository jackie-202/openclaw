# TDD Red-Green Proof: warm-wave-4942

## RED Phase

This evidence-only acceptance follow-up reuses genuine pre-implementation RED from the timestamp formatter's original task lineage. The implementation already exists, so no failing test was manufactured by reverting correct production code.

- **Historical task:** `bright-vale-5327`
- **Immutable source:** `plans/checkpoints/bright-vale-5327.red-green-proof.md:31-41`
- **Source SHA-256:** `abcc849098b4a369b522b699d5e1e690b4a3f76da25104d6aaefef1a8c301da7`
- **Caller acceptance:** `plans/checkpoints/acceptance-runs/bright-vale-5327-acceptance-001/result.json:2-3` records `ACCEPT` with no findings.
- **Timestamp:** `2026-08-04T14:00:02Z`
- **Test command:** `pnpm test extensions/deliberation/src/hooks.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/scripts/intake-producer.test.ts -- --reporter=verbose`
- **Exit code:** `1`
- **Result:** 2 failed and 39 passed across 3 test files.
- **Failing tests:** `persists the live Discord event once through the closed KM wire contract` and `sends canonical KM timestamps for a live-shaped non-zero milliseconds event`.
- **Authority failure:** JavaScript emitted `.483Z`/`.120Z`; KM required `.483000Z`/`.120000Z` while preserving the instant.

### Historical Test Output

```text
Test Files  2 failed | 1 passed (3)
Tests       2 failed | 39 passed (41)

FAIL deliberation hooks > persists the live Discord event once through the closed KM wire contract
FAIL deliberation hooks > sends canonical KM timestamps for a live-shaped non-zero milliseconds event

JavaScript emitted .483Z/.120Z; the authority requires preserving the same instant
with six fractional digits (.483000Z/.120000Z).
Real-listener result: 400 SCHEMA_INVALID; 0 matching records.
```

Because `Date#toISOString()` always supplies a three-digit millisecond fraction, the historical `.120Z` failure exercises the same formatter branch as the parent task's `.816Z` regression. The parent task then added the concrete `.816Z` serialized-request assertion without changing production code.

## GREEN Phase

- **Timestamp:** `2026-08-09T07:20:19Z`
- **Implementation files:** No production files changed in this evidence-only follow-up; the preserved `canonicalUtcTimestamp()` implementation is the implementation that resolved the historical RED.
- **Test file:** `extensions/deliberation/src/hooks.test.ts`
- **Test command:** `pnpm test extensions/deliberation/src/hooks.test.ts -- --reporter=verbose`
- **Exit code:** `0`
- **Result:** 1 test file passed; 27 tests passed and 0 failed.
- **Type command:** `node scripts/run-tsgo.mjs -p extensions/deliberation/tsconfig.json`
- **Type result:** Passed with exit code 0.

### Fresh Test Output

```text
RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

✓ deliberation hooks > persists the live Discord event once through the closed KM wire contract
✓ deliberation hooks > sends canonical KM timestamps for a live-shaped exact second event
✓ deliberation hooks > sends canonical KM timestamps for a live-shaped reported .816Z regression event

Test Files  1 passed (1)
Tests       27 passed (27)
Duration    518ms
[test] passed 1 Vitest shard in 3.65s
```

The concrete regression confirms `2026-08-08T16:23:38.816Z` serializes as `2026-08-08T16:23:38.816000Z`, exact seconds omit `.000`, and neither timestamp permits seven or more fractional digits. The real-listener test confirms duplicate submissions remain handled while retaining one record.

### Broader Verification Note

`pnpm test extensions/deliberation/src/hooks.test.ts extensions/deliberation/src/km-client.test.ts -- --reporter=verbose` reran 40 tests. All 27 hook tests passed, including the timestamp and idempotency cases. Two unrelated, previously documented reservation-response assertions in the concurrently modified `km-client.test.ts` failed with `KM returned an invalid reservation`; they do not exercise timestamp serialization and were not changed for this evidence-only follow-up.
