# [acceptance-fix] [acceptance-fix] RED-GREEN: preserve one-event intake and safe uncertain-delivery semantics: goal-001: One authenticated: goal-001: [acceptance-fix] RED-GREEN: preserve one-event intake and safe uncerta

Auto-created by the monitor because the original task `calm-crag-4037` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-001: [acceptance-fix] RED-GREEN: preserve one-event intake and safe uncertain-delivery semantics: goal-001: One authenticated

### [BLOCKING] finding-001 - required_implementation_missing / correctness

**Scope:** `goal-001`  
**Claim:** One authenticated provider event must produce exactly one durable record, with thread peers used only as history.

**Observed**
The task checkpoint states implementation stopped before production edits, and the plan analysis says the mirrored KM contract still uses burst and multi-message record semantics; the supplied material therefore contains no delivered singular durable-intake implementation.

**Why this matters**
Without the runtime and authoritative durable-contract change, distinct authenticated events can still be represented by burst-grouped records, so the evaluated one-event/one-record behavior is not delivered.

**Required action**
Implement and supply the owner-approved singular-record intake path so each authenticated provider event creates exactly one durable record while thread peers remain context only, with idempotent replay preserving that record.

**Evidence**

- artifact: `plans/checkpoints/calm-crag-4037.checkpoint.md`
- plan: `plans/2026-08-23_calm-crag-4037_red-green-preserve-one-event-intake-and-safe-uncertain.md`

### [BLOCKING] finding-002 - required_tdd_proof_missing / evidence

**Scope:** cross-cutting  
**Claim:** This run requires authentic RED-GREEN proof for the evaluated repair.

**Observed**
The manifest declares tddRequired true, the caller supplied no TDD proof, parent lineage records no historical verification evidence, and the current checkpoint shows RED creation and GREEN verification remain incomplete.

**Why this matters**
The required test-first sequence and matching-command GREEN evidence cannot be established from the supplied artifacts.

**Required action**
Supply authentic assertion-level RED evidence captured before implementation and matching-command GREEN evidence for the authoritative durable intake path; do not use setup or provenance failures as RED.

**Evidence**

- artifact: `TDD-proof/provenance:none-supplied`
- artifact: `plans/checkpoints/calm-crag-4037.checkpoint.md`
- artifact: `plans/checkpoints/warm-mist-6808.evidence.md`

## Context

- Original task: `calm-crag-4037`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Use the concrete goals and findings above to repair the untrustworthy task outcome. Make the minimum implementation and test changes needed, and verify the repaired behavior.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-08-23_calm-crag-4037_red-green-preserve-one-event-intake-and-safe-uncertain.md` for full context. Focus only on the unmet goals listed above.

## Recent learnings from previous attempt

### calm-crag-4037-bind-red-green-to-authoritative-durable-command.md

```
---
title: "Bind acceptance TDD to the authoritative durable command"
date: 2026-08-23
category: tooling
component: ci-cd
tags: [tdd, acceptance, cross-repository, provenance, durable-state]
file_type: rules
---

# Bind acceptance TDD to the authoritative durable command

When an acceptance repair spans a local consumer and an external durable owner, the RED/GREEN command must exercise the owner-backed durable path rather than only mocked unit behavior. For Deliberation, `pnpm test:deliberation:km-integration` is the command that can prove both distinct SQLite records and restart-safe delivery
```

## Implementation session log excerpt (last 50 lines)

```
ing saved to learnings/tooling/calm-crag-4037-bind-red-green-to-authoritative-durable-command.md
[0m
Blocked by the plan’s mandatory owner-contract gate.

- `OPENCLAW_DELIBERATION_KM_ROOT` is unset.
- Access to `/Users/michal/Projects/km-system` was denied by external-directory policy.
- Local provenance records a semantic/hash mismatch.
- Parent evidence contains no genuine RED to reuse.
- No production or test files were edited.
- No RED proof was fabricated from a setup failure.
- Resume state is recorded in `plans/checkpoints/calm-crag-4037.checkpoint.md`.
- Learning saved to `learnings/tooling/calm-crag-4037-bind-red-green-to-authoritative-durable-command.md`.

Required to continue: grant read access to an owner-approved converged KM checkout and set `OPENCLAW_DELIBERATION_KM_ROOT`.

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
