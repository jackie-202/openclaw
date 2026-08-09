# TDD Red-Green Proof: bright-cove-8682

## RED Phase

- **Test file written:** `extensions/deliberation/src/hooks.test.ts`
- **Test command:** `pnpm test extensions/deliberation/src/hooks.test.ts -- --reporter=verbose`
- **Result:** Pre-production probe passed, 0 failed and 27 passed.
- **Finding:** The reported nine-digit premise is not reproducible. The existing formatter serialized `.816Z` as `.816000Z`, stripped `.000Z` to `Z`, and passed the explicit seven-or-more-digit rejection.
- **Decision:** Per the implementation plan, no production edit is justified. A genuine RED was not manufactured by reverting the already-correct formatter.

### Test Output

```text
✓ sends canonical KM timestamps for a live-shaped exact second event
✓ sends canonical KM timestamps for a live-shaped reported .816Z regression event

Test Files  1 passed (1)
Tests       27 passed (27)
[test] passed 1 Vitest shard in 3.13s
```

## GREEN Phase

- **Implementation files:** No production files changed; `canonicalUtcTimestamp()` was already correct.
- **Test file:** `extensions/deliberation/src/hooks.test.ts`
- **Test command:** `pnpm test extensions/deliberation/src/hooks.test.ts -- --reporter=verbose`
- **Result:** 0 failed, 27 passed.
- **Type command:** `node scripts/run-tsgo.mjs -p extensions/deliberation/tsconfig.json`
- **Type result:** Passed with exit code 0.
- **Idempotency proof:** `persists the live Discord event once through the closed KM wire contract` passed; both original and duplicate submissions remained handled while one record was retained.

### Test Output

```text
✓ sends canonical KM timestamps for a live-shaped exact second event
✓ sends canonical KM timestamps for a live-shaped reported .816Z regression event
✓ persists the live Discord event once through the closed KM wire contract

Test Files  1 passed (1)
Tests       27 passed (27)
[test] passed 1 Vitest shard in 3.13s
```

### Broader Deliberation Test Note

`pnpm test extensions/deliberation/src/hooks.test.ts extensions/deliberation/src/km-client.test.ts -- --reporter=verbose` ran 40 tests: all 27 hook tests passed, while two unrelated pre-existing reservation-response assertions in the concurrently modified `km-client.test.ts` failed (`KM returned an invalid reservation`). Those failures do not exercise timestamp serialization and were not changed for this task.
