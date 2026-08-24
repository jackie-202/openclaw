# TDD Red-Green Proof: calm-reef-2510

## RED Phase

- **Provenance:** Historical genuine RED captured by parent task `calm-vale-3982` before production implementation.
- **Source proof:** `plans/checkpoints/calm-vale-3982.red-green-proof.md`
- **Timestamp:** 2026-08-21T13:03:43.449588+00:00
- **Test command:** `env OPENCLAW_VITEST_FS_MODULE_CACHE_PATH=/Users/michal/.openclaw/tmp/opencode/calm-vale-3982-vitest-cache OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test extensions/deliberation/src/contract.test.ts -- --reporter=verbose`
- **Result:** 1 failed, 8 passed
- **Failing test:** `accepted Deliberation contracts > requires the KM owner to adopt immutable pipeline and target evidence`
- **Expected failure:** The owner mirror intake contract omitted required `pipelineId` and `deliveryTarget` fields, so immutable pipeline/target lifecycle implementation could not proceed.

### Test Output

```text
FAIL extensions/deliberation/src/contract.test.ts
AssertionError: expected required intake fields to include "pipelineId" and "deliveryTarget"
Test Files  1 failed (1)
Tests       1 failed | 8 passed (9)
```

The complete unabridged runner output remains in the source proof linked above. This follow-up does not fabricate or rerun RED after the partial implementation; it preserves the caller-declared historical provenance and will append fresh GREEN evidence.

## GREEN Phase

- **Timestamp:** 2026-08-21T15:35:02+02:00
- **Implementation files:** `extensions/deliberation/src/{delivery-target,route-match,km-client,final-adapter}.ts`, `extensions/deliberation/index.ts`, `extensions/discord/src/outbound-adapter.ts`, `src/plugins/hook-types.ts`, `src/auto-reply/reply/dispatch-from-config.ts`, and synchronized contracts/tests/docs.
- **Test command:** `env OPENCLAW_VITEST_FS_MODULE_CACHE_PATH=/Users/michal/.openclaw/tmp/opencode/calm-reef-2510-green-cache OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test extensions/deliberation/src/plugin.test.ts -- --reporter=verbose`
- **Result:** 0 failed, 15 passed

### Test Output

```text
RUN v4.1.7 /Users/michal/Projects/openclaw-fork

PASS deliberation plugin boundary > registers fail-closed hooks, read-only KM health, and one final sender
PASS deliberation plugin boundary > does not register final delivery while Deliberation is disabled
PASS deliberation plugin boundary > delivers one ready item through the exact Discord account and stops its timer
PASS deliberation plugin boundary > delivers one Slack-origin item through the exact Slack account and thread
PASS deliberation plugin boundary > delivers one Discord-origin item through the exact Slack account and thread
PASS deliberation plugin boundary > delivers an explicit Slack root without manufacturing a thread
PASS deliberation plugin boundary > delivers a Discord source anchor through the channel-owned anchor operation
PASS deliberation plugin boundary > fails an oversized result without sending multiple Discord messages
PASS deliberation plugin boundary > fails a Slack destination whose explicit account is not configured
PASS deliberation plugin boundary > leaves Slack delivery unresolved when the provider returns no platform message id
PASS deliberation plugin boundary > does not call Discord when reservation is disabled
PASS deliberation plugin boundary > does not call Discord when reservation is conflict
PASS deliberation plugin boundary > does not call Discord for an empty queue
PASS deliberation plugin boundary > contains provider failures and records FAILED
PASS deliberation plugin boundary > serializes repeated ticks and waits for the active tick during stop

Test Files  1 passed (1)
Tests       15 passed (15)
Duration    1.54s
[test] passed 1 Vitest shard in 4.19s
```
