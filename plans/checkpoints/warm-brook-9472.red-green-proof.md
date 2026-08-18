# TDD Red-Green Proof: warm-brook-9472

## RED Phase

No new source-level RED test is valid for this acceptance repair: the preserved implementation already passes the real `READY_TO_SEND -> reserve -> invoke -> provider.send -> completeDelivery` coverage in `extensions/deliberation/src/final-adapter.test.ts`. The parent task's contrary assertion that no service was registered is explicitly invalid for this behavior and is not reused as a RED result.

The genuine pre-rollout failure is operational and was recorded read-only in `plans/checkpoints/wild-vale-0017.final-note.md`: the active Gateway had `readyToSend: 1` and no reservation, while the process predated the emitted service. The corresponding GREEN phase will capture the authorized restart and read-only proof that the identified record reaches `SENT` with one attempt and provider receipt.

## GREEN Phase

- **Timestamp:** 2026-08-18
- **Test files:** `extensions/deliberation/scripts/km-listener.cross-repo.ts`
- **Test command:** `env OPENCLAW_DELIBERATION_KM_ROOT="/Users/michal/.openclaw/workspace/km-system" node --import tsx --test extensions/deliberation/scripts/km-listener.cross-repo.ts`
- **Result:** 0 failed, 7 passed
- **Reason no source edit followed:** The real isolated KM path already transitions a reviewed `READY_TO_SEND` record through exactly one reservation, invocation, fake-provider call, receipt completion, and `SENT`. The remaining defect is the stale serving Gateway, which requires the host owner-approved deploy verifier and restart.

### Test Output

```text
✔ real producer reaches the isolated KM listener and canonical spool (280.990917ms)
▶ reviewed final delivery preserves source provenance and uses the durable target
  ✔ defaults final delivery to source A (269.238167ms)
  ✔ routes final delivery from source A to override B (492.3275ms)
✔ reviewed final delivery preserves source provenance and uses the durable target (761.969083ms)
✔ listener rejects the production spool before opening SQLite (121.72325ms)
✔ listener and temporary root are cleaned after callback failure (131.8105ms)
✔ temporary fixture paths cannot alias production state (1.81525ms)
ℹ tests 7
ℹ suites 0
ℹ pass 7
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3795.193584
```
