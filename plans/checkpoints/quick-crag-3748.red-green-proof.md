# TDD Red-Green Proof: quick-crag-3748

<!-- proof-capture-metadata: {"version":1,"task_id":"quick-crag-3748","command":["node","scripts/run-vitest.mjs","extensions/deliberation/scripts/intake-producer.test.ts","--reporter=verbose"],"command_sha256":"39025b0ac561f6fe3d6bd855fbff793c37af6ba0d29f96eae2961e846574da67"} -->

## RED Phase
- **Timestamp:** 2026-08-14T12:20:13.925144+00:00
- **Test command:** `node scripts/run-vitest.mjs extensions/deliberation/scripts/intake-producer.test.ts --reporter=verbose`
- **Exit code:** 1

### Standard Output
````text

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

 × |extensions| extensions/deliberation/scripts/intake-producer.test.ts > deliberation intake producer > serializes the configured final target without replacing source identity 29ms
   → invalid producer input
 ✓ |extensions| extensions/deliberation/scripts/intake-producer.test.ts > deliberation intake producer > validates input and reports duplicate replay without exposing content or credentials 12ms
 ✓ |extensions| extensions/deliberation/scripts/intake-producer.test.ts > deliberation intake producer > rejects malformed producer input before making a request 1ms
 ✓ |extensions| extensions/deliberation/scripts/intake-producer.test.ts > deliberation intake producer > returns bounded KM rejection diagnostics 2ms
 ✓ |extensions| extensions/deliberation/scripts/intake-producer.test.ts > deliberation intake producer > makes zero KM requests for a processing route 0ms
 ✓ |extensions| extensions/deliberation/scripts/intake-producer.test.ts > deliberation intake producer > makes zero KM requests for a wrong account route 0ms

 Test Files  1 failed (1)
      Tests  1 failed | 5 passed (6)
   Start at  14:20:13
   Duration  546ms (transform 228ms, setup 112ms, import 304ms, tests 45ms, environment 0ms)

````

### Standard Error
````text
[test] queued behind the local heavy-check lock held by test, pid 63902, cwd /Users/michal/Projects/openclaw-fork...
[test] still waiting 15s for the local heavy-check lock held by test, pid 63902, cwd /Users/michal/Projects/openclaw-fork...
[test] still waiting 30s for the local heavy-check lock held by test, pid 63902, cwd /Users/michal/Projects/openclaw-fork...
[test] still waiting 45s for the local heavy-check lock held by test, pid 63902, cwd /Users/michal/Projects/openclaw-fork...
[test] still waiting 1m 1s for the local heavy-check lock held by test, pid 63902, cwd /Users/michal/Projects/openclaw-fork...
[test] starting test/vitest/vitest.extensions.config.ts

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  |extensions| extensions/deliberation/scripts/intake-producer.test.ts > deliberation intake producer > serializes the configured final target without replacing source identity
Error: invalid producer input
 ❯ runIntakeProducer extensions/deliberation/scripts/intake-producer.ts:57:11
     55|   const parsed = inputSchema.safeParse(input);
     56|   if (!parsed.success) {
     57|     throw new Error("invalid producer input");
       |           ^
     58|   }
     59|   const { endpoint, routes, event } = parsed.data;
 ❯ extensions/deliberation/scripts/intake-producer.test.ts:46:13

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯

[test] failed 1 Vitest shard in 74.58s
````

## GREEN Phase
- **Timestamp:** 2026-08-14T12:26:20.741371+00:00
- **Test command:** `node scripts/run-vitest.mjs extensions/deliberation/scripts/intake-producer.test.ts --reporter=verbose`
- **Exit code:** 0

### Standard Output
````text

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

 ✓ |extensions| extensions/deliberation/scripts/intake-producer.test.ts > deliberation intake producer > serializes the configured final target without replacing source identity 49ms
 ✓ |extensions| extensions/deliberation/scripts/intake-producer.test.ts > deliberation intake producer > validates input and reports duplicate replay without exposing content or credentials 4ms
 ✓ |extensions| extensions/deliberation/scripts/intake-producer.test.ts > deliberation intake producer > rejects malformed producer input before making a request 1ms
 ✓ |extensions| extensions/deliberation/scripts/intake-producer.test.ts > deliberation intake producer > returns bounded KM rejection diagnostics 1ms
 ✓ |extensions| extensions/deliberation/scripts/intake-producer.test.ts > deliberation intake producer > makes zero KM requests for a processing route 0ms
 ✓ |extensions| extensions/deliberation/scripts/intake-producer.test.ts > deliberation intake producer > makes zero KM requests for a wrong account route 0ms

 Test Files  1 passed (1)
      Tests  6 passed (6)
   Start at  14:26:19
   Duration  905ms (transform 492ms, setup 161ms, import 594ms, tests 60ms, environment 0ms)

````

### Standard Error
````text
[test] starting test/vitest/vitest.extensions.config.ts
[test] passed 1 Vitest shard in 4.26s
````
