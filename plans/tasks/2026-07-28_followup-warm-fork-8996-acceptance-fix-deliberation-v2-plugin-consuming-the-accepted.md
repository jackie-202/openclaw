# [acceptance-fix] [acceptance-fix] Deliberation v2 plugin consuming the accepted KM wire: goal-001: Deliberation v2 plugin consuming the a: goal-001: [acceptance-fix] Deliberation v2 plugin consuming the accepted KM wire

Auto-created by the monitor because the original task `cool-vale-5964` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-001: [acceptance-fix] Deliberation v2 plugin consuming the accepted KM wire: goal-001: Deliberation v2 plugin consuming the a

### [BLOCKING] finding-001 - required_implementation_missing / correctness

**Scope:** `goal-001`  
**Claim:** The required Deliberation v2 plugin and accepted KM wire integration are absent from the supplied implementation material.

**Observed**
The task-scoped diff supplies only a labeler rule for extensions/deliberation and no contract fixtures, plugin package or entry, four hook implementations, KM client, serialized worker, sole durable-send adapter, controls, documentation, or registration surfaces required by the canonical task and plan. The completion checkpoint asserts these exist but supplies no implementation content establishing them.

**Why this matters**
Goal goal-001 requires a loadable, fail-closed Deliberation v2 plugin consuming the accepted repository-local KM contract; metadata that labels hypothetical paths and a completion narrative do not deliver or demonstrate those required components.

**Required action**
Supply the accepted KM/control contract fixtures and the complete Deliberation v2 implementation and repository integration surfaces described by the canonical task.

**Evidence**

- artifact: `caller-supplied:task-scoped-diff`
- file: `plans/tasks/2026-07-28_followup-cool-vale-5964-deliberation-v2-plugin-consuming-the-accepted-km-wire.md`
- plan: `plans/2026-07-28_dark-crag-0344_deliberation-v2-plugin-consuming-the-accepted-km-wire.md`
- artifact: `plans/checkpoints/cool-vale-5964.checkpoint.md`

### [BLOCKING] finding-002 - required_tdd_proof_missing / evidence

**Scope:** `goal-001`  
**Claim:** The caller-required TDD proof is incomplete for the delivered-behavior claim.

**Observed**
The supplied proof contains one genuine RED/GREEN cycle only for initial plugin registration: four hook names and one service. The supplied plan requires each subsequent behavior group to be introduced through its own RED/GREEN cycle, but no proof is supplied for strict configuration, KM intake and reconciliation, fail-closed silence and guards, worker races and recovery, durable-send outcomes, controls, redaction, or sole-send ownership.

**Why this matters**
The manifest declares tddRequired true, and the canonical plan explicitly requires behavior-by-behavior RED/GREEN evidence after the first registration GREEN. A registration-only cycle cannot establish the mandatory TDD process for the claimed complete implementation.

**Required action**
Provide genuine helper-captured RED/GREEN cycles for the required behavior groups, preserving the supplied registration cycle as provenance and recording fresh GREEN evidence under this task.

**Evidence**

- artifact: `plans/checkpoints/cool-vale-5964.red-green-proof.md`
- artifact: `caller-supplied:TDD-proof/provenance`
- plan: `plans/2026-07-28_dark-crag-0344_deliberation-v2-plugin-consuming-the-accepted-km-wire.md`
- file: `plans/tasks/2026-07-28_followup-cool-vale-5964-deliberation-v2-plugin-consuming-the-accepted-km-wire.md`

## Context

- Original task: `cool-vale-5964`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Use the concrete goals and findings above to repair the untrustworthy task outcome. Make the minimum implementation and test changes needed, and verify the repaired behavior.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-07-28_dark-crag-0344_deliberation-v2-plugin-consuming-the-accepted-km-wire.md` for full context. Focus only on the unmet goals listed above.

## Recent learnings from previous attempt

### cool-vale-5964-canonical-delivery-recovery.md

```
---
title: "External delivery recovery must return to the canonical reserve path"
date: 2026-07-28
category: architecture
component: general
tags: [openclaw, plugins, delivery, reconciliation, cas, fail-closed]
file_type: decisions
---

# External delivery recovery must return to the canonical reserve path

When a plugin delegates durable delivery authority to an external system, reconciliation must not create a second direct-send path. A `NOT_SENT` proof should requeue the delivery, after which the normal worker performs the same control-aware CAS reservation used for first attempts and recei
```

## Implementation session log excerpt (last 50 lines)

```
mpletion, and `NOT_SENT` reconciliation
- Gateway/CLI health, cutover, synthetic, and reconciliation controls
- Generated inventory, SecretRef docs, labeler integration, and loader coverage
- Genuine RED/GREEN proof at `plans/checkpoints/cool-vale-5964.red-green-proof.md`

Verification passed:

- 25 focused plugin tests
- Loader and SecretRef documentation tests
- Extension typecheck and formatting
- Plugin inventory check
- `pnpm build`
- Final autoreview: no actionable findings

`pnpm check:changed` reached repository guards but failed on unrelated stale `extensions/acpx/npm-shrinkwrap.json` in the pre-existing dirty worktree.

Learning saved to `learnings/architecture/cool-vale-5964-canonical-delivery-recovery.md`.

Documentation: https://docs.openclaw.ai/plugins/reference/deliberation

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
