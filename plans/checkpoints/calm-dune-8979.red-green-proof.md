# TDD Red-Green Proof: calm-dune-8979

<!-- proof-capture-metadata: {"version":1,"task_id":"calm-dune-8979","command":["pnpm","test","extensions/deliberation/src/hooks.test.ts","--","--reporter=verbose"],"command_sha256":"33bae4d923382fdf0cd461acc456f7150d4bf2705f25120dde744dd42e3a271c"} -->

## RED Phase

- **Timestamp:** 2026-08-01T20:12:51.402004+00:00
- **Test command:** `pnpm test extensions/deliberation/src/hooks.test.ts -- --reporter=verbose`
- **Exit code:** 1

### Standard Output

```text

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > excludes processing before KM intake and never claims 20ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > submits exact source intake once and remains non-claiming 1ms
 × |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > intakes the canonical Discord channel event shape 2ms
   → expected "vi.fn()" to be called with arguments: [ ObjectContaining{…} ]

Number of calls: 0

 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > silences but does not intake a source event without a stable message ID 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > silences exact sources independently of KM 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > blocks send tools and canonical sends for restricted sessions 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > keeps source traffic silent while v2 work is disabled 0ms

 Test Files  1 failed (1)
      Tests  1 failed | 6 passed (7)
   Start at  22:12:51
   Duration  202ms (transform 97ms, setup 74ms, import 43ms, tests 26ms, environment 0ms)

[ELIFECYCLE] Test failed. See above for more details.
```

### Standard Error

```text
$ node scripts/test-projects.mjs extensions/deliberation/src/hooks.test.ts -- --reporter=verbose
[test] starting test/vitest/vitest.extensions.config.ts

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > intakes the canonical Discord channel event shape
AssertionError: expected "vi.fn()" to be called with arguments: [ ObjectContaining{…} ]

Number of calls: 0

 ❯ extensions/deliberation/src/hooks.test.ts:100:20
     98|     );
     99|
    100|     expect(intake).toHaveBeenCalledWith(
       |                    ^
    101|       expect.objectContaining({
    102|         providerEventId: "m1",

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯

[test] failed 1 Vitest shard in 2.95s
```

## GREEN Phase

- **Timestamp:** 2026-08-01T20:14:41.937676+00:00
- **Test command:** `pnpm test extensions/deliberation/src/hooks.test.ts -- --reporter=verbose`
- **Exit code:** 0

### Standard Output

```text

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > excludes processing before KM intake and never claims 18ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > submits exact source intake once and remains non-claiming 1ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > intakes the canonical Discord channel event shape 1ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > intakes blank-text audio with a MIME-only placeholder 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > logs the 'disabled config' skip without intake 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > logs the 'processing route' skip without intake 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > logs the 'unmatched route' skip without intake 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > logs the 'missing message id' skip without intake 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > logs the 'missing sender id' skip without intake 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > logs the 'empty content' skip without intake 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > warns about KM failure without leaking message or media values 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > silences but does not intake a source event without a stable message ID 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > silences exact sources independently of KM 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > blocks send tools and canonical sends for restricted sessions 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > keeps source traffic silent while v2 work is disabled 0ms

 Test Files  1 passed (1)
      Tests  15 passed (15)
   Start at  22:14:41
   Duration  198ms (transform 90ms, setup 65ms, import 53ms, tests 24ms, environment 0ms)

```

### Standard Error

```text
$ node scripts/test-projects.mjs extensions/deliberation/src/hooks.test.ts -- --reporter=verbose
[test] starting test/vitest/vitest.extensions.config.ts
[test] passed 1 Vitest shard in 2.82s
```
