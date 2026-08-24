# [acceptance-fix] RED-GREEN: preserve one-event intake and safe uncertain-delivery semantics: goal-001: One authenticated provider event produces exactly one durable item/rec

Auto-created by the monitor because the original task `warm-mist-6808` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-001: One authenticated provider event produces exactly one durable item/record; thread peers share history only.
- goal-002: One item produces at most one provider attempt and one matching receipt.
- goal-003: Unknown delivery outcome is fail-closed and cannot silently retry or reroute.
- goal-004: A new send is allowed only when canonical durable evidence proves no provider attempt occurred.
- goal-005: Discord and Slack fixtures cover root/child events, timeout, transport ambiguity, replay, duplicate evidence, and receipt mismatch.
- goal-006: Relevant contract/plugin integration tests, build, lint, and canonical Test Gate pass.

### [BLOCKING] finding-001 - required_implementation_missing / correctness

**Scope:** `goal-001`, `goal-002`, `goal-003`, `goal-004`  
**Claim:** The task must implement singular durable intake and fail-closed, proof-authorized delivery semantics.

**Observed**
The supplied checkpoint states that the owner handoff was unavailable, implementation stopped at step 2, no production code was edited, and steps for singular intake, uncertainty transitions, replay fencing, and proof-backed resend authorization remain incomplete.

**Why this matters**
Documentation and partial contract churn do not deliver the required runtime behavior; the task artifact explicitly records that the implementation was not performed.

**Required action**
Deliver the runtime and canonical contract changes that enforce one record per authenticated event, at most one matching provider attempt, terminal unknown outcomes, and new sends only after durable NOT_SENT evidence.

**Evidence**

- artifact: `plans/checkpoints/warm-mist-6808.checkpoint.md`
- plan: `plans/2026-08-23_warm-mist-6808_red-green-preserve-one-event-intake-and-safe-uncertain.md`

### [BLOCKING] finding-002 - required_implementation_missing / correctness

**Scope:** `goal-005`  
**Claim:** Discord and Slack fixtures must cover the complete required root/child, ambiguity, replay, duplicate-evidence, and receipt-mismatch matrix.

**Observed**
The supplied checkpoint leaves the complete RED test matrix and implementation steps incomplete and explicitly states that no tests were edited; the supplied diff does not provide the required complete Discord and Slack fixture matrix.

**Why this matters**
The required fixture coverage is a task deliverable and is absent from the supplied implementation material.

**Required action**
Add authentic Discord and Slack fixtures covering root and child events, timeout, transport ambiguity, replay, duplicate evidence, and receipt mismatch through the required integration paths.

**Evidence**

- artifact: `plans/checkpoints/warm-mist-6808.checkpoint.md`
- file: `task-scoped-diff`

### [BLOCKING] finding-003 - required_tdd_proof_missing / evidence

**Scope:** cross-cutting  
**Claim:** This run requires authentic RED-GREEN proof for the task implementation.

**Observed**
The manifest declares tddRequired true, the caller supplied no TDD proof, and the checkpoint states that neither RED nor GREEN proof was captured.

**Why this matters**
The mandatory TDD evidence is absent, so the required test-first implementation sequence cannot be established from supplied artifacts.

**Required action**
Supply authentic assertion-level RED and matching-command GREEN proof for the required intake and delivery-state-machine paths.

**Evidence**

- artifact: `TDD-proof/provenance:none-supplied`
- artifact: `plans/checkpoints/warm-mist-6808.checkpoint.md`

### [BLOCKING] finding-004 - verification_evidence_missing / evidence

**Scope:** `goal-006`  
**Claim:** The relevant contract/plugin integration checks, build, lint, and canonical Test Gate must have passing evidence.

**Observed**
The caller states that Test Gate was not run and no Test Gate evidence exists; the checkpoint also leaves focused tests, integration, lint, build, and changed gates incomplete.

**Why this matters**
Goal-006 explicitly requires successful verification, but the supplied artifacts contain no canonical passing reference or other required validation evidence.

**Required action**
Provide the caller-owned canonical Test Gate passing reference and the required focused integration, build, and lint verification evidence.

**Evidence**

- test-gate: `status:not-run`
- artifact: `plans/checkpoints/warm-mist-6808.checkpoint.md`

## Context

- Original task: `warm-mist-6808`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Use the concrete goals and findings above to repair the untrustworthy task outcome. Make the minimum implementation and test changes needed, and verify the repaired behavior.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-08-23_warm-mist-6808_red-green-preserve-one-event-intake-and-safe-uncertain.md` for full context. Focus only on the unmet goals listed above.

## Implementation session log excerpt (last 50 lines)

```
stem/scripts/deliberation-v2-listener.py
[0m
[0m% [0mPatch 1 file
Implementation is blocked by the plan’s mandatory owner-contract gate.

- `OPENCLAW_DELIBERATION_KM_ROOT` is unset.
- The available KM checkout has the exact contract/fixture hashes already recorded as semantically mismatched in `extensions/deliberation/contracts/provenance.json:25`.
- Direct reads of the owner contract are permission-denied.
- No tests or production code were changed.
- No RED proof was fabricated because provenance/setup failures are explicitly invalid RED.
- Resume state is recorded in `plans/checkpoints/warm-mist-6808.checkpoint.md`.

Required to continue: provide readable, owner-approved singular-record/retry-authorization artifacts or a converged KM checkout and set `OPENCLAW_DELIBERATION_KM_ROOT`.

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
