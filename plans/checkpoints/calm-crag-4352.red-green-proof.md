# TDD Red-Green Proof: calm-crag-4352

## RED Phase

- **Provenance:** Historical genuine RED captured by parent task `calm-vale-3982` before production implementation.
- **Source proof:** `plans/checkpoints/calm-vale-3982.red-green-proof.md`
- **Parent implementation proof:** `plans/checkpoints/calm-reef-2510.red-green-proof.md`
- **Timestamp:** 2026-08-21T13:03:43.449588+00:00
- **Test command:** `env OPENCLAW_VITEST_FS_MODULE_CACHE_PATH=/Users/michal/.openclaw/tmp/opencode/calm-vale-3982-vitest-cache OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test extensions/deliberation/src/contract.test.ts -- --reporter=verbose`
- **Exit code:** 1
- **Result:** 1 failed, 8 passed
- **Failing test:** `accepted Deliberation contracts > requires the KM owner to adopt immutable pipeline and target evidence`
- **Expected failure:** The owner mirror intake contract omitted required `pipelineId` and `deliveryTarget` fields.

### Historical Test Output

```text
FAIL extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > requires the KM owner to adopt immutable pipeline and target evidence
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

Test Files  1 failed (1)
Tests       1 failed | 8 passed (9)
```

The complete original output is preserved in the source proof. This acceptance follow-up does not fabricate a new RED after implementation; it links the genuine pre-implementation failure and will capture fresh GREEN from the identical command.

## GREEN Phase

- **Timestamp:** 2026-08-21T16:04:35+02:00
- **Implementation:** The parent implementation was preserved unchanged; this evidence-only follow-up found no production defect.
- **Test command:** `env OPENCLAW_VITEST_FS_MODULE_CACHE_PATH=/Users/michal/.openclaw/tmp/opencode/calm-vale-3982-vitest-cache OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test extensions/deliberation/src/contract.test.ts -- --reporter=verbose`
- **Exit code:** 0
- **Result:** 0 failed, 9 passed

### Fresh Test Output

```text
$ node scripts/test-projects.mjs extensions/deliberation/src/contract.test.ts -- --reporter=verbose
[test] queued behind the local heavy-check lock held by test, pid 46056, cwd /Users/michal/Projects/openclaw-fork...
[test] still waiting 15s for the local heavy-check lock held by test, pid 46056, cwd /Users/michal/Projects/openclaw-fork...
[test] still waiting 30s for the local heavy-check lock held by test, pid 46056, cwd /Users/michal/Projects/openclaw-fork...
[test] still waiting 46s for the local heavy-check lock held by test, pid 46056, cwd /Users/michal/Projects/openclaw-fork...
[test] starting test/vitest/vitest.extensions.config.ts

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > requires the KM owner to adopt immutable pipeline and target evidence 35ms
 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > matches the accepted provenance hashes 3ms
 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > mirrors the exact canonical header, endpoints, and controls 1ms
 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > mirrors the current KM endpoint and health contract 1ms
 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > accepts the current closed projection fields 1ms
 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > defines required source threads and generic structured targets across the lifecycle 1ms
 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > keeps provider-specific destination evidence in the OpenClaw overlay 1ms
 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > pins account-scoped Discord root, Slack root, and Slack reply intake vectors 1ms
 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > pins the accepted KM owner revision and owner files 1ms

 Test Files  1 passed (1)
      Tests  9 passed (9)
   Start at  16:03:32
   Duration  305ms (transform 161ms, setup 139ms, import 28ms, tests 46ms, environment 0ms)

[test] passed 1 Vitest shard in 63.03s
```

This is the identical owner contract-gate command specified in the original plan and recorded in the historical RED proof.
