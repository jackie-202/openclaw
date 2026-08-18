# TDD Red-Green Proof: calm-vale-6983

## RED Phase

- **Provenance:** Historical genuine RED captured before the preserved implementation in `plans/checkpoints/bold-dune-7459.red-green-proof.md`.
- **Timestamp:** 2026-08-16T22:11:17.862802+00:00
- **Test command:** `pnpm test extensions/deliberation/src/final-adapter.test.ts extensions/deliberation/src/plugin.test.ts extensions/deliberation/src/config.test.ts extensions/deliberation/src/sole-send.test.ts -- --reporter=verbose`
- **Result:** 12 failed, 57 passed; exit code 1.
- **Relevant failures:** Slack destinations were rejected by the strict target parser, Slack outbound was never loaded, Slack-origin and Discord-origin final results made zero Slack calls, and bounded Slack failure evidence was misclassified.

This acceptance-fix task continues from that preserved implementation. A fresh RED would be fabricated because the implementation already exists, so this proof links the original pre-implementation failure evidence as required by the task provenance instructions. Fresh post-repair GREEN output will be appended below.

## GREEN Phase

- **Timestamp:** 2026-08-17T00:48:08Z
- **Implementation files:** `extensions/deliberation/contracts/km-wire-v1.json`, `extensions/deliberation/contracts/cutover-controls-v1.json`, `extensions/deliberation/contracts/provenance.json`, `extensions/deliberation/src/contract.test.ts`, `extensions/deliberation/src/km-client.test.ts`, `docs/plugins/reference/deliberation.md`
- **Test command:** `pnpm test extensions/deliberation/src/contract.test.ts extensions/deliberation/src/final-adapter.test.ts extensions/deliberation/src/plugin.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/config.test.ts extensions/deliberation/src/sole-send.test.ts extensions/slack/src/outbound-adapter.test.ts extensions/slack/src/send.blocks.test.ts -- --reporter=verbose`
- **Result:** 0 failed, 166 passed across 8 files and 2 Vitest shards; exit code 0.

### Test Output

```text
Test Files  2 passed (2)
     Tests  30 passed (30)

Test Files  6 passed (6)
     Tests  136 passed (136)

[test] passed 2 Vitest shards in 7.19s
```

## RED Phase (Cycle 2)

- **Timestamp:** 2026-08-17T00:56:21Z
- **Test command:** `pnpm test extensions/deliberation/src/final-adapter.test.ts extensions/deliberation/src/plugin.test.ts -- --reporter=verbose`
- **Result:** 2 failed, 35 passed; exit code 1.
- **Failing tests:** Invalid provider receipt evidence completed the invoked attempt as `FAILED` instead of leaving it unresolved for KM unknown-outcome recovery; Slack missing platform IDs had the same incorrect completion.

### Test Output

```text
FAIL extensions/deliberation/src/final-adapter.test.ts > leaves an invoked attempt unresolved when provider receipt evidence is invalid
AssertionError: promise resolved "{ state: 'FAILED' }" instead of rejecting

FAIL extensions/deliberation/src/plugin.test.ts > leaves Slack delivery unresolved when the provider returns no platform message id
AssertionError: expected completeDelivery to not be called, but it was called once with outcome: "FAILED"

Test Files  2 failed (2)
     Tests  2 failed | 35 passed (37)
```

## GREEN Phase (Cycle 2)

- **Timestamp:** 2026-08-17T00:57:00Z
- **Implementation files:** `extensions/deliberation/src/final-adapter.ts`, `extensions/deliberation/index.ts`
- **Test command:** `pnpm test extensions/deliberation/src/final-adapter.test.ts extensions/deliberation/src/plugin.test.ts -- --reporter=verbose`
- **Result:** 0 failed, 37 passed; exit code 0.

### Test Output

```text
Test Files  2 passed (2)
     Tests  37 passed (37)

[test] passed 1 Vitest shard in 7.09s
```
