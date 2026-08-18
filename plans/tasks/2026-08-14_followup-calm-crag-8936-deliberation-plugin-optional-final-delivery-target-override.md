# [acceptance-fix] Deliberation plugin: optional final delivery target override: goal-001: Deliberation plugin: optional final delivery target override

Auto-created by the monitor because the original task `quick-dune-0250` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-001: Deliberation plugin: optional final delivery target override

### [BLOCKING] finding-001 - required_implementation_missing / correctness

**Scope:** `goal-001`  
**Claim:** The optional operator-owned deliveryTarget route and durable-target delivery behavior were not implemented.

**Observed**
The supplied checkpoint states work stopped before product edits because the repository-local KM contract lacked deliveryTarget; the task-scoped diff contains no changes to the manifest schema, runtime config, KM client, final adapter, or focused tests required by the target goal.

**Why this matters**
Without the configuration and adapter slice, configured source-A output cannot be routed deterministically to target B, and omission/validation/operator-control requirements are not delivered.

**Required action**
Implement the accepted contract-dependent deliveryTarget configuration, trusted KM-boundary injection, durable envelope consumption, evidence consistency, documentation, and focused coverage described by the canonical task.

**Evidence**
- file: `plans/checkpoints/quick-dune-0250.checkpoint.md`
- plan: `plans/2026-08-14_quick-dune-0250_deliberation-plugin-optional-final-delivery-target-override.md`
- file: `plans/tasks/2026-08-14_deliberation-plugin-delivery-target-override.md`

### [BLOCKING] finding-002 - required_tdd_proof_missing / evidence

**Scope:** `goal-001`  
**Claim:** The caller-mandated RED/GREEN TDD proof is absent.

**Observed**
The manifest declares tddRequired true, the supplied TDD proof/provenance is explicitly empty, and the checkpoint says no RED/GREEN proof exists because implementation stopped before tests were changed.

**Why this matters**
The acceptance policy requires valid TDD proof whenever the immutable run manifest sets tddRequired true.

**Required action**
Supply the required assertion-level RED and GREEN proof for the target task through the caller-owned TDD process.

**Evidence**
- artifact: `TDD proof/provenance: no TDD proof supplied`
- file: `plans/checkpoints/quick-dune-0250.checkpoint.md`
- file: `manifest.json:20`

### [BLOCKING] finding-003 - verification_evidence_missing / evidence

**Scope:** `goal-001`  
**Claim:** The explicitly required final verification note with exact commands and results is absent.

**Observed**
The canonical task requires a final note recording exact verification commands and results, while the supplied checkpoint shows verification gates and final proof-artifact verification still pending and no final note is supplied.

**Why this matters**
This is missing required validation evidence, independent of Test Gate execution; Acceptance does not request or interpret test runs.

**Required action**
Provide the final task note recording the exact caller-owned verification commands and their results after implementation verification is completed.

**Evidence**
- file: `plans/tasks/2026-08-14_deliberation-plugin-delivery-target-override.md`
- file: `plans/checkpoints/quick-dune-0250.checkpoint.md`
- test-gate: `not run; no Test Gate evidence exists`


## Context

- Original task: `quick-dune-0250`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Use the concrete goals and findings above to repair the untrustworthy task outcome. Make the minimum implementation and test changes needed, and verify the repaired behavior.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-08-14_quick-dune-0250_deliberation-plugin-optional-final-delivery-target-override.md` for full context. Focus only on the unmet goals listed above.

## Implementation session log excerpt (last 50 lines)

```
 ] Verify proof file contains RED and GREEN sections
[ ] Run save-learning skill and save at least one learning
[0m
Blocked by the required KM contract dependency:

- `extensions/deliberation/contracts/km-wire-v1.json:79` has no intake `deliveryTarget`.
- `extensions/deliberation/contracts/km-wire-v1.json:94` has no durable envelope `deliveryTarget`.
- `extensions/deliberation/contracts/provenance.json:2` still references the older `quick-mist-0149` snapshot.

Plan step 1 explicitly requires stopping before tests or production edits when these fields are absent. The blocker is recorded in `plans/checkpoints/quick-dune-0250.checkpoint.md`. RED/GREEN proof and save-learning were not created because implementation cannot safely begin until the preceding KM-owned contract update is accepted.

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
