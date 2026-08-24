# Plan 2026-08-22: Deliberation integration proof repair

Capture the missing owner-backed GREEN without reopening completed OpenClaw implementation work.

_Status: DRAFT_

## Analysis

- `plans/checkpoints/bold-wave-3956.red-green-proof.md` is the genuine current-harness RED: the canonical command exited 1 with 12/23 passing and all positive setups rejected as `400 SCHEMA_INVALID`.
- `extensions/deliberation/scripts/km-listener.cross-repo.ts:79` verifies accepted owner hashes before exercising the producer, ten protocol/intake negatives, four lifecycle conflicts, two delivery routes, spool isolation, and cleanup.
- The approved pinned KM runtime proves the blocker directly: `tmp/bold-wave-3956-agent-workspace/workspace/km-system/lib/deliberation_wire.py:39` excludes `pipelineId` and `deliveryTarget` from intake, while `tmp/bold-wave-3956-agent-workspace/workspace/km-system/lib/deliberation_delivery_target.py:11` excludes `mode`.
- `extensions/deliberation/contracts/provenance.json:31` correctly keeps external/live convergence `unknown`; no evidence-only run may broaden that claim.

## Available Skills

- `task-evidence`: retain the parent RED command and outcome as inherited evidence.
- `openclaw-testing`: run the narrow canonical integration gate and choose any conditional repair checks.
- `acceptance`: finalize against a caller-provided acceptance manifest after evidence exists.
- `save-learning`: mandatory final action.

## Execution

1. Use `skill:task-evidence` for `bold-wave-3956`; link `plans/checkpoints/bold-wave-3956.red-green-proof.md` as inherited RED rather than creating or replaying a fake RED for this follow-up.
2. Obtain a caller-approved immutable KM revision whose tracked owner contract and fixture hashes still equal the accepted values in `extensions/deliberation/contracts/provenance.json`, and inspect its executable intake validator, target parser, spool ingestion, and listener to prove support for required `pipelineId`, intake `deliveryTarget`, and target `mode`. Stop as blocked if approval, cleanliness, immutable revision, Python environment, or semantic convergence is absent.
3. Run the unchanged gate from the OpenClaw root: `env OPENCLAW_DELIBERATION_KM_ROOT="<approved-converged-km-root>" pnpm test:deliberation:km-integration`. Require exit 0 and 23/23 completion, including the canonical producer, ten named negatives, four lifecycle conflicts, both delivery routes, production-spool rejection, cleanup, and path isolation.
4. Create `plans/checkpoints/bold-peak-4880.red-green-proof.md` with the inherited RED link, approved repository/revision, clean tracked-file evidence, owner hashes, exact fresh GREEN command/output/exit code, scenario count, and an explicit `external/live convergence: unknown` statement.
5. Create `plans/checkpoints/bold-peak-4880.checkpoint.md` marking goal-001 complete only when the GREEN artifact satisfies every scenario. Run `git diff --check`; run the caller-owned acceptance Test Gate via `skill:acceptance` when its manifest is supplied, and record its exact result without substituting repository-local checks.
6. Do not edit production code, mirrored contracts, fixtures, hashes, or `configuredKmCheckoutEvidence` merely to obtain GREEN. If the converged approved runtime exposes a reproducible OpenClaw defect, preserve that failure, document the owner/runtime evidence, and escalate before making only the minimal test-backed repair; then rerun the identical integration command and fresh `skill:autoreview`.
7. Invoke `skill:save-learning` last and save at least one learning about the owner-revision and evidence result.

## Files to Modify

| File                                                  | Change                                                              |
| ----------------------------------------------------- | ------------------------------------------------------------------- |
| `plans/checkpoints/bold-peak-4880.red-green-proof.md` | Link inherited RED and record fresh approved-runtime GREEN          |
| `plans/checkpoints/bold-peak-4880.checkpoint.md`      | Record completion or the exact owner prerequisite still blocking it |
| `learnings/<category>/<generated-name>.md`            | Save the mandatory final learning                                   |

Production files remain unchanged unless step 6 proves and authorizes a concrete defect repair.

## TDD: skip

This is an evidence-only follow-up to an existing implementation; the genuine parent RED is reused and fresh GREEN comes from the same canonical integration gate, so creating a new failing test would fabricate provenance.

## Dependencies

- Caller-approved, immutable, clean KM revision with an isolated `.venv`, listener, accepted owner hashes, and executable support for the complete current closed contract.
- Caller-provided acceptance manifest/Test Gate for final semantic acceptance; absence is recorded as a blocker, not replaced by an invented command.
- No live service activation or external delivery is required; external/live convergence remains unknown.

---

_Created: 2026-08-22_
_Status: DRAFT_
