# Plan 2026-08-18: Activate Deliberation Sole-Send Delivery

Deploy the already-proven canonical service and capture the missing live exactly-once evidence without adding another sender or mutating KM state.

## Analysis

### Codebase Context
- `extensions/deliberation/index.ts` registers `deliberation-final-delivery` when the plugin configuration is enabled.
- `extensions/deliberation/src/final-adapter.ts` owns the one-item, non-overlapping `ready -> reserve -> invoke -> provider.send -> completeDelivery` transition and waits for active work on stop.
- `extensions/deliberation/scripts/km-listener.cross-repo.ts` proves that transition against an isolated KM listener, including one fake-provider call and durable `SENT`; its production-spool guards must remain intact.
- The active Gateway previously reported `readyToSend: 1` for record `786951effe8b9f7eb035954671b80daafca7e6355dff846d53232761dacc24c7`, while its process predated the emitted service. The worktree is shared and broadly dirty; do not alter unrelated changes.

### Documentation
- `docs/plugins/reference/deliberation.md` assigns KM ownership of controls, reservation, recovery, and terminal state; the plugin service performs one provider call from the durable target.
- `docs/tools/plugin.md` requires restarting the serving Gateway after plugin changes and using runtime inspection plus deep Gateway status to prove the active process.

### Knowledge Base
- `learnings/runtime-errors/warm-brook-9472-isolated-green-not-rollout.md`: isolated GREEN does not prove the serving process; require owner-approved deploy, restart, and read-only `SENT`/one-attempt/one-receipt/one-reply evidence.
- `learnings/architecture/bright-reef-1988-separate-rollout-readiness-from-local-behavior-proof.md`: local correctness and rollout readiness are separate gates; fail readiness closed when authorization or provenance is missing.
- `learnings/architecture/2026-07-29_acceptance-fix-plans-must-close-contract-gates-explicitly.md`: an acceptance repair must either prove the operational repair or record explicit task-owner acceptance of a blocked state; prior blocked evidence is not TDD proof.
- `skill:recall-knowledge` used the deterministic local fallback because collection `openclaw-fork-learnings` is absent; its generic external-contract results add no behavior-specific constraint beyond the owner boundary above.

## Available Skills

- `openclaw-testing`: select focused source/build verification.
- `tdd`: record the authorized operational RED/GREEN ledger and any conditional source repair.
- `crabbox`: run owner-approved broader/live proof when required.
- `autoreview`: review any actual source change.
- `save-learning`: run only after the future implementation/rollout session completes.

## Solution

Treat the stale serving Gateway as the defect until fresh evidence disproves it. Obtain the host owner's canonical verifier and restart authorization, deploy the verified artifact, let the registered service claim the named record, and close acceptance only with read-only delivery evidence. If the isolated path regresses, make the smallest repair in the existing plugin/KM boundary; otherwise make no production change.

## Implementation

1. Obtain the host owner's canonical deploy-verifier command, rollout authorization, serving Gateway identity, and artifact location. If unavailable, write a blocked checkpoint and stop; do not substitute a guessed deploy/restart command.
2. Capture the operational RED before rollout: deep Gateway status, runtime Deliberation inspection, read-only `deliberation.status`, and the named KM record/attempt state. Require the record to be `READY_TO_SEND` with no completed delivery and preserve command output without credentials or payloads.
3. Re-run the isolated regression using `env OPENCLAW_DELIBERATION_KM_ROOT="<approved-km-checkout>" node --import tsx --test extensions/deliberation/scripts/km-listener.cross-repo.ts`. If it fails, record that command as source RED, repair only the proven owner, then rerun it as GREEN before any rollout.
4. If the isolated test passes, make no source edit. Build and run the existing built-plugin/runtime registration checks selected by `skill:openclaw-testing`; verify the deployed artifact contains exactly one `deliberation-final-delivery` service and the required hooks.
5. Run the owner-approved verifier, deploy that verified artifact, and restart the actual serving Gateway. Re-run deep status and runtime inspection; confirm a new serving process and active Deliberation service rather than cold manifest evidence.
6. Allow only the restarted service to process the named record. Do not reserve, send, edit SQLite, or invoke KM completion manually.
7. Collect read-only live GREEN evidence: the record is `SENT`; it has exactly one delivery attempt; that attempt has one provider message ID; and the source Discord thread has one matching reply. Record the process/artifact identities and attempt/message IDs in `plans/checkpoints/warm-reef-3383.final-note.md`.
8. Run `git diff --check`; run `skill:autoreview` if any source changed; update `plans/checkpoints/warm-reef-3383.red-green-proof.md` and the final note with commands, outcomes, and blockers. Run `skill:save-learning` last in the future implementation session.

## Files to Modify

| File | Change |
| --- | --- |
| `plans/checkpoints/warm-reef-3383.red-green-proof.md` | Link rejected prior source RED, record the authorized operational RED/GREEN, and add a real source RED/GREEN only if the isolated regression fails. |
| `plans/checkpoints/warm-reef-3383.final-note.md` | Record deploy/restart identity and read-only exactly-once evidence. |
| `extensions/deliberation/src/final-adapter.ts` or `extensions/deliberation/index.ts` | Conditional: minimal repair only when the focused source RED identifies a defect. |
| `extensions/deliberation/scripts/km-listener.cross-repo.ts` | Conditional: add a regression only for the source defect exposed by RED. |

## TDD

The historical RED in `plans/checkpoints/wild-vale-0017.red-green-proof.md` is invalid for this behavior because it expected zero registered services despite one existing service. Do not fabricate a replacement. Request task-owner authorization to use the preserved live pre-rollout facts as an operational RED; if that authorization is denied, record the TDD gate as blocked rather than claiming completion.

**Operational RED:** named record is `READY_TO_SEND`, has no completed attempt/provider message ID, and no Discord reply before the authorized restart.

**Operational GREEN:** after the authorized restart, the same record is `SENT` with exactly one attempt, one provider message ID, and one Discord reply.

**Conditional source test file:** `extensions/deliberation/scripts/km-listener.cross-repo.ts`

**Run command:** `env OPENCLAW_DELIBERATION_KM_ROOT="<approved-km-checkout>" node --import tsx --test extensions/deliberation/scripts/km-listener.cross-repo.ts`

```ts
const completed = await createFinalDeliveryAdapter({
  km: deliveryKm,
  providers: { discord: provider },
  owner: "openclaw-deliberation-integration",
}).runOnce();

assert.equal(completed?.state, "SENT");
assert.equal(providerCalls.length, 1);
```

| Evidence | RED | GREEN |
| --- | --- | --- |
| Live operational transition | Pending named record before authorized rollout. | Same record `SENT`, one attempt, one provider message ID, one Discord reply. |
| Conditional isolated source repair | The exact assertions fail before the proven owner edit. | The exact assertions pass after the repair. |

Implement any conditional source cycle with `skill:tdd`; write the evidence ledger to `plans/checkpoints/warm-reef-3383.red-green-proof.md`.

## Dependencies

- Host-owner rollout authorization and canonical deploy verifier.
- Read-only access to the serving Gateway, named KM record, and Discord reply evidence.
- No production source change is planned unless the isolated canonical path produces a fresh RED.

---
*Created: 2026-08-18*
*Status: DRAFT*
