# TDD Red-Green Proof: cool-cove-3068

<!-- proof-capture-metadata: {"version":1,"task_id":"cool-cove-3068","command":["env","OPENCLAW_CURRENT_PACKAGE_TGZ=/Users/michal/.openclaw/tmp/opencode/cool-cove-3068/openclaw-current.tgz","OPENCLAW_VITEST_MAX_WORKERS=1","pnpm","test","test/scripts/deliberation-doctor-package.e2e.test.ts","--","--reporter=verbose"],"command_sha256":"cd1fe9ddcfa598ffad074b4d21c05bf9d2d154a72c78d8e2c00e3d03fd42c20d"} -->

## RED Phase

- **Timestamp:** 2026-08-23T18:02:02.808748+00:00
- **Test command:** `env OPENCLAW_CURRENT_PACKAGE_TGZ=/Users/michal/.openclaw/tmp/opencode/cool-cove-3068/openclaw-current.tgz OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test test/scripts/deliberation-doctor-package.e2e.test.ts -- --reporter=verbose`
- **Exit code:** 1

### Standard Output

```text

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

 × test/scripts/deliberation-doctor-package.e2e.test.ts > OR-22 doctor-package-writeback-built-five-hook-runtime 23173ms
   → missing packaged doctor contract: /Users/michal/.openclaw/tmp/openclaw-deliberation-doctor-4ZF99U/prefix/node_modules/openclaw/dist/extensions/deliberation/doctor-contract-api.js: expected false to be true // Object.is equality

 Test Files  1 failed (1)
      Tests  1 failed (1)
   Start at  20:01:39
   Duration  23.37s (transform 115ms, setup 105ms, import 14ms, tests 23.17s, environment 0ms)

[ELIFECYCLE] Test failed. See above for more details.
```

### Standard Error

```text
$ node scripts/test-projects.mjs test/scripts/deliberation-doctor-package.e2e.test.ts -- --reporter=verbose
[test] queued behind the local heavy-check lock held by test, pid 87455, cwd /Users/michal/Projects/openclaw-fork...
[test] still waiting 15s for the local heavy-check lock held by test, pid 87455, cwd /Users/michal/Projects/openclaw-fork...
[test] still waiting 30s for the local heavy-check lock held by test, pid 87455, cwd /Users/michal/Projects/openclaw-fork...
[test] still waiting 46s for the local heavy-check lock held by test, pid 87455, cwd /Users/michal/Projects/openclaw-fork...
[test] still waiting 1m 1s for the local heavy-check lock held by test, pid 87455, cwd /Users/michal/Projects/openclaw-fork...
[test] still waiting 1m 16s for the local heavy-check lock held by test, pid 87455, cwd /Users/michal/Projects/openclaw-fork...
[test] still waiting 1m 31s for the local heavy-check lock held by test, pid 87455, cwd /Users/michal/Projects/openclaw-fork...
[test] still waiting 1m 47s for the local heavy-check lock held by test, pid 87455, cwd /Users/michal/Projects/openclaw-fork...
[test] still waiting 2m 2s for the local heavy-check lock held by test, pid 87455, cwd /Users/michal/Projects/openclaw-fork...
[test] still waiting 2m 17s for the local heavy-check lock held by test, pid 87455, cwd /Users/michal/Projects/openclaw-fork...
[test] still waiting 2m 32s for the local heavy-check lock held by test, pid 87455, cwd /Users/michal/Projects/openclaw-fork...
[test] still waiting 2m 48s for the local heavy-check lock held by test, pid 87455, cwd /Users/michal/Projects/openclaw-fork...
[test] still waiting 3m 3s for the local heavy-check lock held by test, pid 87455, cwd /Users/michal/Projects/openclaw-fork...
[test] starting test/vitest/vitest.e2e.config.ts

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  test/scripts/deliberation-doctor-package.e2e.test.ts > OR-22 doctor-package-writeback-built-five-hook-runtime
AssertionError: missing packaged doctor contract: /Users/michal/.openclaw/tmp/openclaw-deliberation-doctor-4ZF99U/prefix/node_modules/openclaw/dist/extensions/deliberation/doctor-contract-api.js: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ test/scripts/deliberation-doctor-package.e2e.test.ts:98:86
     96|       "doctor-contract-api.js",
     97|     );
     98|     expect(fs.existsSync(contract), `missing packaged doctor contract:…
       |                                                                                      ^
     99|
    100|     const entrypoint = path.join(packageRoot, "openclaw.mjs");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯

[test] failed 1 Vitest shard in 218.72s
```

## GREEN Phase

- **Timestamp:** 2026-08-23T18:07:04.466600+00:00
- **Test command:** `env OPENCLAW_CURRENT_PACKAGE_TGZ=/Users/michal/.openclaw/tmp/opencode/cool-cove-3068/openclaw-current.tgz OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test test/scripts/deliberation-doctor-package.e2e.test.ts -- --reporter=verbose`
- **Exit code:** 0

### Standard Output

```text

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

 ✓ test/scripts/deliberation-doctor-package.e2e.test.ts > OR-22 doctor-package-writeback-built-five-hook-runtime 66382ms

 Test Files  1 passed (1)
      Tests  1 passed (1)
   Start at  20:05:57
   Duration  66.55s (transform 124ms, setup 85ms, import 2ms, tests 66.38s, environment 0ms)

```

### Standard Error

```text
$ node scripts/test-projects.mjs test/scripts/deliberation-doctor-package.e2e.test.ts -- --reporter=verbose
[test] starting test/vitest/vitest.e2e.config.ts
[vitest] still running with no output for 30000ms (test/vitest/vitest.e2e.config.ts).
[vitest] still running with no output for 60000ms (test/vitest/vitest.e2e.config.ts).
[test] passed 1 Vitest shard in 66.78s
```
