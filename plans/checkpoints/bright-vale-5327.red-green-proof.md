# TDD Red-Green Proof: bright-vale-5327

## RED Phase

This evidence-only follow-up preserves the genuine pre-implementation RED from the parent task. The implementation already exists, so no new failing test was manufactured.

- **Parent task:** `bold-cove-8557`
- **Immutable source:** `plans/checkpoints/bold-cove-8557.red-green-proof.md:5`
- **Source SHA-256:** `9fbcaa9469cbcf224961299910aeac70d841577bc76c4583b81a7a62432ac778`
- **Timestamp:** `2026-08-04T13:17:24.558830+00:00`
- **Test command:** `pnpm test extensions/deliberation/src/hooks.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/scripts/intake-producer.test.ts -- --reporter=verbose`
- **Exit code:** `1`
- **Result:** 3 test files failed; 7 tests failed and 30 passed.
- **Expected regression failure:** `persists the live Discord event once through the closed KM wire contract` received `{ handled: false }` instead of `{ handled: true }`.
- **Additional expected failures:** bounded diagnostic assertions failed and the producer module was absent.

The task-evidence reconstruction at `plans/checkpoints/bold-cove-8557.evidence.md:16` reports `outcome_unavailable` and `command_lines_truncated`; it is not used as a substitute for the complete parent proof.

## RED Phase (Cycle 2)

Fresh authority-listener verification exposed a remaining raw-wire defect before the corrective production edit.

- **Timestamp:** `2026-08-04T13:57:35Z`
- **Test command:** `pnpm test extensions/deliberation/src/hooks.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/scripts/intake-producer.test.ts -- --reporter=verbose`
- **Exit code:** `1`
- **Result:** 1 test failed and 40 passed across 3 test files.
- **Failing test:** `KM contract parsing > emits only transport metadata accepted by the closed KM contract`
- **Failure:** raw application headers were emitted as `accept`, `authorization`, and `x-deliberation-protocol-version` instead of their contract casing.
- **Real-listener outcome before correction:** both producer calls exited 1 with bounded `401 AUTH_MISSING`; the disposable authority spool contained 0 matching records.

## RED Phase (Cycle 3)

After canonical header casing reached the authority listener, it identified the original live request's fractional timestamp representation as the next rejected field.

- **Timestamp:** `2026-08-04T14:00:02Z`
- **Test command:** `pnpm test extensions/deliberation/src/hooks.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/scripts/intake-producer.test.ts -- --reporter=verbose`
- **Exit code:** `1`
- **Result:** 2 tests failed and 39 passed across 3 test files.
- **Failing tests:** `persists the live Discord event once through the closed KM wire contract` and `sends canonical KM timestamps for a live-shaped non-zero milliseconds event`.
- **Failure:** JavaScript emitted `.483Z`/`.120Z`; the authority requires preserving the same instant with six fractional digits (`.483000Z`/`.120000Z`).
- **Real-listener outcome before correction:** both calls exited 1 with bounded `400 SCHEMA_INVALID`; the disposable authority spool contained 0 matching records.

## RED Phase (Cycle 4)

The authority accepted the first canonical request but rejected a non-identical replay because request-time `receivedAt` changed for the same inbound ID.

- **Timestamp:** `2026-08-04T14:01:33Z`
- **Test command:** `pnpm test extensions/deliberation/src/hooks.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/scripts/intake-producer.test.ts -- --reporter=verbose`
- **Exit code:** `1`
- **Result:** 1 test failed and 40 passed across 3 test files.
- **Exploratory failing test:** `persists the live Discord event once through the closed KM wire contract` failed on a second invocation after deliberately advancing time.
- **Finding:** KM duplicate acceptance requires exact request replay; changing runtime `receivedAt` to event time would violate its audit meaning and was rejected by autoreview.
- **Resolution:** retain real runtime receipt time and run authority duplicate proof under a fixed evidence clock so both producer requests are byte-equivalent.

## GREEN Phase

- **Timestamp:** `2026-08-04T14:02:20Z`
- **Test command:** `pnpm test extensions/deliberation/src/hooks.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/scripts/intake-producer.test.ts -- --reporter=verbose`
- **Exit code:** `0`
- **Result:** 3 test files passed; 41 tests passed and 0 failed.
- **Named regression:** `deliberation hooks > persists the live Discord event once through the closed KM wire contract` passed.
- **Named producer proof:** `deliberation intake producer > validates input and reports duplicate replay without exposing content or credentials` passed.
- **Named transport proof:** `KM contract parsing > emits only transport metadata accepted by the closed KM contract` passed.

### Passing Test Output

```text
Test Files  3 passed (3)
     Tests  41 passed (41)
  Duration  469ms
[test] passed 1 Vitest shard in 3.21s
```

### Real Listener GREEN

The same implementation was then exercised against the KM-owned listener and a fresh disposable `DeliberationSpool`:

```json
{
  "first": {
    "duplicate": false,
    "exitCode": 0,
    "handled": true,
    "providerEventId": "1534181693647355986"
  },
  "replay": {
    "duplicate": true,
    "exitCode": 0,
    "handled": true,
    "providerEventId": "1534181693647355986"
  },
  "matchingRecordCount": 1,
  "totalRecordCount": 1
}
```

Full sanitized authority evidence: `plans/checkpoints/bright-vale-5327.real-listener-proof.md`.

## GREEN Phase (Post-Review)

- **Timestamp:** `2026-08-04T14:12:26Z`
- **Test command:** `pnpm test extensions/deliberation/src/hooks.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/scripts/intake-producer.test.ts -- --reporter=verbose`
- **Exit code:** `0`
- **Result:** 3 test files passed; 41 tests passed and 0 failed after restoring runtime `receivedAt` semantics.
- **Authority replay:** with the evidence clock fixed for an exact request replay, first and replay calls both exited 0, returned `duplicate:false` then `duplicate:true`, and left one matching canonical record.

```text
Test Files  3 passed (3)
     Tests  41 passed (41)
  Duration  640ms
[test] passed 1 Vitest shard in 3.53s
```
