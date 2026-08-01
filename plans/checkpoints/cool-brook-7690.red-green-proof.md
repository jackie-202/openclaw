# TDD Red-Green Proof: cool-brook-7690

<!-- proof-capture-metadata: {"version":1,"task_id":"cool-brook-7690","command":["node","scripts/run-vitest.mjs","extensions/deliberation/src/km-client.test.ts","--reporter=verbose"],"command_sha256":"38e615f0986a13babd78a3630834f66251c820a75842d28bf71efdb08cedc78a"} -->

## RED Phase

- **Timestamp:** 2026-07-31T22:33:30.008622+00:00
- **Test command:** `node scripts/run-vitest.mjs extensions/deliberation/src/km-client.test.ts --reporter=verbose`
- **Exit code:** 1

### Standard Output

```text

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

 × |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > uses the canonical protocol header and reservations route 30ms
   → expected 'https://km.invalid/deliberation/v1/de…' to be 'https://km.invalid/deliberation/v1/re…' // Object.is equality
   → expected { accept: 'application/json', …(3) } to match object { …(1) }
(4 matching properties omitted from actual)
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects control responses outside the accepted closed schema 1ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > uses a credential already materialized by the secrets runtime 0ms

 Test Files  1 failed (1)
      Tests  1 failed | 2 passed (3)
   Start at  00:33:29
   Duration  342ms (transform 156ms, setup 73ms, import 177ms, tests 32ms, environment 0ms)

```

### Standard Error

```text
[test] starting test/vitest/vitest.extensions.config.ts

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > uses the canonical protocol header and reservations route
AssertionError: expected 'https://km.invalid/deliberation/v1/de…' to be 'https://km.invalid/deliberation/v1/re…' // Object.is equality

Expected: "https://km.invalid/deliberation/v1/reservations"
Received: "https://km.invalid/deliberation/v1/deliveries/undefined/reserve"

 ❯ extensions/deliberation/src/km-client.test.ts:51:47
     49|     );
     50|
     51|     expect.soft(fetchImpl.mock.calls[0]?.[0]).toBe(
       |                                               ^
     52|       "https://km.invalid/deliberation/v1/reservations",
     53|     );

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > uses the canonical protocol header and reservations route
AssertionError: expected { accept: 'application/json', …(3) } to match object { …(1) }
(4 matching properties omitted from actual)

- Expected
+ Received

  {
-   "X-Deliberation-Protocol-Version": "1",
+   "accept": "application/json",
+   "authorization": "Bearer test-only",
+   "content-type": "application/json",
+   "x-deliberation-protocol": "v1",
  }

 ❯ extensions/deliberation/src/km-client.test.ts:54:56
     52|       "https://km.invalid/deliberation/v1/reservations",
     53|     );
     54|     expect.soft(fetchImpl.mock.calls[0]?.[1]?.headers).toMatchObject({
       |                                                        ^
     55|       "X-Deliberation-Protocol-Version": "1",
     56|     });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯

[test] failed 1 Vitest shard in 3.05s
```

## GREEN Phase

- **Timestamp:** 2026-07-31T22:37:49.244672+00:00
- **Test command:** `node scripts/run-vitest.mjs extensions/deliberation/src/km-client.test.ts --reporter=verbose`
- **Exit code:** 0

### Standard Output

```text

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > uses the canonical protocol header and reservations route 30ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects health responses outside the accepted closed schema 1ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > uses a credential already materialized by the secrets runtime 1ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > uses only the six canonical endpoint paths 1ms

 Test Files  1 passed (1)
      Tests  4 passed (4)
   Start at  00:37:48
   Duration  412ms (transform 170ms, setup 84ms, import 223ms, tests 34ms, environment 0ms)

```

### Standard Error

```text
[test] starting test/vitest/vitest.extensions.config.ts
[test] passed 1 Vitest shard in 3.68s
```
