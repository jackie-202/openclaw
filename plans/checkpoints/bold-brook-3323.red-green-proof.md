# TDD Red-Green Proof: bold-brook-3323

<!-- proof-capture-metadata: {"version":1,"task_id":"bold-brook-3323","command":["pnpm","test","extensions/deliberation/src/delivery-composition.test.ts","--","--reporter=verbose"],"command_sha256":"3033c2178c9c122331ed938418c79fb5dbb75d8d14aedd01126f00f0cdee8397"} -->

## RED Phase

- **Timestamp:** 2026-08-21T17:07:48.008183+00:00
- **Test command:** `pnpm test extensions/deliberation/src/delivery-composition.test.ts -- --reporter=verbose`
- **Exit code:** 1

### Standard Output

```text

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

 × |extensions| extensions/deliberation/src/delivery-composition.test.ts > Deliberation native adapter composition > requires the real discord adapter single-attempt capability 4ms
   → expected undefined to deeply equal Any<Function>
 × |extensions| extensions/deliberation/src/delivery-composition.test.ts > Deliberation native adapter composition > requires the real slack adapter single-attempt capability 0ms
   → expected undefined to deeply equal Any<Function>

 Test Files  1 failed (1)
      Tests  2 failed (2)
   Start at  19:07:40
   Duration  7.44s (transform 5.87s, setup 91ms, import 7.27s, tests 6ms, environment 0ms)

[ELIFECYCLE] Test failed. See above for more details.
```

### Standard Error

```text
$ node scripts/test-projects.mjs extensions/deliberation/src/delivery-composition.test.ts -- --reporter=verbose
[test] queued behind the local heavy-check lock held by test, pid 45611, cwd /Users/michal/Projects/openclaw-fork...
[test] still waiting 15s for the local heavy-check lock held by test, pid 45611, cwd /Users/michal/Projects/openclaw-fork...
[test] still waiting 30s for the local heavy-check lock held by test, pid 45611, cwd /Users/michal/Projects/openclaw-fork...
[test] still waiting 46s for the local heavy-check lock held by test, pid 45611, cwd /Users/michal/Projects/openclaw-fork...
[test] starting test/vitest/vitest.extensions.config.ts

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  |extensions| extensions/deliberation/src/delivery-composition.test.ts > Deliberation native adapter composition > requires the real discord adapter single-attempt capability
 FAIL  |extensions| extensions/deliberation/src/delivery-composition.test.ts > Deliberation native adapter composition > requires the real slack adapter single-attempt capability
AssertionError: expected undefined to deeply equal Any<Function>

- Expected:
Any<Function>

+ Received:
undefined

 ❯ extensions/deliberation/src/delivery-composition.test.ts:13:38
     11|     const adapter: ChannelOutboundAdapter | undefined = outbound;
     12|
     13|     expect(adapter?.sendTextAttempt).toEqual(expect.any(Function));
       |                                      ^
     14|   });
     15| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

[test] failed 1 Vitest shard in 64.77s
```

## GREEN Phase

- **Timestamp:** 2026-08-21T17:28:44.729405+00:00
- **Test command:** `pnpm test extensions/deliberation/src/delivery-composition.test.ts -- --reporter=verbose`
- **Exit code:** 0

### Standard Output

```text

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

 ✓ |extensions| extensions/deliberation/src/delivery-composition.test.ts > Deliberation native adapter composition > requires the real discord adapter single-attempt capability 2ms
 ✓ |extensions| extensions/deliberation/src/delivery-composition.test.ts > Deliberation native adapter composition > requires the real slack adapter single-attempt capability 0ms
 ✓ |extensions| extensions/deliberation/src/delivery-composition.test.ts > Deliberation native adapter composition > carries the durable key into one Discord native request 11ms
 ✓ |extensions| extensions/deliberation/src/delivery-composition.test.ts > Deliberation native adapter composition > does not retry an ambiguous Discord native request 1ms
 ✓ |extensions| extensions/deliberation/src/delivery-composition.test.ts > Deliberation native adapter composition > rejects over-limit Discord text before a native request 1ms
 ✓ |extensions| extensions/deliberation/src/delivery-composition.test.ts > Deliberation native adapter composition > uses one Slack native post and records unsupported idempotency honestly 3ms
 ✓ |extensions| extensions/deliberation/src/delivery-composition.test.ts > Deliberation native adapter composition > does not retry an accepted-then-error Slack native request 1ms
 ✓ |extensions| extensions/deliberation/src/delivery-composition.test.ts > Deliberation native adapter composition > rejects Slack text that renders into multiple messages before posting 2ms

 Test Files  1 passed (1)
      Tests  8 passed (8)
   Start at  19:28:41
   Duration  3.60s (transform 2.15s, setup 84ms, import 3.42s, tests 24ms, environment 0ms)

```

### Standard Error

```text
$ node scripts/test-projects.mjs extensions/deliberation/src/delivery-composition.test.ts -- --reporter=verbose
[test] starting test/vitest/vitest.extensions.config.ts
[test] passed 1 Vitest shard in 6.58s
```
