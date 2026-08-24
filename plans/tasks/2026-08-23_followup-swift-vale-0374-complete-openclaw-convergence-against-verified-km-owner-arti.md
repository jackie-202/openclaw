# [acceptance-fix] Complete OpenClaw convergence against verified KM owner artifacts: goal-001: Complete OpenClaw convergence against verified KM owner artifacts

Auto-created by the monitor because the original task `cool-vale-4616` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-001: Complete OpenClaw convergence against verified KM owner artifacts

### [BLOCKING] finding-001 - required_implementation_missing / correctness

**Scope:** `goal-001`  
**Claim:** The required OpenClaw owner-convergence implementation was not delivered in the supplied task-scoped changes.

**Observed**
The supplied task-scoped diff changes architecture-review artifacts, changelog entries, and documentation, but does not show the required owner contract mirror, provenance, KM client, final adapter, singular spool probe, cross-repository OR-07..OR-21 harness, or focused regression-test changes named by the canonical task.

**Why this matters**
Plans and checkpoint assertions do not substitute for delivered implementation. Without the required product boundary changes in the supplied material, goal-001 cannot be accepted.

**Required action**
Deliver the task-scoped contract/provenance, producer/probe, client, adapter, harness, and regression-test changes that implement the verified KM owner semantics.

**Evidence**

- file: `plans/tasks/2026-08-23_complete-openclaw-convergence-against-verified-km-owner-arti.md`
- artifact: `caller-supplied:task-scoped-diff`

### [BLOCKING] finding-002 - required_tdd_proof_missing / evidence

**Scope:** `goal-001`  
**Claim:** The caller-required RED/GREEN TDD proof is incomplete in the supplied material.

**Observed**
The supplied cool-vale-4616 TDD proof contains a historical RED section with exit code 1, but no fresh post-change GREEN section, exact successful output, or completed RED-to-GREEN sequence is supplied; the checkpoint's summary claim is not the proof itself.

**Why this matters**
The manifest declares tddRequired true, so both genuine RED and implementation-backed GREEN evidence must be materially present and attributable to this task.

**Required action**
Provide the task-scoped TDD proof containing the exact RED command/result and fresh post-change GREEN command/result for the required OR-19/OR-20 regression cycle.

**Evidence**

- artifact: `plans/checkpoints/cool-vale-4616.red-green-proof.md`
- artifact: `plans/checkpoints/cool-vale-4616.checkpoint.md`

### [BLOCKING] finding-003 - verification_evidence_missing / evidence

**Scope:** `goal-001`  
**Claim:** The explicitly required convergence completion evidence is not supplied.

**Observed**
No completion note or equivalent supplied artifact preserves the current KM HEAD, all four verified hashes, touched OpenClaw boundaries, exact named OR-07..OR-21 results, integration result, deterministic KM composed E2E result, focused-check commands/results, and cleanup/forbidden-action confirmation. The checkpoint provides summary claims and identifies a remaining composed-E2E gap, but not the required exact evidence ledger.

**Why this matters**
These evidence items are explicit completion requirements of the canonical task. Their absence prevents semantic confirmation of owner-backed convergence independently of the unrun caller-owned Test Gate.

**Required action**
Provide a task-owned completion artifact with the exact required provenance, per-leaf results, commands, outcomes, cleanup evidence, and forbidden-action confirmation.

**Evidence**

- file: `plans/tasks/2026-08-23_complete-openclaw-convergence-against-verified-km-owner-arti.md`
- artifact: `plans/checkpoints/cool-vale-4616.checkpoint.md`
- artifact: `caller-supplied:test-gate-status`

## Context

- Original task: `cool-vale-4616`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Use the concrete goals and findings above to repair the untrustworthy task outcome. Make the minimum implementation and test changes needed, and verify the repaired behavior.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-08-24_cool-vale-4616_complete-openclaw-convergence-against-verified-km-owner.md` for full context. Focus only on the unmet goals listed above.

## Recent learnings from previous attempt

### cool-vale-4616-owner-contract-test-drift.md

```
---
title: "Ověřené owner artefakty mohou odhalit zastaralé owner testy"
date: 2026-08-24
category: test-failures
component: e2e
tags: [cross-repository, contract-provenance, sha256, e2e, deliberation]
file_type: rules
---

# Verified owner artifacts can expose stale owner tests

For cross-repository integration, verify the exact contract, fixtures, wire implementation, and lifecycle-contract hashes before judging behavior. Repository HEAD is useful provenance but must not override matching accepted artifacts when unrelated commits keep moving it.

After replacing a consumer's hybrid mirror by
```

## Implementation session log excerpt (last 50 lines)

```
.
- Learning: `learnings/test-failures/cool-vale-4616-owner-contract-test-drift.md`.

**Remaining Blockers**
- KM composed E2E: `1 failed, 2 passed`. The remaining KM assertion expects messages without `pipelineId`/`deliveryTarget`, although the verified owner contract requires both and KM persistence emits both. Fixing this solely in OpenClaw would violate the owner contract.
- `pnpm tsgo:extensions:test` has unrelated pre-existing history-read/Discord/Slack mock errors.
- `pnpm check:changed` could not allocate Testbox because `blacksmith` is unavailable.
- Autoreview was attempted but the unrelated dirty-worktree bundle exceeded the engine’s 1 MB input limit.

No KM files, services, credentials, production spool, deployment, Gateway, live provider, or pilot configuration were modified.

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
