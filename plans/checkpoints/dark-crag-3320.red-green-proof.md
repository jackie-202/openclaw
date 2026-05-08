# TDD Red-Green Proof: dark-crag-3320

## Scope

- Task: WhatsApp login malformed-result regression for Baileys 408/unhandled rejection hardening.
- Test file: `extensions/whatsapp/src/login.malformed-result.test.ts`.
- Implementation file: `extensions/whatsapp/src/login.ts`.
- Acceptance-fix note: the implementation already existed when this proof was requested, so RED was reproduced non-destructively with a temporary Vitest config under `/Users/michal/.openclaw/tmp/opencode/bold-cove-6399/` that transforms only `extensions/whatsapp/src/login.ts` back to the pre-hardening unsafe `result.outcome` branch read. The active workspace source was not reverted.

## RED Phase

- Timestamp: 2026-05-04T22:39:18Z
- Test files written: `extensions/whatsapp/src/login.malformed-result.test.ts`
- Test command: `OPENCLAW_VITEST_FS_MODULE_CACHE_PATH="/Users/michal/.openclaw/tmp/opencode/vitest-cache-bold-cove-6399-red2" node scripts/run-vitest.mjs run --config /Users/michal/.openclaw/tmp/opencode/bold-cove-6399/vitest.whatsapp-login-red.config.ts extensions/whatsapp/src/login.malformed-result.test.ts`
- Result: 1 failed, 3 passed
- Failing test: `loginWeb malformed login results > throws a regular fallback Error when the login result is undefined` failed because the pre-hardening branch threw `TypeError: Cannot read properties of undefined` instead of the fallback `Error`.

### Test Output

```text
 RUN  v4.1.5 /Users/michal/Projects/openclaw-fork

 ❯ |extension-whatsapp| extensions/whatsapp/src/login.malformed-result.test.ts (4 tests | 1 failed) 16ms
     × throws a regular fallback Error when the login result is undefined 13ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  |extension-whatsapp| extensions/whatsapp/src/login.malformed-result.test.ts > loginWeb malformed login results > throws a regular fallback Error when the login result is undefined
AssertionError: expected TypeError: Cannot read properties of unde… to not be an instance of TypeError
 ❯ extensions/whatsapp/src/login.malformed-result.test.ts:82:21
     80|
     81|     expect(err).toBeInstanceOf(Error);
     82|     expect(err).not.toBeInstanceOf(TypeError);
       |                     ^
     83|     expect((err as Error).message).toBe("WhatsApp login failed: unknow…
     84|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 3 passed (4)
   Start at  00:39:10
   Duration  2.46s (transform 1.84s, setup 170ms, import 2.19s, tests 16ms, environment 0ms)
```

## GREEN Phase

- Timestamp: 2026-05-04T22:39:18Z
- Implementation files: `extensions/whatsapp/src/login.ts`
- Test command: `OPENCLAW_VITEST_FS_MODULE_CACHE_PATH="/Users/michal/.openclaw/tmp/opencode/vitest-cache-bold-cove-6399-malformed" node scripts/run-vitest.mjs run --config test/vitest/vitest.extension-whatsapp.config.ts extensions/whatsapp/src/login.malformed-result.test.ts`
- Result: 0 failed, 4 passed

### Test Output

```text
 RUN  v4.1.5 /Users/michal/Projects/openclaw-fork


 Test Files  1 passed (1)
      Tests  4 passed (4)
   Start at  00:38:12
   Duration  2.37s (transform 1.75s, setup 160ms, import 2.12s, tests 11ms, environment 0ms)
```

## Login Regression Coverage

- Timestamp: 2026-05-04T22:39:18Z
- Planned command: `pnpm test extensions/whatsapp/src/login.malformed-result.test.ts extensions/whatsapp/src/login.coverage.test.ts extensions/whatsapp/src/login.test.ts`
- Local blocker for planned `pnpm test` wrapper: another process held the local heavy-check lock (`pid 46108`), so the wrapper did not start the targeted Vitest lane before the 120s command timeout.
- Equivalent isolated repo Vitest wrapper command: `OPENCLAW_VITEST_FS_MODULE_CACHE_PATH="/Users/michal/.openclaw/tmp/opencode/vitest-cache-bold-cove-6399-regression" node scripts/run-vitest.mjs run --config test/vitest/vitest.extension-whatsapp.config.ts extensions/whatsapp/src/login.malformed-result.test.ts extensions/whatsapp/src/login.coverage.test.ts extensions/whatsapp/src/login.test.ts`
- Result: 0 failed, 13 passed

### Planned Wrapper Blocker Output

```text
> openclaw@2026.4.30 test /Users/michal/Projects/openclaw-fork
> node scripts/test-projects.mjs extensions/whatsapp/src/login.malformed-result.test.ts

[test] queued behind the local heavy-check lock held by test, pid 46108, cwd /Users/michal/Projects/openclaw-fork...
[test] still waiting 15s for the local heavy-check lock held by test, pid 46108, cwd /Users/michal/Projects/openclaw-fork...
[test] still waiting 30s for the local heavy-check lock held by test, pid 46108, cwd /Users/michal/Projects/openclaw-fork...
[test] still waiting 46s for the local heavy-check lock held by test, pid 46108, cwd /Users/michal/Projects/openclaw-fork...
[test] still waiting 1m 1s for the local heavy-check lock held by test, pid 46108, cwd /Users/michal/Projects/openclaw-fork...
[test] still waiting 1m 16s for the local heavy-check lock held by test, pid 46108, cwd /Users/michal/Projects/openclaw-fork...
[test] still waiting 1m 31s for the local heavy-check lock held by test, pid 46108, cwd /Users/michal/Projects/openclaw-fork...
[test] still waiting 1m 47s for the local heavy-check lock held by test, pid 46108, cwd /Users/michal/Projects/openclaw-fork...
ELIFECYCLE Test failed. See above for more details.

<bash_metadata>
bash tool terminated command after exceeding timeout 120000 ms. If this command is expected to take longer and is not waiting for interactive input, retry with a larger timeout value in milliseconds.
</bash_metadata>
```

### Isolated Regression Output

```text
 RUN  v4.1.5 /Users/michal/Projects/openclaw-fork


 Test Files  3 passed (3)
      Tests  13 passed (13)
   Start at  00:38:18
   Duration  2.60s (transform 1.81s, setup 205ms, import 2.00s, tests 311ms, environment 0ms)
```

## Formatter And Build Proof

- Timestamp: 2026-05-04T22:39:18Z
- Formatter command: `pnpm exec oxfmt --check --threads=1 extensions/whatsapp/src/login.malformed-result.test.ts plans/checkpoints/dark-crag-3320.red-green-proof.md plans/checkpoints/bold-cove-6399.checkpoint.md`
- Formatter result: passed after formatting the newly created `bold-cove-6399` checkpoint file.
- Lint command: `pnpm exec oxlint extensions/whatsapp/src/login.ts extensions/whatsapp/src/login.malformed-result.test.ts`
- Lint result: 0 warnings, 0 errors.
- Build command: `pnpm build`
- Build result: passed.

### Initial Formatter Output

```text
Checking formatting...

plans/checkpoints/bold-cove-6399.checkpoint.md (80ms)

Format issues found in above 1 files. Run without `--check` to fix.
Finished in 97ms on 3 files using 1 threads.
```

### Formatter Fix Output

```text
Finished in 92ms on 1 files using 1 threads.
```

### Formatter Passing Output

```text
Checking formatting...

All matched files use the correct format.
Finished in 96ms on 3 files using 1 threads.
```

### Lint Output

```text
Found 0 warnings and 0 errors.
Finished in 57ms on 2 files with 184 rules using 28 threads.
```

### Build Output

```text
> openclaw@2026.4.30 build /Users/michal/Projects/openclaw-fork
> node scripts/build-all.mjs

[build-all] canvas:a2ui:bundle

> openclaw@2026.4.30 canvas:a2ui:bundle /Users/michal/Projects/openclaw-fork
> node scripts/bundle-a2ui.mjs

A2UI bundle up to date; skipping.
[build-all] tsdown
[build-all] check-cli-bootstrap-imports
CLI bootstrap import guard passed.
[build-all] runtime-postbuild
runtime-postbuild: plugin SDK root alias completed in 1ms
runtime-postbuild: bundled plugin metadata completed in 120ms
runtime-postbuild: official channel catalog completed in 2ms
runtime-postbuild: bundled plugin runtime deps completed in 14773ms
runtime-postbuild: bundled plugin runtime overlay completed in 404ms
runtime-postbuild: stable root runtime aliases completed in 16ms
runtime-postbuild: legacy CLI exit compat chunks completed in 0ms
runtime-postbuild: static extension assets completed in 13ms
[build-all] build-stamp
[build-all] runtime-postbuild-stamp
[build-all] build:plugin-sdk:dts (cached)
[build-all] write-plugin-sdk-entry-dts
[build-all] check-plugin-sdk-exports
OK: All 4 required plugin-sdk exports verified.
[build-all] canvas-a2ui-copy (cached)
[build-all] copy-hook-metadata
[copy-hook-metadata] Copied 4 hook metadata files.
[build-all] copy-export-html-templates (cached)
[build-all] write-build-info
[build-all] write-cli-startup-metadata
[build-all] write-cli-compat
```

## Suite-Wide Cleanup Note

- Broad output from `src/cli/update-cli.test.ts` is unrelated to WhatsApp login acceptance and is not used as evidence for this task.
