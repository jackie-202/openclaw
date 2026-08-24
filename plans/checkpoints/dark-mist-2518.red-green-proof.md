# TDD Red-Green Proof: dark-mist-2518

## RED Phase

- **Provenance:** Genuine historical RED is preserved in `plans/checkpoints/cool-cove-3068.red-green-proof.md`, section `## RED Phase`.
- **Historical command:** `env OPENCLAW_CURRENT_PACKAGE_TGZ=/Users/michal/.openclaw/tmp/opencode/cool-cove-3068/openclaw-current.tgz OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test test/scripts/deliberation-doctor-package.e2e.test.ts -- --reporter=verbose`
- **Historical result:** Exit code 1; the named `OR-22 doctor-package-writeback-built-five-hook-runtime` leaf failed because the installed package omitted `dist/extensions/deliberation/doctor-contract-api.js`.
- **Follow-up gap:** The repaired package leaf passed without inspecting its installed runtime's hook and service registration, so it did not itself prove the acceptance behavior named by OR-22.
- **Why no synthetic RED was run:** The package implementation and independent five-hook singleton smoke already exist. This acceptance fix adds missing assertions to the named leaf; fabricating a new failing production state after implementation would not be genuine TDD evidence.

The fresh post-fix package run will be recorded under `## GREEN Phase` after the OR-22 assertions are implemented.

## GREEN Phase

- **Timestamp:** 2026-08-23T18:37:52Z
- **Implementation file:** `test/scripts/deliberation-doctor-package.e2e.test.ts`
- **Test command:** `OPENCLAW_CURRENT_PACKAGE_TGZ="/Users/michal/.openclaw/tmp/opencode/dark-mist-2518/openclaw-current.tgz" OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test test/scripts/deliberation-doctor-package.e2e.test.ts -- --reporter=verbose`
- **Result:** Exit code 0; 1 test file passed, 1 named test passed.

### Test Output

```text
$ node scripts/test-projects.mjs test/scripts/deliberation-doctor-package.e2e.test.ts -- --reporter=verbose
[test] starting test/vitest/vitest.e2e.config.ts

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

[vitest] still running with no output for 30000ms (test/vitest/vitest.e2e.config.ts).
 ✓ test/scripts/deliberation-doctor-package.e2e.test.ts > OR-22 doctor-package-writeback-built-five-hook-runtime 56942ms

 Test Files  1 passed (1)
      Tests  1 passed (1)
   Start at  20:36:47
   Duration  57.10s (transform 114ms, setup 75ms, import 16ms, tests 56.94s, environment 0ms)

[test] passed 1 Vitest shard in 57.36s
```
