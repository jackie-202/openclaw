# Deliberation READY_TO_SEND Delivery TDD Proof

## RED Phase

No source-level RED is valid for this acceptance follow-up. The original plan establishes that the canonical sender already exists and that its isolated transition test was green; recreating a failure by disabling that sender would be synthetic. The parent `wild-vale-0017` registration RED is rejected by the plan because it inverted an already-present registration assertion and does not exercise READY_TO_SEND delivery.

The outstanding behavior is operational: the serving Gateway has not loaded the verified artifact. A valid RED/GREEN pair therefore requires the host owner's authorized deployment verifier and restart, followed by read-only proof that the named record transitions once to `SENT` with one delivery attempt, one provider message ID, and one Discord reply.

## GREEN Phase

Focused command attempted on 2026-08-18:

```text
pnpm test extensions/deliberation/scripts/km-listener.cross-repo.ts -- --reporter=verbose
[test] queued behind the local heavy-check lock held by test, pid 23101
```

The command did not reach the test assertions before its 120-second command timeout. Fresh GREEN remains pending the lock owner's completion and the authorized live rollout evidence.
