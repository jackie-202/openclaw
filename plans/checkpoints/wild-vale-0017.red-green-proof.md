# TDD Red-Green Proof: wild-vale-0017

<!-- proof-capture-metadata: {"version":1,"task_id":"wild-vale-0017","command":["node","scripts/run-vitest.mjs","src/plugins/source-checkout-runtime.test.ts"],"command_sha256":"a8746bac15fb1a8031aebe0749d2892114368cd04dc3da4a474b501dc99196a4"} -->

## RED Phase
- **Timestamp:** 2026-08-18T19:20:26.761720+00:00
- **Test command:** `node scripts/run-vitest.mjs src/plugins/source-checkout-runtime.test.ts`
- **Exit code:** 1

### Standard Output
````text

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

 ❯ |plugins| src/plugins/source-checkout-runtime.test.ts (3 tests | 1 failed) 130785ms
     × loads Deliberation with exactly four hooks 130124ms

 Test Files  1 failed (1)
      Tests  1 failed | 2 passed (3)
   Start at  21:18:14
   Duration  132.59s (transform 1.35s, setup 175ms, import 1.55s, tests 130.78s, environment 0ms)

````

### Standard Error
````text
[test] starting test/vitest/vitest.plugins.config.ts
[vitest] still running with no output for 30000ms (test/vitest/vitest.plugins.config.ts).
[vitest] still running with no output for 60000ms (test/vitest/vitest.plugins.config.ts).
[vitest] still running with no output for 90000ms (test/vitest/vitest.plugins.config.ts).
[vitest] still running with no output for 120000ms (test/vitest/vitest.plugins.config.ts).

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  |plugins| src/plugins/source-checkout-runtime.test.ts > source checkout bundled plugin runtime > loads Deliberation with exactly four hooks
AssertionError: expected [ { pluginId: 'deliberation', …(6) } ] to have a length of +0 but got 1

- Expected
+ Received

- 0
+ 1

 ❯ src/plugins/source-checkout-runtime.test.ts:86:88
     84|         .map((hook) => hook.hookName),
     85|     ).toEqual(["inbound_claim", "before_dispatch", "before_tool_call",…
     86|     expect(registry.services.filter((service) => service.pluginId === …
       |                                                                                        ^
     87|       0,
     88|     );

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯

[test] failed 1 Vitest shard in 135.20s
````

## GREEN Phase
- **Timestamp:** 2026-08-18T19:22:33.967575+00:00
- **Test command:** `node scripts/run-vitest.mjs src/plugins/source-checkout-runtime.test.ts`
- **Exit code:** 0

### Standard Output
````text

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork


 Test Files  1 passed (1)
      Tests  3 passed (3)
   Start at  21:21:12
   Duration  81.83s (transform 396ms, setup 81ms, import 757ms, tests 80.92s, environment 0ms)

````

### Standard Error
````text
[test] starting test/vitest/vitest.plugins.config.ts
[vitest] still running with no output for 30000ms (test/vitest/vitest.plugins.config.ts).
[vitest] still running with no output for 60000ms (test/vitest/vitest.plugins.config.ts).
[test] passed 1 Vitest shard in 84.49s
````
