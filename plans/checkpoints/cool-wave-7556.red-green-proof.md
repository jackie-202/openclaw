# TDD Red-Green Proof: cool-wave-7556

## RED Phase

- **Provenance:** Genuine historical RED from parent task `cool-vale-4616`, referenced by the supplied implementation plan and preserved at `plans/checkpoints/cool-vale-4616.red-green-proof.md`.
- **Historical focused command:** `OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test extensions/deliberation/src/km-client.test.ts -t 'OR-19|OR-20' -- --reporter=verbose`
- **Historical result:** Exit 1. Three focused assertions resolved instead of rejecting: legacy NOT_SENT/DELIVERY_UNKNOWN histories and immutable historical evidence drift were not rejected.
- **Follow-up rule:** The implementation already exists, so this task links the genuine parent RED instead of manufacturing a new failure. Fresh GREEN from the identical command will be appended after the preserved implementation is audited.

## GREEN Phase

- **Command:** `OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test extensions/deliberation/src/km-client.test.ts -t 'OR-19|OR-20' -- --reporter=verbose`
- **Result:** Exit 0. One test file passed; 3 focused tests passed and 70 non-matching tests were skipped.
- **Passing tests:**
  - `OR-19 legacy-not-sent-unknown-never-authorize-retry: NOT_SENT`
  - `OR-19 legacy-not-sent-unknown-never-authorize-retry: DELIVERY_UNKNOWN`
  - `OR-20 historical-attempt-drift-and-tamper-fail-closed`

### Test Output

```text
Test Files  1 passed (1)
Tests       3 passed | 70 skipped (73)
Duration    446ms
[test] passed 1 Vitest shard in 3.49s
```
