# TDD Red-Green Proof: cool-brook-8631

<!-- proof-capture-metadata: {"version":1,"task_id":"cool-brook-8631","command":["pnpm","test","extensions/deliberation/src/final-adapter.test.ts"],"command_sha256":"1d17fc47ea929ff03d6b48d7f7ac6224d144e3f0d7590ce34409276bf66626f4"} -->

## RED Phase

- **Timestamp:** 2026-08-25T13:15:08.533650+00:00
- **Test command:** `pnpm test extensions/deliberation/src/final-adapter.test.ts`
- **Exit code:** 1

### Standard Output

```text

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

 ❯ |extensions| extensions/deliberation/src/final-adapter.test.ts (22 tests | 1 failed) 46ms
     × derives a bounded deterministic provider key per delivery attempt 6ms

 Test Files  1 failed (1)
      Tests  1 failed | 21 passed (22)
   Start at  15:15:07
   Duration  617ms (transform 341ms, setup 135ms, import 349ms, tests 46ms, environment 0ms)

[ELIFECYCLE] Test failed. See above for more details.
```

### Standard Error

```text
$ node scripts/test-projects.mjs extensions/deliberation/src/final-adapter.test.ts
[test] queued behind the local heavy-check lock held by test, pid 33540, cwd /Users/michal/Projects/openclaw-fork...
[test] starting test/vitest/vitest.extensions.config.ts

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > derives a bounded deterministic provider key per delivery attempt
AssertionError: expected 'provider:6488c0ba0123456789abcdef0123…' to match /^[0-9a-f]{24}$/

- Expected:
/^[0-9a-f]{24}$/

+ Received:
"provider:6488c0ba0123456789abcdef01234567"

 ❯ extensions/deliberation/src/final-adapter.test.ts:86:19
     84|     const second = await captureProviderIdempotencyKey(secondAttempt);
     85|
     86|     expect(first).toMatch(/^[0-9a-f]{24}$/);
       |                   ^
     87|     expect(first.length).toBeLessThanOrEqual(25);
     88|     expect(repeated).toBe(first);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯

[test] failed 1 Vitest shard in 6.80s
```

## GREEN Phase

- **Timestamp:** 2026-08-25T13:16:08.903954+00:00
- **Test command:** `pnpm test extensions/deliberation/src/final-adapter.test.ts`
- **Exit code:** 0

### Standard Output

```text

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork


 Test Files  1 passed (1)
      Tests  22 passed (22)
   Start at  15:16:07
   Duration  1.38s (transform 538ms, setup 337ms, import 808ms, tests 49ms, environment 0ms)

```

### Standard Error

```text
$ node scripts/test-projects.mjs extensions/deliberation/src/final-adapter.test.ts
[test] starting test/vitest/vitest.extensions.config.ts
[test] passed 1 Vitest shard in 7.67s
```
