# [acceptance-fix] [acceptance-fix] Deliberation: repair completion and receipt semantics: goal-001: Deliberation: repair completion and re: goal-001: [acceptance-fix] Deliberation: repair completion and receipt semantics

Auto-created by the monitor because the original task `calm-crag-0993` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-001: [acceptance-fix] Deliberation: repair completion and receipt semantics: goal-001: Deliberation: repair completion and re

### [BLOCKING] finding-001 - required_implementation_missing / correctness

**Scope:** `goal-001`  
**Claim:** The required completion and receipt runtime repairs are not delivered in the caller-supplied task-scoped implementation diff.

**Observed**
The supplied diff changes changelog, documentation, README, and Deliberation wire/control contracts, but contains no hunks for extensions/deliberation/src/final-adapter.ts, extensions/deliberation/index.ts, extensions/deliberation/src/km-client.ts, or their focused tests. Checkpoint and proof prose name those files and behaviors but do not supply their implementation.

**Why this matters**
Goal-001 requires concrete completion, receipt, duplicate identity, exact replay/conflict, lifecycle binding, and strict projection behavior. Without the owning runtime and test hunks, semantic acceptance cannot establish that those required behaviors were delivered.

**Required action**
Supply the task-owned runtime and focused test hunks implementing all required completion and receipt semantics.

**Evidence**

- file: `plans/tasks/2026-08-22_followup-calm-crag-0993-deliberation-repair-completion-and-receipt-semantics.md`
- plan: `plans/2026-08-22_calm-crag-0993_deliberation-repair-completion-and-receipt-semantics-goal.md`
- artifact: `caller-supplied-task-scoped-diff`

### [BLOCKING] finding-002 - verification_evidence_missing / evidence

**Scope:** `goal-001`  
**Claim:** The required bounded implementation-diff provenance artifact is absent from the supplied review material.

**Observed**
The plan requires plans/checkpoints/calm-crag-0993.evidence.md to contain the complete task-owned source/test diff, path inventory, statistics, digest, truncation checks, and reverse-apply validation. That artifact is neither included in the task-scoped diff nor supplied among the additional task artifacts.

**Why this matters**
This follow-up exists to make preserved implementation hunks inspectable and distinguish them from unrelated dirty-worktree changes. The checkpoint's completion statement and test proof do not replace the explicitly required bounded provenance evidence.

**Required action**
Supply plans/checkpoints/calm-crag-0993.evidence.md with the complete bounded runtime/test diff and the provenance checks required by the plan.

**Evidence**

- plan: `plans/2026-08-22_calm-crag-0993_deliberation-repair-completion-and-receipt-semantics-goal.md`
- artifact: `caller-supplied-additional-task-artifacts`
- artifact: `plans/checkpoints/calm-crag-0993.checkpoint.md`

### [BLOCKING] finding-003 - unknown / correctness

**Scope:** `goal-001`  
**Claim:** The supplied task-scoped diff contains a material pipeline-routing and wire-contract redesign outside this acceptance repair's declared boundary.

**Observed**
The diff changes inbound policy documentation, per-pipeline configuration and legacy normalization, source-default routing, delivery target modes, intake and envelope requirements, lifecycle vectors, SDK channel semantics, README, and changelog, including extensions/deliberation/contracts/km-wire-v1.json and cutover-controls-v1.json.

**Why this matters**
The repair plan explicitly excludes routing, config, docs, SDK, and contract changes and says not to modify extensions/deliberation/contracts/\*\*. These are broad semantic changes rather than incidental churn, and no concurrent assignment candidates were supplied to establish alternate ownership.

**Required action**
Remove the unrelated routing/config/documentation/SDK/contract redesign from this task-scoped payload and supply only the bounded completion/receipt repair evidence.

**Evidence**

- artifact: `caller-supplied-task-scoped-diff`
- plan: `plans/2026-08-22_calm-crag-0993_deliberation-repair-completion-and-receipt-semantics-goal.md`
- file: `plans/tasks/2026-08-22_followup-calm-crag-0993-deliberation-repair-completion-and-receipt-semantics.md`

## Context

- Original task: `calm-crag-0993`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Use the concrete goals and findings above to repair the untrustworthy task outcome. Make the minimum implementation and test changes needed, and verify the repaired behavior.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-08-22_calm-crag-0993_deliberation-repair-completion-and-receipt-semantics-goal.md` for full context. Focus only on the unmet goals listed above.

## Recent learnings from previous attempt

### calm-crag-0993-exact-completion-evidence.md

```
---
title: "Dokončení musí svázat přesnou identitu životního cyklu"
date: 2026-08-22
category: architecture
component: shared
tags: [deliberation, completion, replay, receipts, cas]
file_type: rules
---

# Exact completion evidence spans lifecycle semantics

When validating a KM completion replay, matching the attempt ID, envelope, target, idempotency keys, and provider evidence is not enough. The returned attempt must also match the reservation ordinal, and its `reservedRecordVersion` must equal the version on which the reservation CAS ran.

In this protocol, the reservation response's `versi
```

## Implementation session log excerpt (last 50 lines)

```
act replay semantics.
- Rejected duplicate attempt identities and mismatched lifecycle evidence.
- Added ordinal, pre-CAS version, and contradictory `FAILED` receipt checks in `extensions/deliberation/src/km-client.ts:1336`.
- Added focused regressions in `extensions/deliberation/src/km-client.test.ts:983`.
- TDD proof complete at `plans/checkpoints/calm-crag-0993.red-green-proof.md`.
- Focused tests: 122 passed.
- Full Deliberation suite: 292 passed.
- `pnpm tsgo:extensions`, build, formatting, and scoped lint passed.
- Final autoreview: clean.
- Learning saved at `learnings/architecture/calm-crag-0993-exact-completion-evidence.md`.

Unrelated blockers remain: `tsgo:extensions:test` fails in `history-read.test.ts`; `check:changed` cannot start Testbox because `blacksmith` is unavailable.

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
