# TDD Red-Green Proof: calm-fork-3432

<!-- proof-capture-metadata: {"version":1,"task_id":"calm-fork-3432","command":["node","scripts/run-vitest.mjs","run","--config","test/vitest/vitest.config.ts","test/scripts/bundled-plugin-build-entries.test.ts","--maxWorkers=2"],"command_sha256":"58432478cd0804fcc8dbc76498fb344c355c6dcf8955379b80cab3c02a49bfbb"} -->

## RED Phase

- **Timestamp:** 2026-10-04T14:23:37.967836+00:00
- **Test command:** `node scripts/run-vitest.mjs run --config test/vitest/vitest.config.ts test/scripts/bundled-plugin-build-entries.test.ts --maxWorkers=2`
- **Exit code:** 1

### Standard Output

```text

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

 ❯ |tooling| ../scripts/bundled-plugin-build-entries.test.ts (17 tests | 1 failed) 700ms
     × retires the replaced Deliberation source package from the host 3ms

 Test Files  1 failed (1)
      Tests  1 failed | 16 passed (17)
   Start at  16:23:37
   Duration  919ms (transform 137ms, setup 102ms, import 24ms, tests 700ms, environment 0ms)

```

### Standard Error

```text
































⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  |tooling| ../scripts/bundled-plugin-build-entries.test.ts > bundled plugin build entries > retires the replaced Deliberation source package from the host
AssertionError: expected true to be false // Object.is equality

- Expected
+ Received

- false
+ true

 ❯ ../scripts/bundled-plugin-build-entries.test.ts:72:71
     70|
     71|   it("retires the replaced Deliberation source package from the host",…
     72|     expect(fs.existsSync(path.resolve("extensions", "deliberation"))).…
       |                                                                       ^
     73|   });
     74|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯

```

## GREEN Phase

- **Timestamp:** 2026-10-04T14:31:36.102123+00:00
- **Test command:** `node scripts/run-vitest.mjs run --config test/vitest/vitest.config.ts test/scripts/bundled-plugin-build-entries.test.ts --maxWorkers=2`
- **Exit code:** 0

### Standard Output

```text

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork


 Test Files  1 passed (1)
      Tests  17 passed (17)
   Start at  16:31:35
   Duration  953ms (transform 154ms, setup 114ms, import 9ms, tests 739ms, environment 0ms)

```

### Standard Error

```text








[vitest] still running with no output for 30000ms (run --config test/vitest/vitest.config.ts test/scripts/bundled-plugin-build-entries.test.ts --maxWorkers=2 --passWithNoTests=false).

















```
