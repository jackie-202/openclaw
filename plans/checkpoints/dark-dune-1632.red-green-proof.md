# TDD Red-Green Proof: dark-dune-1632

<!-- proof-capture-metadata: {"version":1,"task_id":"dark-dune-1632","command":["pnpm","test","src/channels/model-overrides.test.ts","src/config/config.plugin-validation.test.ts","src/auto-reply/reply/get-reply.fast-path.test.ts","--","--reporter=dot"],"command_sha256":"6a3d2867c0a3e75f46abb80e38203cc57886f48b49034358b36cfccfd210a092"} -->

## RED Phase
- **Timestamp:** 2026-07-24T21:21:24.682583+00:00
- **Test command:** `pnpm test src/channels/model-overrides.test.ts src/config/config.plugin-validation.test.ts src/auto-reply/reply/get-reply.fast-path.test.ts -- --reporter=dot`
- **Exit code:** 1

### Standard Output
````text

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

··················································x····

 Test Files  1 failed (1)
      Tests  1 failed | 54 passed (55)
   Start at  23:21:22
   Duration  2.13s (transform 732ms, setup 32ms, import 978ms, tests 1.04s, environment 0ms)

[ELIFECYCLE] Test failed. See above for more details.
````

### Standard Error
````text
$ node scripts/test-projects.mjs src/channels/model-overrides.test.ts src/config/config.plugin-validation.test.ts src/auto-reply/reply/get-reply.fast-path.test.ts -- --reporter=dot
[test] starting test/vitest/vitest.runtime-config.config.ts

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  |runtime-config| src/config/config.plugin-validation.test.ts > config plugin validation > rejects model in a channel runtime profile
AssertionError: expected true to be false // Object.is equality

- Expected
+ Received

- false
+ true

 ❯ src/config/config.plugin-validation.test.ts:1718:20
    1716|     });
    1717|
    1718|     expect(res.ok).toBe(false);
       |                    ^
    1719|     if (!res.ok) {
    1720|       expect(res.issues).toContainEqual({

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯

[test] failed 1 Vitest shard in 4.99s
````

## GREEN Phase
- **Timestamp:** 2026-07-24T21:23:47.918387+00:00
- **Test command:** `pnpm test src/channels/model-overrides.test.ts src/config/config.plugin-validation.test.ts src/auto-reply/reply/get-reply.fast-path.test.ts -- --reporter=dot`
- **Exit code:** 0

### Standard Output
````text

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

·······················································

 Test Files  1 passed (1)
      Tests  55 passed (55)
   Start at  23:23:39
   Duration  1.53s (transform 144ms, setup 10ms, import 403ms, tests 1.06s, environment 0ms)


 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

···················

 Test Files  1 passed (1)
      Tests  19 passed (19)
   Start at  23:23:42
   Duration  3.32s (transform 1.37s, setup 66ms, import 754ms, tests 2.44s, environment 0ms)


 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

··········

 Test Files  1 passed (1)
      Tests  10 passed (10)
   Start at  23:23:47
   Duration  527ms (transform 235ms, setup 79ms, import 357ms, tests 28ms, environment 0ms)

````

### Standard Error
````text
$ node scripts/test-projects.mjs src/channels/model-overrides.test.ts src/config/config.plugin-validation.test.ts src/auto-reply/reply/get-reply.fast-path.test.ts -- --reporter=dot
[test] starting test/vitest/vitest.runtime-config.config.ts
[test] starting test/vitest/vitest.auto-reply.config.ts
[test] starting test/vitest/vitest.channels.config.ts
[test] passed 3 Vitest shards in 11.18s
````
