# TDD Red-Green Proof: calm-crag-8936

<!-- proof-capture-metadata: {"version":1,"task_id":"calm-crag-8936","command":["pnpm","test","extensions/deliberation/src/final-adapter.test.ts","--","--reporter=verbose"],"command_sha256":"d982e8113fcd3464590b63b7a360fc2381ed9a788d0451872920a60c5e2ddb16"} -->

## RED Phase
- **Timestamp:** 2026-08-14T11:46:10.737870+00:00
- **Test command:** `pnpm test extensions/deliberation/src/final-adapter.test.ts -- --reporter=verbose`
- **Exit code:** 1

### Standard Output
````text

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

 × |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > uses the durable delivery target for send and all evidence 27ms
   → expected "vi.fn()" to be called with arguments: [ ObjectContaining{…} ]

Received:

  1st vi.fn() call:

  [
-   ObjectContaining {
-     "accountId": "account-b",
-     "channelId": "channel-b",
+   {
+     "accountId": "account-a",
+     "channelId": "channel-a",
+     "idempotencyKey": "provider:attempt-1",
+     "text": "reply",
    },
  ]


Number of calls: 1

 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > durably invokes once, calls only the injected provider, and binds its receipt 1ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > terminalizes a provider failure without retrying it 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > fails closed with bounded evidence for malformed destination discord:channel-1 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > fails closed with bounded evidence for malformed destination v1:discord:account-1:channel 1 0ms

 Test Files  1 failed (1)
      Tests  1 failed | 4 passed (5)
   Start at  13:46:10
   Duration  203ms (transform 108ms, setup 92ms, import 16ms, tests 30ms, environment 0ms)

[ELIFECYCLE] Test failed. See above for more details.
````

### Standard Error
````text
$ node scripts/test-projects.mjs extensions/deliberation/src/final-adapter.test.ts -- --reporter=verbose
[test] queued behind the local heavy-check lock held by test, pid 38595, cwd /Users/michal/Projects/openclaw-fork...
[test] still waiting 15s for the local heavy-check lock held by test, pid 38595, cwd /Users/michal/Projects/openclaw-fork...
[test] still waiting 30s for the local heavy-check lock held by test, pid 38595, cwd /Users/michal/Projects/openclaw-fork...
[test] still waiting 46s for the local heavy-check lock held by test, pid 38595, cwd /Users/michal/Projects/openclaw-fork...
[test] still waiting 1m 1s for the local heavy-check lock held by test, pid 38595, cwd /Users/michal/Projects/openclaw-fork...
[test] still waiting 1m 16s for the local heavy-check lock held by test, pid 38595, cwd /Users/michal/Projects/openclaw-fork...
[test] starting test/vitest/vitest.extensions.config.ts

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > uses the durable delivery target for send and all evidence
AssertionError: expected "vi.fn()" to be called with arguments: [ ObjectContaining{…} ]

Received:

  1st vi.fn() call:

  [
-   ObjectContaining {
-     "accountId": "account-b",
-     "channelId": "channel-b",
+   {
+     "accountId": "account-a",
+     "channelId": "channel-a",
+     "idempotencyKey": "provider:attempt-1",
+     "text": "reply",
    },
  ]


Number of calls: 1

 ❯ extensions/deliberation/src/final-adapter.test.ts:34:27
     32|     await createFinalDeliveryAdapter({ km, provider, owner: "owner" })…
     33|
     34|     expect(provider.send).toHaveBeenCalledWith(
       |                           ^
     35|       expect.objectContaining({ accountId: "account-b", channelId: "ch…
     36|     );

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯

[test] failed 1 Vitest shard in 90.81s
````

## GREEN Phase
- **Timestamp:** 2026-08-14T11:49:18.440738+00:00
- **Test command:** `pnpm test extensions/deliberation/src/final-adapter.test.ts -- --reporter=verbose`
- **Exit code:** 0

### Standard Output
````text

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > uses the durable delivery target for send and all evidence 26ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > durably invokes once, calls only the injected provider, and binds its receipt 1ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > terminalizes a provider failure without retrying it 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > fails closed with bounded evidence for malformed destination discord:channel-1 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > fails closed with bounded evidence for malformed destination v1:discord:account-1:channel 1 0ms

 Test Files  1 passed (1)
      Tests  5 passed (5)
   Start at  13:49:18
   Duration  221ms (transform 113ms, setup 99ms, import 21ms, tests 30ms, environment 0ms)

````

### Standard Error
````text
$ node scripts/test-projects.mjs extensions/deliberation/src/final-adapter.test.ts -- --reporter=verbose
[test] starting test/vitest/vitest.extensions.config.ts
[test] passed 1 Vitest shard in 3.64s
````
