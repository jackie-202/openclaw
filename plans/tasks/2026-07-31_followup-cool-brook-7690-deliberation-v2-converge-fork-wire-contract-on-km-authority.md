# [acceptance-fix] Deliberation v2: converge fork wire contract on KM authority (real fix + commit-ready working tree): goal-001: Grep for `x-deliberation-protocol`, `"/deliveries"`, `"/attempts"`, `"

Auto-created by the monitor because the original task `fresh-vale-7676` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-001: Grep for `x-deliberation-protocol`, `"/deliveries"`, `"/attempts"`, `"/control"` under `extensions/deliberation/` and `docs/plugins/reference/deliberation.md` returns zero matches (excluding historical plans/checkpoints).
- goal-002: Client requests use `X-Deliberation-Protocol-Version: 1` and the six canonical endpoints only.

### [BLOCKING] finding-001 - required_implementation_missing / correctness

**Scope:** `goal-001`, `goal-002`  
**Claim:** The canonical Deliberation wire convergence required by goals 001 and 002 was not delivered in the supplied target material.

**Observed**
The canonical task records that the executable client, contract fixtures, provenance, and documentation use the retired header and route family; the supplied plan remains DRAFT, identifies an unresolved contract blocker, and directs implementation to stop before product edits if unresolved. The supplied task-scoped diff contains no target-relevant change under extensions/deliberation or docs/plugins/reference/deliberation.md.

**Why this matters**
With no supplied implementation replacing the retired header and routes, neither the zero-residue requirement nor canonical-header/six-endpoint client behavior is present for semantic acceptance.

**Required action**
Deliver the target-relevant contract, client, caller, test, provenance, and documentation changes so retired literals are removed and requests use X-Deliberation-Protocol-Version: 1 with only the six canonical endpoints.

**Evidence**

- file: `plans/tasks/2026-07-31_deliberation-v2-converge-fork-wire-contract-on-km-authority.md`
- plan: `plans/2026-07-31_fresh-vale-7676_deliberation-v2-converge-fork-wire-contract-on-km-authority.md`
- artifact: `caller-supplied-task-scoped-diff`

### [BLOCKING] finding-002 - required_tdd_proof_missing / evidence

**Scope:** cross-cutting  
**Claim:** The caller-required TDD RED/GREEN proof is absent.

**Observed**
The immutable manifest declares tddRequired true, while the caller-supplied TDD proof/provenance section explicitly states that no TDD proof was supplied.

**Why this matters**
The catalog requires blocking evidence when mandatory TDD proof is absent; neither the planned focused RED nor a fresh GREEN is available for review.

**Required action**
Supply a valid run-scoped RED/GREEN proof for the focused canonical header and reservations-route behavior.

**Evidence**

- file: `plans/checkpoints/acceptance-runs/fresh-vale-7676-acceptance-001/manifest.json:28`
- artifact: `caller-supplied-tdd-proof-provenance`

## Context

- Original task: `fresh-vale-7676`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Use the concrete goals and findings above to repair the untrustworthy task outcome. Make the minimum implementation and test changes needed, and verify the repaired behavior.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-07-31_fresh-vale-7676_deliberation-v2-converge-fork-wire-contract-on-km-authority.md` for full context. Focus only on the unmet goals listed above.

## Previous attempt: acceptance context

**Already done (do NOT redo):**

- goal-003: All listed verification commands pass.

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
