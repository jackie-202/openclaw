# RED/GREEN Proof: swift-vale-0374

## RED Phase

This acceptance fix does not fabricate a new RED after the parent implementation already exists. It reuses the genuine historical RED attributed by the task manifest to `plans/checkpoints/cool-vale-4616.red-green-proof.md` and the earlier `wild-crag-3236` run:

- Historical focused OR-19/OR-20 command: `OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test extensions/deliberation/src/km-client.test.ts -t "OR-19|OR-20" -- --reporter=verbose`
- Historical result: exit code 1 before the parent implementation; the legacy invoked-unknown history and historical-attempt tamper cases were accepted instead of failing closed.
- Historical owner-composed result: `3 failed, 38 passed` before convergence.
- Provenance limitation: the earlier composed command output was truncated and is not reconstructed or presented as exact output here.

Fresh post-parent verification will be captured under `## GREEN Phase` after auditing the preserved implementation and running the required commands.

## RED Phase (Cycle 2)

- **Test file written:** `extensions/deliberation/src/contract.test.ts`
- **Command:** `OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test extensions/deliberation/src/contract.test.ts -t "pins the accepted KM owner revision and owner files" -- --reporter=verbose`
- **Result:** exit code 1; 1 failed, 9 skipped.
- **Expected failure:** `configuredKmCheckoutEvidence` omitted `wireSha256` and `spoolContractsSha256`, so it did not preserve all four authoritative artifact hashes.

```text
FAIL  |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > pins the accepted KM owner revision and owner files
-     "spoolContractsSha256": "47587e405d3e6b7f433eb7d450bd02969546860ff0d6822ad7bea9ff2478a0ca",
-     "wireSha256": "a0e42e4fe54eedab6f9955e77f439a4e69c9614a60560ca46532ce0de9dbb528",
Test Files  1 failed (1)
Tests  1 failed | 9 skipped (10)
[test] failed 1 Vitest shard in 4.02s
```

## GREEN Phase

### OR-19/OR-20 Parent Regression

- **Command:** `OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test extensions/deliberation/src/km-client.test.ts -t "OR-19|OR-20" -- --reporter=verbose`
- **Result:** exit code 0; 3 passed, 70 skipped.

```text
✓ OR-19 legacy-not-sent-unknown-never-authorize-retry: NOT_SENT
✓ OR-19 legacy-not-sent-unknown-never-authorize-retry: DELIVERY_UNKNOWN
✓ OR-20 historical-attempt-drift-and-tamper-fail-closed
Test Files  1 passed (1)
Tests  3 passed | 70 skipped (73)
[test] passed 1 Vitest shard in 3.41s
```

### Provenance Completion Cycle

- **Implementation file:** `extensions/deliberation/contracts/provenance.json`
- **Test file:** `extensions/deliberation/src/contract.test.ts`
- **Command:** `OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test extensions/deliberation/src/contract.test.ts -t "pins the accepted KM owner revision and owner files" -- --reporter=verbose`
- **Result:** exit code 0; 1 passed, 9 skipped.

```text
✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > pins the accepted KM owner revision and owner files
Test Files  1 passed (1)
Tests  1 passed | 9 skipped (10)
[test] passed 1 Vitest shard in 4.81s
```
