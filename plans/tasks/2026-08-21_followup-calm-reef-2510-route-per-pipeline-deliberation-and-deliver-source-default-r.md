# [acceptance-fix] Route per-pipeline deliberation and deliver source-default replies: goal-001: Route per-pipeline deliberation and deliver source-default replies

Auto-created by the monitor because the original task `calm-vale-3982` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-001: Route per-pipeline deliberation and deliver source-default replies

### [BLOCKING] finding-001 - required_implementation_missing / correctness

**Scope:** `goal-001`  
**Claim:** The task must implement per-pipeline routing, immutable source-default and explicit-target delivery, ordinary-response suppression, and the single-attempt completion contract.

**Observed**
The supplied checkpoint says implementation is blocked before production code, leaves implementation, documentation/integration coverage, and verification steps incomplete, and identifies the repository-local KM contract as still lacking pipelineId, durable deliveryTarget lifecycle evidence, and a source-anchor discriminator.

**Why this matters**
The supplied diff adds pipeline configuration, producer-facing documentation, and a pending overlay, but the supplied checkpoint confirms that the final adapters, lifecycle enforcement, source-thread-anchor behavior, suppression paths, and focused coverage required by goal-001 were not implemented.

**Required action**
Supply the synchronized repository-local owner contract, then implement and document the required routing, suppression, immutable adapter lifecycle, source-default thread semantics, explicit root/thread semantics, and focused positive/negative coverage.

**Evidence**

- artifact: `plans/checkpoints/calm-vale-3982.checkpoint.md`
- artifact: `learnings/architecture/calm-vale-3982-distinguish-thread-anchors-from-exact-threads.md`
- plan: `plans/2026-08-21_calm-vale-3982_route-per-pipeline-deliberation-and-deliver-source-default.md`

### [BLOCKING] finding-002 - required_tdd_proof_missing / evidence

**Scope:** `goal-001`  
**Claim:** The caller-declared mandatory TDD requirement needs a valid RED/GREEN proof for the delivered behavior.

**Observed**
The supplied proof records only a RED contract-gate run with exit code 1; the checkpoint leaves GREEN proof incomplete and states production implementation has not started.

**Why this matters**
With tddRequired true, RED evidence alone does not establish the required RED/GREEN cycle for the acceptance goal.

**Required action**
Complete the implementation and append credible GREEN evidence to the task-scoped TDD proof after the intended RED failure.

**Evidence**

- artifact: `plans/checkpoints/calm-vale-3982.red-green-proof.md`
- artifact: `plans/checkpoints/calm-vale-3982.checkpoint.md`

## Context

- Original task: `calm-vale-3982`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Use the concrete goals and findings above to repair the untrustworthy task outcome. Make the minimum implementation and test changes needed, and verify the repaired behavior.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-08-21_calm-vale-3982_route-per-pipeline-deliberation-and-deliver-source-default.md` for full context. Focus only on the unmet goals listed above.

## Recent learnings from previous attempt

### 2026-08-21_durable-targets-must-distinguish-thread-anchors-from-exact-threads.md

```
---
title: "Durable targets must distinguish thread anchors from exact threads"
date: 2026-08-21
category: architecture
component: shared
tags: [deliberation, wire-contract, pipeline-routing, thread-anchor, fail-closed]
file_type: rules
---

# Durable targets must distinguish thread anchors from exact threads

A destination shaped only as `{ provider, account, channel, threadId? }` is insufficient when one workflow supports both source-default replies and explicit target threads.

For Discord, a source-default root message uses the inbound message as an anchor from which a thread must be creat
```

## Implementation session log excerpt (last 50 lines)

```
ct-thread discriminator.
- `extensions/deliberation/contracts/provenance.json:17` still marks KM adoption pending and the owner baseline unchanged.
- Added the fail-closed contract assertion at `extensions/deliberation/src/contract.test.ts:10`.
- Captured genuine RED: 1 failed, 8 passed in `plans/checkpoints/calm-vale-3982.red-green-proof.md:5`.
- Updated the checkpoint with the exact resume requirements.
- Saved the required learning under `learnings/architecture/2026-08-21_durable-targets-must-distinguish-thread-anchors-from-exact-threads.md`.

No production code, GREEN proof, build, or broader tests were attempted because doing so would require inventing the missing external contract. The synchronized local KM contract, fixtures, hashes, and provenance must be supplied before resuming.

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
