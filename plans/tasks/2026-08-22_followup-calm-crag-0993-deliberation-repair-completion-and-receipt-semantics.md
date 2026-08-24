# [acceptance-fix] Deliberation: repair completion and receipt semantics: goal-001: Deliberation: repair completion and receipt semantics

Auto-created by the monitor because the original task `bold-brook-4380` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-001: Deliberation: repair completion and receipt semantics

### [BLOCKING] finding-001 - required_implementation_missing / correctness

**Scope:** `goal-001`  
**Claim:** The required completion and receipt semantic repairs are not delivered in the supplied task-scoped implementation diff.

**Observed**
The supplied diff changes changelog, documentation, README, and wire/control contracts, but does not show changes to final-adapter.ts, index.ts, km-client.ts, or their focused tests that implement unknown post-invocation outcomes, canonical single-message evidence, duplicate attempt rejection, and exact replay/conflict handling.

**Why this matters**
The canonical task requires concrete runtime behavior changes, and the plan identifies those Deliberation source files as the implementation boundary. Learning and checkpoint prose describe intended or claimed behavior but are not delivered implementation evidence.

**Required action**
Deliver the required runtime and focused test changes for all completion, receipt, duplicate identity, replay/conflict, and strict projection behaviors.

**Evidence**

- file: `plans/tasks/2026-08-21_deliberation-repair-completion-and-receipt-semantics.md`
- plan: `plans/2026-08-22_bold-brook-4380_deliberation-repair-completion-and-receipt-semantics.md`
- artifact: `caller-supplied-task-scoped-diff`

### [BLOCKING] finding-002 - required_tdd_proof_missing / evidence

**Scope:** `goal-001`  
**Claim:** The caller-required RED/GREEN TDD proof is incomplete in the supplied artifact.

**Observed**
The supplied bold-brook-4380.red-green-proof.md content contains RED phase metadata and failing-run output only; it contains no GREEN phase command, successful outcome, or GREEN evidence. The checkpoint's statement that both phases were verified is prose rather than the required proof data.

**Why this matters**
The manifest declares tddRequired true, and the task plan explicitly requires recorded RED/GREEN evidence. RED-only material does not establish the mandatory GREEN phase.

**Required action**
Provide a valid task-scoped TDD proof containing both RED and GREEN phases with their command and outcome evidence.

**Evidence**

- artifact: `plans/checkpoints/bold-brook-4380.red-green-proof.md`
- plan: `plans/2026-08-22_bold-brook-4380_deliberation-repair-completion-and-receipt-semantics.md`
- file: `plans/checkpoints/acceptance-runs/bold-brook-4380-acceptance-001/manifest.json:20`

### [BLOCKING] finding-003 - unknown / correctness

**Scope:** `goal-001`  
**Claim:** The task-scoped diff includes a material pipeline-routing and wire-contract redesign outside this repair's declared boundary.

**Observed**
The supplied diff changes inbound policy documentation, pipeline configuration and legacy normalization, source-default routing, delivery target modes, intake and envelope contract requirements, and associated lifecycle vectors across docs and Deliberation contracts.

**Why this matters**
The plan says to keep the existing single-attempt contract unchanged, retain km-wire-v1.json as authority, and not regenerate or change contracts. These broad semantic changes materially increase acceptance risk and cannot be classified as minor incidental churn; no concurrent assignment candidates were supplied to establish alternate ownership.

**Required action**
Remove the unrelated pipeline/config/contract changes from this task-scoped change set or supply a bounded ownership attribution that excludes their exact paths from this run.

**Evidence**

- artifact: `caller-supplied-task-scoped-diff`
- plan: `plans/2026-08-22_bold-brook-4380_deliberation-repair-completion-and-receipt-semantics.md`

## Context

- Original task: `bold-brook-4380`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Use the concrete goals and findings above to repair the untrustworthy task outcome. Make the minimum implementation and test changes needed, and verify the repaired behavior.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-08-22_bold-brook-4380_deliberation-repair-completion-and-receipt-semantics.md` for full context. Focus only on the unmet goals listed above.

## Recent learnings from previous attempt

### bold-brook-4380-operation-specific-http-conflicts.md

```
---
title: "Keep expected HTTP conflicts at the endpoint owner"
date: 2026-08-22
category: architecture
component: shared
tags: [deliberation, http, conflicts, replay, km-client]
file_type: rules
---

# Keep expected HTTP conflicts at the endpoint owner

A shared KM request helper must preserve every non-2xx response as a typed HTTP error. Converting selected 409 responses into synthetic success values in the helper loses which operation received the conflict: reservation can legitimately map `CAS_CONFLICT` and `CONTROL_DISABLED` to closed non-send outcomes, while completion must expose the sa
```

## Implementation session log excerpt (last 50 lines)

```
ejected.
- Completion 409 conflicts retain HTTP semantics.
- Runtime projection parsing now covers all schema-permitted fields.
- Added replay, conflict, malformed receipt, duplicate identity, and composed-provider coverage.

Verification:

- Focused tests: 118 passed.
- Full Deliberation suite: 287 passed.
- `pnpm tsgo:extensions`: passed.
- `pnpm build`: passed.
- Production lint and formatting: passed.
- Scoped autoreview: clean.
- RED/GREEN proof: `plans/checkpoints/bold-brook-4380.red-green-proof.md`.
- Learning saved: `learnings/architecture/bold-brook-4380-operation-specific-http-conflicts.md`.

Known unrelated blockers:

- `pnpm tsgo:extensions:test` has existing `history-read.test.ts` type errors.
- `pnpm check:changed` could not start Testbox because `blacksmith` is unavailable.

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
