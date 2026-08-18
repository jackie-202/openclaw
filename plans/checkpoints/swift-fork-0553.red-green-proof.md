# TDD Red-Green Proof: swift-fork-0553

<!-- proof-capture-metadata: {"version":1,"task_id":"swift-fork-0553","command":["pnpm","test","extensions/deliberation/src/plugin.test.ts","extensions/deliberation/src/final-adapter.test.ts"],"command_sha256":"a14d1a6bc310cc9dc9313b00d9cdb14a49e3f1efbec6fb7047590e44feadc1a8"} -->

## RED Phase
- **Timestamp:** 2026-08-13T12:04:55.320313+00:00
- **Test command:** `pnpm test extensions/deliberation/src/plugin.test.ts extensions/deliberation/src/final-adapter.test.ts`
- **Exit code:** 1

### Standard Output
````text

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

 ❯ |extensions| extensions/deliberation/src/plugin.test.ts (7 tests | 4 failed) 18ms
     × registers fail-closed hooks, read-only KM health, and one final sender 12ms
     × delivers one ready item through the exact Discord account and stops its timer 2ms
     × contains provider failures and records FAILED 0ms
     × serializes repeated ticks and waits for the active tick during stop 1ms

 Test Files  1 failed | 1 passed (2)
      Tests  4 failed | 6 passed (10)
   Start at  14:04:54
   Duration  1.16s (transform 869ms, setup 170ms, import 1.02s, tests 46ms, environment 0ms)

[ELIFECYCLE] Test failed. See above for more details.
````

### Standard Error
````text
$ node scripts/test-projects.mjs extensions/deliberation/src/plugin.test.ts extensions/deliberation/src/final-adapter.test.ts
[test] starting test/vitest/vitest.extensions.config.ts

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 4 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > registers fail-closed hooks, read-only KM health, and one final sender
AssertionError: expected "vi.fn()" to be called 1 times, but got 0 times
 ❯ extensions/deliberation/src/plugin.test.ts:96:29
     94|       { priority: 1000 },
     95|     ]);
     96|     expect(registerService).toHaveBeenCalledTimes(1);
       |                             ^
     97|     expect(registerGatewayMethod.mock.calls.map(([name]) => name)).toE…
     98|       "deliberation.status",

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/4]⎯

 FAIL  |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > delivers one ready item through the exact Discord account and stops its timer
AssertionError: expected [] to have a length of 1 but got +0

- Expected
+ Received

- 1
+ 0

 ❯ extensions/deliberation/src/plugin.test.ts:115:22
    113|     const { api, services, loadAdapter } = registerPlugin(km, sendText…
    114|
    115|     expect(services).toHaveLength(1);
       |                      ^
    116|     await services[0]?.start({ config: api.config, stateDir: "/tmp", l…
    117|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/4]⎯

 FAIL  |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > contains provider failures and records FAILED
TypeError: You must provide a Promise to expect() when using .resolves, not 'undefined'.
 ❯ extensions/deliberation/src/plugin.test.ts:175:5
    173|     await expect(
    174|       services[0]?.start({ config: api.config, stateDir: "/tmp", logge…
    175|     ).resolves.toBeUndefined();
       |     ^
    176|     await services[0]?.stop?.({ config: api.config, stateDir: "/tmp", …
    177|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/4]⎯

 FAIL  |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > serializes repeated ticks and waits for the active tick during stop
AssertionError: expected "vi.fn()" to be called 1 times, but got 0 times
 ❯ extensions/deliberation/src/plugin.test.ts:198:22
    196|     });
    197|     await vi.advanceTimersByTimeAsync(60_000);
    198|     expect(km.ready).toHaveBeenCalledTimes(1);
       |                      ^
    199|
    200|     const stopPromise = services[0]?.stop?.({

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/4]⎯

[test] failed 1 Vitest shard in 4.00s
````

## GREEN Phase
- **Timestamp:** 2026-08-13T12:05:58.154846+00:00
- **Test command:** `pnpm test extensions/deliberation/src/plugin.test.ts extensions/deliberation/src/final-adapter.test.ts`
- **Exit code:** 0

### Standard Output
````text

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork


 Test Files  2 passed (2)
      Tests  10 passed (10)
   Start at  14:05:57
   Duration  830ms (transform 499ms, setup 226ms, import 641ms, tests 49ms, environment 0ms)

````

### Standard Error
````text
$ node scripts/test-projects.mjs extensions/deliberation/src/plugin.test.ts extensions/deliberation/src/final-adapter.test.ts
[test] starting test/vitest/vitest.extensions.config.ts
[test] passed 1 Vitest shard in 4.11s
````
