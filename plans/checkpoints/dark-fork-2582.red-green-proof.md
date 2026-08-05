# TDD Red-Green Proof: dark-fork-2582

<!-- proof-capture-metadata: {"version":1,"task_id":"dark-fork-2582","command":["pnpm","test","extensions/deliberation/src/hooks.test.ts","extensions/deliberation/src/km-client.test.ts","--","--reporter=verbose"],"command_sha256":"39fd7c6f4acb18a23ca8baa67260ace81a053d449b12a6f94eb27cce54093c71"} -->

## RED Phase

This acceptance follow-up reuses the genuine pre-implementation RED captured by parent task `quick-peak-3638`; it does not fabricate a second RED after the implementation exists.

- Historical proof: `plans/checkpoints/quick-peak-3638.red-green-proof.md`
- Command: `pnpm test extensions/deliberation/src/hooks.test.ts extensions/deliberation/src/km-client.test.ts -- --reporter=verbose`
- Exit code: 1
- Observed regression: exact-second `occurredAt` and `receivedAt` were serialized with terminal `.000Z`; the live-shaped request-boundary mock rejected the payload and the handler returned `{ handled: false }`.
- Additional guard: non-zero `.120Z` timestamps retained their fractional milliseconds.

## GREEN Phase

- **Timestamp:** 2026-08-04T07:56:39Z
- **Test command:** `pnpm test extensions/deliberation/src/hooks.test.ts extensions/deliberation/src/km-client.test.ts -- --reporter=verbose`
- **Exit code:** 0
- **Result:** 2 test files passed; 31 tests passed; 0 failed.

### Test Output

```text
RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

✓ extensions/deliberation/src/km-client.test.ts (7 tests)
✓ extensions/deliberation/src/hooks.test.ts > deliberation hooks > sends canonical KM timestamps for a live-shaped exact second event
✓ extensions/deliberation/src/hooks.test.ts > deliberation hooks > sends canonical KM timestamps for a live-shaped non-zero milliseconds event
✓ extensions/deliberation/src/hooks.test.ts (24 tests)

Test Files  2 passed (2)
Tests       31 passed (31)
Duration    497ms
[test] passed 1 Vitest shard in 17.22s
```
