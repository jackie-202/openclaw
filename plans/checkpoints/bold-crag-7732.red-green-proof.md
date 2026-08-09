# TDD Red-Green Proof: bold-crag-7732

<!-- proof-capture-metadata: {"version":1,"task_id":"bold-crag-7732","command":["pnpm","test","extensions/deliberation/src/hooks.test.ts","--","--reporter=verbose","-t","keeps configured Discord accounts distinct"],"command_sha256":"bd7494fdf44106a02f870550250b7f46237cedbdd330014c3edda7bac64df23a"} -->

## RED Phase

- **Timestamp:** 2026-08-06T22:14:19.769307+00:00
- **Test command:** `pnpm test extensions/deliberation/src/hooks.test.ts -- --reporter=verbose -t 'keeps configured Discord accounts distinct'`
- **Exit code:** 1

### Standard Output

```text

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

 × |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > keeps configured Discord accounts distinct for the same channel 63ms
   → expected [ 'discord:channel:source', …(1) ] to deeply equal [ 'v1:discord:account-a:source', …(1) ]
 ↓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > persists the live Discord event once through the closed KM wire contract
 ↓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > excludes processing before KM intake and never claims
 ↓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > submits canonical source intake for account 'default' and target 'source'
 ↓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > submits canonical source intake for account 'default' and target 'channel:source'
 ↓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > submits canonical source intake for account 'work' and target 'source'
 ↓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > submits canonical source intake for account 'work' and target 'channel:source'
 ↓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > sends canonical KM timestamps for a live-shaped exact second event
 ↓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > sends canonical KM timestamps for a live-shaped non-zero milliseconds event
 ↓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > intakes the canonical Discord channel event shape
 ↓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > queues and terminally claims the configured Discord source only
 ↓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > intakes blank-text audio with a MIME-only placeholder
 ↓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > logs the 'disabled config' skip without intake
 ↓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > logs the 'processing route' skip without intake
 ↓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > logs the 'unmatched route' skip without intake
 ↓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > logs the 'non-Discord route' skip without intake
 ↓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > logs the 'missing account' skip without intake
 ↓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > logs the 'missing target' skip without intake
 ↓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > logs the 'missing message id' skip without intake
 ↓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > logs the 'missing sender id' skip without intake
 ↓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > logs the 'empty content' skip without intake
 ↓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > warns about KM failure without leaking message or media values
 ↓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > silences but does not intake a source event without a stable message ID
 ↓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > silences exact sources independently of KM
 ↓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > blocks send tools and canonical sends for restricted sessions
 ↓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > keeps source traffic silent while v2 work is disabled

 Test Files  1 failed (1)
      Tests  1 failed | 25 skipped (26)
   Start at  00:14:19
   Duration  382ms (transform 294ms, setup 64ms, import 197ms, tests 64ms, environment 0ms)

[ELIFECYCLE] Test failed. See above for more details.
```

### Standard Error

```text
$ node scripts/test-projects.mjs extensions/deliberation/src/hooks.test.ts -- --reporter=verbose -t 'keeps configured Discord accounts distinct'
[test] starting test/vitest/vitest.extensions.config.ts

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > keeps configured Discord accounts distinct for the same channel
AssertionError: expected [ 'discord:channel:source', …(1) ] to deeply equal [ 'v1:discord:account-a:source', …(1) ]

- Expected
+ Received

  [
-   "v1:discord:account-a:source",
-   "v1:discord:account-b:source",
+   "discord:channel:source",
+   "discord:channel:source",
  ]

 ❯ extensions/deliberation/src/hooks.test.ts:83:72
     81|
     82|     expect(intake).toHaveBeenCalledTimes(2);
     83|     expect(intake.mock.calls.map(([request]) => request.sourceTarget))…
       |                                                                        ^
     84|       "v1:discord:account-a:source",
     85|       "v1:discord:account-b:source",

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯

[test] failed 1 Vitest shard in 3.07s
```

## GREEN Phase

- **Timestamp:** 2026-08-06T22:17:41.331582+00:00
- **Test command:** `pnpm test extensions/deliberation/src/hooks.test.ts -- --reporter=verbose -t 'keeps configured Discord accounts distinct'`
- **Exit code:** 0

### Standard Output

```text

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > keeps configured Discord accounts distinct for the same channel 19ms
 ↓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > persists the live Discord event once through the closed KM wire contract
 ↓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > excludes processing before KM intake and never claims
 ↓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > submits canonical source intake for account 'default' and target 'source'
 ↓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > submits canonical source intake for account 'default' and target 'channel:source'
 ↓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > submits canonical source intake for account 'work' and target 'source'
 ↓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > submits canonical source intake for account 'work' and target 'channel:source'
 ↓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > sends canonical KM timestamps for a live-shaped exact second event
 ↓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > sends canonical KM timestamps for a live-shaped non-zero milliseconds event
 ↓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > intakes the canonical Discord channel event shape
 ↓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > queues and terminally claims the configured Discord source only
 ↓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > intakes blank-text audio with a MIME-only placeholder
 ↓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > logs the 'disabled config' skip without intake
 ↓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > logs the 'processing route' skip without intake
 ↓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > logs the 'unmatched route' skip without intake
 ↓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > logs the 'non-Discord route' skip without intake
 ↓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > logs the 'missing account' skip without intake
 ↓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > logs the 'missing target' skip without intake
 ↓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > logs the 'missing message id' skip without intake
 ↓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > logs the 'missing sender id' skip without intake
 ↓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > logs the 'empty content' skip without intake
 ↓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > warns about KM failure without leaking message or media values
 ↓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > silences but does not intake a source event without a stable message ID
 ↓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > silences exact sources independently of KM
 ↓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > blocks send tools and canonical sends for restricted sessions
 ↓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > keeps source traffic silent while v2 work is disabled

 Test Files  1 passed (1)
      Tests  1 passed | 25 skipped (26)
   Start at  00:17:40
   Duration  482ms (transform 221ms, setup 95ms, import 301ms, tests 20ms, environment 0ms)

```

### Standard Error

```text
$ node scripts/test-projects.mjs extensions/deliberation/src/hooks.test.ts -- --reporter=verbose -t 'keeps configured Discord accounts distinct'
[test] starting test/vitest/vitest.extensions.config.ts
[test] passed 1 Vitest shard in 3.68s
```
