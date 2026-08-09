# TDD Red-Green Proof: dark-crag-9165

## RED Phase

- **Provenance:** Genuine pre-implementation RED captured by parent task `swift-reef-2132` in `plans/checkpoints/swift-reef-2132.red-green-proof.md`.
- **Timestamp:** 2026-08-09T13:35:24.469660+00:00
- **Test command:** `pnpm exec vitest run extensions/deliberation/src/km-client.test.ts`
- **Exit code:** 1
- **Result:** 2 failed, 11 passed
- **Reason:** The stale reservation fixtures omitted required delivery-envelope fields, causing the endpoint test to fail with `KM returned an invalid reservation` and masking the malformed hash assertion behind the same object-shape error.

### Captured Test Output

```text
RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

❯ |extensions| ../../extensions/deliberation/src/km-client.test.ts (13 tests | 2 failed) 38ms
    × uses only the six canonical endpoint paths 3ms
    × rejects malformed closed ready, reservation, and record responses 2ms

Test Files  1 failed (1)
     Tests  2 failed | 11 passed (13)
  Duration  396ms (transform 150ms, setup 77ms, import 202ms, tests 38ms, environment 0ms)

FAIL  |extensions| ../../extensions/deliberation/src/km-client.test.ts > KM contract parsing > uses only the six canonical endpoint paths
KmRequestError: KM returned an invalid reservation

FAIL  |extensions| ../../extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed closed ready, reservation, and record responses
AssertionError: expected [Function] to throw error including 'invalid reviewedTextHash' but got 'KM returned an invalid reservation'

Expected: "invalid reviewedTextHash"
Received: "KM returned an invalid reservation"
```

The full original stdout and stderr remain in the provenance artifact named above. Per the acceptance-fix instructions, this historical RED is reused because the parent implementation already exists; no post-implementation RED was fabricated.

## GREEN Phase

- **Timestamp:** 2026-08-09T13:58:31Z
- **Implementation inspected:** `extensions/deliberation/src/km-client.test.ts` (preserved parent test-fixture repair; no follow-up production-code changes)
- **Test command:** `pnpm exec vitest run extensions/deliberation/src/km-client.test.ts`
- **Exit code:** 0
- **Result:** 0 failed, 17 passed

### Captured Test Output

```text
RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

Test Files  1 passed (1)
     Tests  17 passed (17)
  Start at  15:58:27
  Duration  359ms (transform 142ms, setup 74ms, import 182ms, tests 34ms, environment 0ms)
```

Standard error contained only repeated Rolldown `[PLUGIN_TIMINGS]` advisory warnings for `inject-file-scope-variables` and `externalize-deps`; the command exited successfully.
