# TDD Red-Green Proof: warm-fork-8996

Historical registration provenance: the genuine parent cycle is retained at
`plans/checkpoints/cool-vale-5964.red-green-proof.md`. Extracted task evidence
records its helper RED as `[test] failed 1 Vitest shard in 3.32s` and GREEN as
`[test] passed 1 Vitest shard in 3.75s`; unavailable parent log detail is not
reconstructed here.

<!-- proof-capture-metadata: {"version":1,"task_id":"warm-fork-8996","command":["node","scripts/run-vitest.mjs","extensions/deliberation/src/km-client.test.ts","--reporter=verbose"],"command_sha256":"38e615f0986a13babd78a3630834f66251c820a75842d28bf71efdb08cedc78a"} -->

## RED Phase

- **Timestamp:** 2026-07-28T01:58:37.543754+00:00
- **Test command:** `node scripts/run-vitest.mjs extensions/deliberation/src/km-client.test.ts --reporter=verbose`
- **Exit code:** 1

### Standard Output

```text

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

 × |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects control responses outside the accepted closed schema 60ms
   → promise resolved "{ intakeEnabled: true, …(2) }" instead of rejecting

 Test Files  1 failed (1)
      Tests  1 failed (1)
   Start at  03:58:36
   Duration  763ms (transform 597ms, setup 193ms, import 426ms, tests 61ms, environment 0ms)

```

### Standard Error

```text
[test] queued behind the local heavy-check lock held by test, pid 85131, cwd /Users/michal/Projects/openclaw-fork...
[test] still waiting 15s for the local heavy-check lock held by test, pid 85131, cwd /Users/michal/Projects/openclaw-fork...
[test] still waiting 30s for the local heavy-check lock held by test, pid 85131, cwd /Users/michal/Projects/openclaw-fork...
[test] starting test/vitest/vitest.extensions.config.ts

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects control responses outside the accepted closed schema
AssertionError: promise resolved "{ intakeEnabled: true, …(2) }" instead of rejecting

- Expected
+ Received

- Error {
-   "message": "rejected promise",
+ {
+   "intakeEnabled": true,
+   "safeSilence": false,
+   "senderEnabled": true,
  }

 ❯ extensions/deliberation/src/km-client.test.ts:39:35
     37|     });
     38|
     39|     await expect(client.controls()).rejects.toThrow("invalid control r…
       |                                   ^
     40|   });
     41| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯

[test] failed 1 Vitest shard in 42.51s
```

## GREEN Phase

- **Timestamp:** 2026-07-28T01:59:20.626833+00:00
- **Test command:** `node scripts/run-vitest.mjs extensions/deliberation/src/km-client.test.ts --reporter=verbose`
- **Exit code:** 0

### Standard Output

```text

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects control responses outside the accepted closed schema 33ms

 Test Files  1 passed (1)
      Tests  1 passed (1)
   Start at  03:59:20
   Duration  423ms (transform 195ms, setup 86ms, import 233ms, tests 35ms, environment 0ms)

```

### Standard Error

```text
[test] starting test/vitest/vitest.extensions.config.ts
[test] passed 1 Vitest shard in 3.42s
```

## GREEN Phase (Final Verification)

- **Command:** `node scripts/run-vitest.mjs extensions/deliberation/src --reporter=verbose`
- **Result:** 8 test files passed, 30 tests passed.
- **Additional focused proof:** loader and SecretRef docs/config tests passed (2 Vitest shards, 5 tests); hook regressions passed (5 files, 37 tests); outbound regressions passed (3 files, 121 tests).
- **Static proof:** `pnpm tsgo:extensions`, `pnpm tsgo:extensions:test`, `pnpm plugins:inventory:check`, scoped `oxfmt --check`, `git diff --check`, and `pnpm build` passed.
- **Review:** final `.agents/skills/autoreview/scripts/autoreview --mode local ...` exited clean with no accepted/actionable findings.
- **Blocked broad gates:** `pnpm check:changed` could not start delegated Testbox because the `blacksmith` executable is unavailable. Broad `pnpm lint:extensions` is blocked by the unrelated pre-existing missing `primeChannelOutboundSendMock` export used by `extensions/slack/src/outbound-payload.test-harness.ts`.
- **External acceptance blocker:** `extensions/deliberation/contracts/provenance.json` remains self-accepted. An authoritative KM-owner-approved wire/control bundle was not supplied, so no replacement provenance or interoperability claim is fabricated.
