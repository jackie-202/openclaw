# [acceptance-fix] [acceptance-fix] Deliberation: validate fixtures, bound legacy config, and repair integration proof: goal-001: Deliberat: goal-001: [acceptance-fix] Deliberation: validate fixtures, bound legacy config,

Auto-created by the monitor because the original task `bold-wave-3956` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-001: [acceptance-fix] Deliberation: validate fixtures, bound legacy config, and repair integration proof: goal-001: Deliberat

### [BLOCKING] finding-001 - verification_evidence_missing / evidence

**Scope:** `goal-001`  
**Claim:** The required current cross-repository GREEN proof for the repaired Deliberation harness is absent.

**Observed**
The supplied task proof records a genuine current-harness RED with exit code 1, 12 passing and 11 failing scenarios, and explicitly states that GREEN is blocked because the hash-matched approved KM runtime rejects the required pipelineId and mode-bearing deliveryTarget contract with 400 SCHEMA_INVALID. The checkpoint leaves resolution, GREEN capture, and completion verification unfinished, and the caller-owned Test Gate was not run.

**Why this matters**
Goal-001 is an acceptance evidence repair whose required outcome is successful owner-backed runtime completion of the named scenarios. A runtime RED establishes the contract divergence but does not provide the requested passing integration proof, so the goal remains unverified.

**Required action**
Supply caller-owned evidence from an approved, contract-converged KM revision showing the canonical cross-repository integration command exits successfully and completes the required runtime scenarios while external/live convergence remains explicitly unknown.

**Evidence**

- artifact: `plans/checkpoints/bold-wave-3956.red-green-proof.md`
- artifact: `plans/checkpoints/bold-wave-3956.checkpoint.md`
- file: `plans/tasks/2026-08-22_followup-bold-wave-3956-deliberation-validate-fixtures-bound-legacy-config-and-repai.md`
- plan: `plans/2026-08-22_bold-wave-3956_deliberation-validate-fixtures-bound-legacy-config-and.md`

## Context

- Original task: `bold-wave-3956`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Treat this as an evidence-only follow-up. Production-code changes are forbidden by default. You must inspect the parent implementation and evidence first, then supply only the missing acceptance evidence. Escalate only if that inspection lets you document a real implementation defect; in that case, make only the minimal fix with tests.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-08-22_bold-wave-3956_deliberation-validate-fixtures-bound-legacy-config-and.md` for full context. Focus only on the unmet goals listed above.

## Recent learnings from previous attempt

### bold-wave-3956-hash-equality-does-not-prove-runtime-convergence.md

```
---
title: "Hash equality does not prove executable owner convergence"
date: 2026-08-22
category: architecture
component: shared
tags: [deliberation, contracts, provenance, integration-testing, cross-repository]
file_type: rules
---

# Hash equality does not prove executable owner convergence

A cross-repository consumer gate can pass its pinned file-hash preflight and still fail every positive runtime path when the pinned files do not describe the producer's actual extended contract.

For Deliberation, OpenClaw required `pipelineId`, an intake `deliveryTarget`, and a mode-bearing target. The
```

## Implementation session log excerpt (last 50 lines)

```
hed runtime: 12 passed, 11 failed with positive intake returning `400 SCHEMA_INVALID`.
- Pinned KM runtime lacks required `pipelineId`, intake `deliveryTarget`, and target `mode`.
- No production or provenance changes were made to manufacture GREEN.
- Full evidence: `plans/checkpoints/bold-wave-3956.red-green-proof.md`
- Resume state: `plans/checkpoints/bold-wave-3956.checkpoint.md`
- Learning saved: `learnings/architecture/bold-wave-3956-hash-equality-does-not-prove-runtime-convergence.md`

Verification:
- Contract/config tests: 14 passed
- `pnpm build`: passed
- Scoped Oxlint: passed
- Formatting and `git diff --check`: passed

GREEN requires an approved KM revision whose tracked contract and runtime implement the current closed producer shape. External/live convergence remains unknown.

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
