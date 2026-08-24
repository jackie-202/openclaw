# TDD Red-Green Proof: cool-reef-8673

<!-- proof-capture-metadata: {"version":1,"task_id":"cool-reef-8673","command":["pnpm","test","test/scripts/deliberation-doctor-package.e2e.test.ts","--","--reporter=verbose"],"command_sha256":"3dc84437f35aac1dacb4664ef0aa4785159e017d60d071b8b7bf2a7babfe2a63"} -->

## RED Phase

- **Timestamp:** 2026-08-23T00:13:55.282586+00:00
- **Test command:** `pnpm test test/scripts/deliberation-doctor-package.e2e.test.ts -- --reporter=verbose`
- **Exit code:** 1

### Standard Output

```text

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

 × test/scripts/deliberation-doctor-package.e2e.test.ts > migrates and validates Deliberation config through the packaged CLI 19837ms
   → missing packaged doctor contract: /Users/michal/.openclaw/tmp/openclaw-deliberation-doctor-L4YRYs/prefix/node_modules/openclaw/dist/extensions/deliberation/doctor-contract-api.js: expected false to be true // Object.is equality

 Test Files  1 failed (1)
      Tests  1 failed (1)
   Start at  02:13:35
   Duration  20.10s (transform 324ms, setup 174ms, import 4ms, tests 19.84s, environment 0ms)

[ELIFECYCLE] Test failed. See above for more details.
```

### Standard Error

```text
$ node scripts/test-projects.mjs test/scripts/deliberation-doctor-package.e2e.test.ts -- --reporter=verbose
[test] starting test/vitest/vitest.e2e.config.ts

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  test/scripts/deliberation-doctor-package.e2e.test.ts > migrates and validates Deliberation config through the packaged CLI
AssertionError: missing packaged doctor contract: /Users/michal/.openclaw/tmp/openclaw-deliberation-doctor-L4YRYs/prefix/node_modules/openclaw/dist/extensions/deliberation/doctor-contract-api.js: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ test/scripts/deliberation-doctor-package.e2e.test.ts:102:88
    100|         "doctor-contract-api.js",
    101|       );
    102|       expect(fs.existsSync(contract), `missing packaged doctor contrac…
       |                                                                                        ^
    103|
    104|       const entrypoint = path.join(packageRoot, "openclaw.mjs");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯

[test] failed 1 Vitest shard in 20.35s
```

## GREEN Phase

- **Timestamp:** 2026-08-23T00:20:27.509264+00:00
- **Test command:** `pnpm test test/scripts/deliberation-doctor-package.e2e.test.ts -- --reporter=verbose`
- **Exit code:** 0

### Standard Output

```text

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

 ✓ test/scripts/deliberation-doctor-package.e2e.test.ts > migrates and validates Deliberation config through the packaged CLI 56062ms

 Test Files  1 passed (1)
      Tests  1 passed (1)
   Start at  02:19:31
   Duration  56.24s (transform 101ms, setup 82ms, import 16ms, tests 56.06s, environment 0ms)

```

### Standard Error

```text
$ node scripts/test-projects.mjs test/scripts/deliberation-doctor-package.e2e.test.ts -- --reporter=verbose
[test] starting test/vitest/vitest.e2e.config.ts
[vitest] still running with no output for 30000ms (test/vitest/vitest.e2e.config.ts).
[test] passed 1 Vitest shard in 56.51s
```

## Verification

- `OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test extensions/deliberation/src/config.test.ts extensions/deliberation/src/config-compat.test.ts src/plugins/doctor-contract-registry.test.ts src/plugins/doctor-contract-registry.load-paths.test.ts src/commands/doctor/shared/channel-legacy-config-migrate.test.ts -- --reporter=verbose`: passed, 58 tests across 5 files.
- Post-format packaged CLI rerun: passed, 1 test in 82.61s.
- `pnpm build`: passed; bundled build includes `dist/extensions/deliberation/doctor-contract-api.js`.
- `node scripts/check-openclaw-package-tarball.mjs /Users/michal/.openclaw/tmp/opencode/cool-reef-8673-green/openclaw-current.tgz`: passed.
- Targeted `oxlint`: passed after `pnpm install` restored the existing `kysely` resolution needed by extension-boundary preparation.
- Targeted `pnpm format:check`: passed.
- `git diff --check --cached` for the four task-owned code/test files: passed.
- Fresh bounded autoreview commit `97e3f8c235dbdb5b616cf4e942f7d6bd6b7024b0`: clean, no accepted/actionable findings.
- Canonical `npm test`: infrastructure-blocked before execution. Crabbox default Azure lacked Azure CLI/subscription; explicit brokered AWS lacked broker login; Blacksmith Testbox fallback lacked the `blacksmith` executable. No test failure was observed.
