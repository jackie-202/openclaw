# TDD Red-Green Proof: cool-dune-2402

## RED Phase

- **Provenance:** The genuine historical RED is preserved in `plans/checkpoints/cool-cove-3068.red-green-proof.md`, section `## RED Phase`; the first acceptance repair documented the missing named-leaf coverage in `plans/checkpoints/dark-mist-2518.red-green-proof.md`.
- **Historical command:** `env OPENCLAW_CURRENT_PACKAGE_TGZ=/Users/michal/.openclaw/tmp/opencode/cool-cove-3068/openclaw-current.tgz OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test test/scripts/deliberation-doctor-package.e2e.test.ts -- --reporter=verbose`
- **Historical result:** Exit code 1; `OR-22 doctor-package-writeback-built-five-hook-runtime` failed against the installed package because `dist/extensions/deliberation/doctor-contract-api.js` was absent.
- **Acceptance gap:** The later package leaf passed without inspecting installed runtime registration, so its implementation did not substantiate the five-hook singleton behavior named by OR-22 in the caller-supplied task material.
- **Why no synthetic RED was run:** The package implementation and required OR-22 assertions were preserved from the previous task. Reverting them to manufacture a new failure would falsify chronology. This follow-up reuses the authentic RED as explicitly required and will capture fresh GREEN from the installed package.

Fresh post-repair output will be appended under `## GREEN Phase` after package verification.

## GREEN Phase

- **Timestamp:** 2026-08-23T18:57:09Z
- **Implementation file:** `test/scripts/deliberation-doctor-package.e2e.test.ts`
- **Installed package:** `/Users/michal/.openclaw/tmp/opencode/dark-mist-2518/cool-dune-2402-openclaw-current.tgz`
- **Test command:** `OPENCLAW_CURRENT_PACKAGE_TGZ="/Users/michal/.openclaw/tmp/opencode/dark-mist-2518/cool-dune-2402-openclaw-current.tgz" OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test test/scripts/deliberation-doctor-package.e2e.test.ts -- --reporter=verbose`
- **Result:** Exit code 0; 1 test file passed, 1 named test passed.

### Test Output

```text
$ node scripts/test-projects.mjs test/scripts/deliberation-doctor-package.e2e.test.ts -- --reporter=verbose
[test] queued behind the local heavy-check lock held by test, pid 6300, cwd /Users/michal/Projects/openclaw-fork...
[test] starting test/vitest/vitest.e2e.config.ts

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

[vitest] still running with no output for 30000ms (test/vitest/vitest.e2e.config.ts).
[vitest] still running with no output for 60000ms (test/vitest/vitest.e2e.config.ts).
 ✓ test/scripts/deliberation-doctor-package.e2e.test.ts > OR-22 doctor-package-writeback-built-five-hook-runtime 59850ms

 Test Files  1 passed (1)
      Tests  1 passed (1)
   Start at  20:56:05
   Duration  60.02s (transform 102ms, setup 89ms, import 2ms, tests 59.85s, environment 0ms)

[test] passed 1 Vitest shard in 153.11s
```
