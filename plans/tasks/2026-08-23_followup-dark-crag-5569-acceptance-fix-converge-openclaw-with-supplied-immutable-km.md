# [acceptance-fix] [acceptance-fix] Converge OpenClaw with supplied immutable KM Deliberation owner bundle: goal-001: Converge OpenClaw wit: goal-001: [acceptance-fix] Converge OpenClaw with supplied immutable KM Delibera

Auto-created by the monitor because the original task `calm-fork-2914` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-001: [acceptance-fix] Converge OpenClaw with supplied immutable KM Deliberation owner bundle: goal-001: Converge OpenClaw wit

### [BLOCKING] finding-001 - required_implementation_missing / correctness

**Scope:** `goal-001`  
**Claim:** The required OpenClaw convergence with the supplied immutable KM Deliberation owner bundle was not delivered.

**Observed**
The supplied checkpoint states that the task stopped at the immutable-authority revision gate before production or test edits; implementation, focused verification, and GREEN steps remain incomplete. The task-scoped diff does not supply the required contract mirror, KM client, probe, adapter, or OR-07 through OR-21 harness convergence.

**Why this matters**
Goal goal-001 requires concrete OpenClaw behavior and boundary artifacts aligned to the approved KM owner bundle. A blocker checkpoint and unrelated documentation or architecture-review changes do not implement that convergence.

**Required action**
Restore the approved KM checkout revision, then implement the task-scoped OpenClaw contract, client, probe, adapter, provenance, and named harness convergence without modifying KM.

**Evidence**

- artifact: `plans/checkpoints/calm-fork-2914.checkpoint.md`
- file: `plans/tasks/2026-08-23_followup-calm-fork-2914-converge-openclaw-with-supplied-immutable-km-deliberation-ow.md`

### [BLOCKING] finding-002 - required_tdd_proof_missing / evidence

**Scope:** `goal-001`  
**Claim:** The caller-required RED-GREEN TDD proof is incomplete.

**Observed**
The manifest declares tddRequired true. The supplied proof links a genuine historical owner-boundary RED, but explicitly records an authority-gate block before implementation and contains no fresh GREEN phase or post-change passing evidence.

**Why this matters**
Historical RED provenance alone does not satisfy the mandatory TDD contract; the same owner-backed boundary must have credible post-implementation GREEN evidence.

**Required action**
After implementing the convergence, append fresh GREEN evidence for the owner-backed boundary to the task-scoped RED-GREEN proof while preserving the linked genuine historical RED.

**Evidence**

- artifact: `plans/checkpoints/calm-fork-2914.red-green-proof.md`
- artifact: `plans/checkpoints/calm-fork-2914.checkpoint.md`

## Context

- Original task: `calm-fork-2914`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Use the concrete goals and findings above to repair the untrustworthy task outcome. Make the minimum implementation and test changes needed, and verify the repaired behavior.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-08-23_calm-fork-2914_converge-openclaw-with-supplied-immutable-km-deliberation.md` for full context. Focus only on the unmet goals listed above.

## Recent learnings from previous attempt

### immutable-owner-gate-before-behavioral-tdd.md

```
---
title: "Neměnné owner gate musí předcházet behaviorálnímu TDD"
date: 2026-08-23
category: tooling
component: general
tags: [openclaw, km-deliberation, tdd, provenance, immutable-owner]
file_type: rules
---

# Immutable owner gates must precede behavioral TDD

For cross-repository convergence against an immutable owner bundle, verify both the owner checkout revision and every supplied artifact hash before editing tests or production code. Matching file hashes are not enough when the approved contract also pins the repository revision.

If the revision differs, treat that as a setup/provenan
```

## Implementation session log excerpt (last 50 lines)

```
immutable-owner-gate-before-behavioral-tdd.md"
✓ Learning saved to learnings/tooling/immutable-owner-gate-before-behavioral-tdd.md
[0m
Blocked by the immutable authority gate.

- Expected KM revision: `79bbc5c0426bc7be901d5199da11b21213bfa008`
- Actual revision: `180e89d5a0a2604fcd3eb7d052881aaae9c0b749`
- All four scoped files are clean and hashes match.
- The plan prohibits modifying/resetting the KM checkout.
- No production or test code was changed.
- Historical RED provenance recorded in `plans/checkpoints/calm-fork-2914.red-green-proof.md`.
- GREEN and focused tests cannot run until an operator restores the approved revision.
- Blocker recorded in `plans/checkpoints/calm-fork-2914.checkpoint.md`.
- Learning saved to `learnings/tooling/immutable-owner-gate-before-behavioral-tdd.md`.

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
