# TDD Red-Green Proof: calm-vale-3982

<!-- proof-capture-metadata: {"version":1,"task_id":"calm-vale-3982","command":["env","OPENCLAW_VITEST_FS_MODULE_CACHE_PATH=/Users/michal/.openclaw/tmp/opencode/calm-vale-3982-vitest-cache","OPENCLAW_VITEST_MAX_WORKERS=1","pnpm","test","extensions/deliberation/src/contract.test.ts","--","--reporter=verbose"],"command_sha256":"ca17fc24decbdaed50e7e888a9ba5c7b16961ed82b3960a67719453d1da232d4"} -->

## RED Phase

- **Timestamp:** 2026-08-21T13:03:43.449588+00:00
- **Test command:** `env OPENCLAW_VITEST_FS_MODULE_CACHE_PATH=/Users/michal/.openclaw/tmp/opencode/calm-vale-3982-vitest-cache OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test extensions/deliberation/src/contract.test.ts -- --reporter=verbose`
- **Exit code:** 1

### Standard Output

```text

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

 × |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > requires the KM owner to adopt immutable pipeline and target evidence 54ms
   → expected [ 'provider', 'providerEventId', …(6) ] to deeply equal ArrayContaining{…}
 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > matches the accepted provenance hashes 2ms
 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > mirrors the exact canonical header, endpoints, and controls 1ms
 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > mirrors the current KM endpoint and health contract 0ms
 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > accepts the current closed projection fields 1ms
 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > defines required source threads and generic structured targets across the lifecycle 1ms
 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > keeps provider-specific destination evidence in the OpenClaw overlay 0ms
 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > pins account-scoped Discord root, Slack root, and Slack reply intake vectors 1ms
 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > pins the accepted KM owner revision and owner files 0ms

 Test Files  1 failed (1)
      Tests  1 failed | 8 passed (9)
   Start at  15:03:43
   Duration  357ms (transform 301ms, setup 205ms, import 6ms, tests 62ms, environment 0ms)

[ELIFECYCLE] Test failed. See above for more details.
```

### Standard Error

```text
$ node scripts/test-projects.mjs extensions/deliberation/src/contract.test.ts -- --reporter=verbose
[test] queued behind the local heavy-check lock held by test, pid 16626, cwd /Users/michal/Projects/openclaw-fork...
[test] still waiting 15s for the local heavy-check lock held by test, pid 16626, cwd /Users/michal/Projects/openclaw-fork...
[test] still waiting 30s for the local heavy-check lock held by test, pid 16626, cwd /Users/michal/Projects/openclaw-fork...
[test] still waiting 46s for the local heavy-check lock held by test, pid 16626, cwd /Users/michal/Projects/openclaw-fork...
[test] starting test/vitest/vitest.extensions.config.ts

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > requires the KM owner to adopt immutable pipeline and target evidence
AssertionError: expected [ 'provider', 'providerEventId', …(6) ] to deeply equal ArrayContaining{…}

- Expected
+ Received

- ArrayContaining [
-   "pipelineId",
-   "deliveryTarget",
+ [
+   "provider",
+   "providerEventId",
+   "sourceTarget",
+   "sourceThreadId",
+   "senderId",
+   "occurredAt",
+   "receivedAt",
+   "content",
  ]

 ❯ extensions/deliberation/src/contract.test.ts:22:50
     20|     };
     21|
     22|     expect(contract.schemas.intakeBody.required).toEqual(
       |                                                  ^
     23|       expect.arrayContaining(["pipelineId", "deliveryTarget"]),
     24|     );

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯

[test] failed 1 Vitest shard in 59.93s
```
