# TDD Red-Green Proof: calm-crag-0993

## RED Phase

- **Provenance:** Genuine historical RED reused from the original implementation task.
- **Source:** `plans/checkpoints/bold-brook-4380.red-green-proof.md:5-573`
- **Timestamp:** 2026-08-22T12:17:33.023936+00:00
- **Test command:** `pnpm test extensions/deliberation/src/final-adapter.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/plugin.test.ts extensions/deliberation/src/delivery-composition.test.ts -- --reporter=verbose`
- **Exit code:** 1
- **Result:** 7 failed, 110 passed
- **Expected failures:** post-invocation transport outcomes completed instead of rejecting as unknown; duplicate attempt and provider-attempt identities were accepted; completion `CAS_CONFLICT` lost HTTP error semantics; maximal schema-permitted projections were rejected; thrown provider outcomes were completed as `FAILED`.

### Test Output

```text
Test Files  3 failed | 1 passed (4)
Tests       7 failed | 110 passed (117)

FAIL final-adapter.test.ts > leaves a post-invocation transport outcome unresolved
AssertionError: promise resolved "undefined" instead of rejecting

FAIL km-client.test.ts > rejects duplicate 'attempt ID' completion evidence
AssertionError: promise resolved instead of rejecting

FAIL km-client.test.ts > rejects duplicate 'provider-attempt ID' completion evidence
AssertionError: promise resolved instead of rejecting

FAIL km-client.test.ts > preserves a completion CAS conflict as an HTTP error
Expected stage=http, status=409, code=CAS_CONFLICT; received stage=response-schema

FAIL km-client.test.ts > accepts all schema-permitted record projection fields
KmRequestError: KM returned an invalid record response

FAIL plugin.test.ts > leaves a thrown provider outcome unresolved
Expected completeDelivery not to be called; received FAILED completion
```

The complete unabridged output remains in the cited parent proof. This follow-up does not fabricate a new RED after implementation already exists; it captures fresh GREEN verification below.

## GREEN Phase

- **Timestamp:** 2026-08-22T12:45:52Z
- **Implementation files verified:** `extensions/deliberation/src/final-adapter.ts`, `extensions/deliberation/index.ts`, `extensions/deliberation/src/km-client.ts`
- **Focused test files:** `extensions/deliberation/src/final-adapter.test.ts`, `extensions/deliberation/src/km-client.test.ts`, `extensions/deliberation/src/plugin.test.ts`, `extensions/deliberation/src/delivery-composition.test.ts`
- **Test command:** `pnpm test extensions/deliberation/src/final-adapter.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/plugin.test.ts extensions/deliberation/src/delivery-composition.test.ts -- --reporter=verbose`
- **Exit code:** 0
- **Result:** 0 failed, 118 passed

### Test Output

```text
RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

PASS final-adapter.test.ts
  leaves both post-invocation transport outcomes unresolved
  terminalizes only a definitive adapter rejection
  leaves invalid receipt evidence unresolved

PASS km-client.test.ts
  accepts an exact completion replay
  rejects duplicate attempt ID completion evidence
  rejects duplicate provider-attempt ID completion evidence
  preserves a completion CAS conflict as an HTTP error
  rejects receipt evidence that differs from the submitted message pair
  accepts all schema-permitted record projection fields

PASS plugin.test.ts
  leaves thrown provider outcomes unresolved
  leaves unknown, padded, missing, mismatched, and multipart receipt evidence unresolved

PASS delivery-composition.test.ts
  performs one native attempt for ambiguous provider outcomes
  leaves malformed Discord native success evidence unresolved
  does not retry an accepted-then-error Slack native request

Test Files  4 passed (4)
Tests       118 passed (118)
Duration    3.49s
[test] passed 1 Vitest shard in 78.75s
```

## RED Phase (Cycle 2)

- **Reason:** Accepted autoreview finding for omitted reservation ordinal/version binding.
- **Test command:** `pnpm test extensions/deliberation/src/km-client.test.ts -- --reporter=verbose`
- **Exit code:** 1
- **Result:** 2 failed, 68 passed

### Test Output

```text
FAIL km-client.test.ts > rejects completion evidence with another 'ordinal'
AssertionError: promise resolved instead of rejecting

FAIL km-client.test.ts > rejects completion evidence with another 'reservedRecordVersion'
AssertionError: promise resolved instead of rejecting

Test Files  1 failed (1)
Tests       2 failed | 68 passed (70)
[test] failed 1 Vitest shard in 3.19s
```

## GREEN Phase (Cycle 2)

- **Implementation:** Completion evidence now binds `ordinal` to `reservation.ordinal` and `reservedRecordVersion` to the pre-CAS version (`reservation.version - 1`).
- **Test command:** `pnpm test extensions/deliberation/src/km-client.test.ts -- --reporter=verbose`
- **Exit code:** 0
- **Result:** 0 failed, 70 passed

### Test Output

```text
PASS km-client.test.ts > rejects completion evidence with another 'ordinal'
PASS km-client.test.ts > rejects completion evidence with another 'reservedRecordVersion'
PASS km-client.test.ts > accepts an exact completion replay

Test Files  1 passed (1)
Tests       70 passed (70)
[test] passed 1 Vitest shard in 3.71s
```

## RED Phase (Cycle 3)

- **Reason:** Accepted autoreview finding for contradictory `FAILED` receipt evidence.
- **Test command:** `pnpm test extensions/deliberation/src/km-client.test.ts -- --reporter=verbose`
- **Exit code:** 1
- **Result:** 2 failed, 70 passed

### Test Output

```text
FAIL km-client.test.ts > rejects FAILED completion carrying a non-null providerReceiptId
AssertionError: promise resolved instead of rejecting

FAIL km-client.test.ts > rejects FAILED completion carrying a non-null providerMessageId
AssertionError: promise resolved instead of rejecting

Test Files  1 failed (1)
Tests       2 failed | 70 passed (72)
[test] failed 1 Vitest shard in 3.74s
```

## GREEN Phase (Cycle 3)

- **Implementation:** `FAILED` completion evidence now requires both platform receipt/message IDs to remain null.
- **Test command:** `pnpm test extensions/deliberation/src/km-client.test.ts -- --reporter=verbose`
- **Exit code:** 0
- **Result:** 0 failed, 72 passed

### Test Output

```text
PASS km-client.test.ts > rejects FAILED completion carrying a non-null providerReceiptId
PASS km-client.test.ts > rejects FAILED completion carrying a non-null providerMessageId

Test Files  1 passed (1)
Tests       72 passed (72)
[test] passed 1 Vitest shard in 3.85s
```
