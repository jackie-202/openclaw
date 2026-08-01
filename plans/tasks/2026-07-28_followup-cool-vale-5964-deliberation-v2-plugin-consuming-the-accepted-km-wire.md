# [acceptance-fix] Deliberation v2 plugin consuming the accepted KM wire: goal-001: Deliberation v2 plugin consuming the accepted KM wire

Auto-created by the monitor because the original task `dark-crag-0344` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-001: Deliberation v2 plugin consuming the accepted KM wire

### [BLOCKING] finding-001 - required_implementation_missing / correctness

**Scope:** `goal-001`  
**Claim:** The required Deliberation v2 plugin and its accepted KM contract integration were not delivered.

**Observed**
The supplied checkpoint states that no extensions/deliberation tree exists and that implementation stopped at the prerequisite contract gate; all implementation and acceptance behaviors remain incomplete.

**Why this matters**
Goal goal-001 requires a loadable plugin with four hooks, one worker, strict configuration, KM intake and reconciliation, a sole durable-send adapter, controls, documentation, and registration surfaces. The supplied material explicitly confirms that none of this production implementation was created.

**Required action**
Provide the accepted repository-local KM wire/control fixtures, then implement the complete Deliberation v2 plugin and required repository integration surfaces against that contract.

**Evidence**

- artifact: `plans/checkpoints/dark-crag-0344.checkpoint.md`
- plan: `plans/2026-07-28_dark-crag-0344_deliberation-v2-plugin-consuming-the-accepted-km-wire.md`
- file: `plans/tasks/2026-07-27_deliberation-v2-plugin-consume-accepted-km-wire.md`

### [BLOCKING] finding-002 - required_tdd_proof_missing / evidence

**Scope:** `goal-001`  
**Claim:** The caller-required TDD RED/GREEN proof is invalid because no TDD cycle was executed.

**Observed**
The supplied proof says TDD was not started, contains no assertion-level RED output, and says GREEN was not run.

**Why this matters**
The run manifest declares tddRequired true and the canonical task requires helper-captured assertion-level RED followed by GREEN. A blocker narrative with RED/GREEN headings does not establish the required TDD cycle.

**Required action**
After the accepted contract prerequisite is available, execute the prescribed behavioral RED and GREEN cycles through the TDD proof helper and record genuine command and assertion evidence in the task proof artifact.

**Evidence**

- artifact: `plans/checkpoints/dark-crag-0344.red-green-proof.md`
- artifact: `caller-supplied:TDD-proof/provenance`
- file: `plans/tasks/2026-07-27_deliberation-v2-plugin-consume-accepted-km-wire.md`

## Context

- Original task: `dark-crag-0344`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Use the concrete goals and findings above to repair the untrustworthy task outcome. Make the minimum implementation and test changes needed, and verify the repaired behavior.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-07-28_dark-crag-0344_deliberation-v2-plugin-consuming-the-accepted-km-wire.md` for full context. Focus only on the unmet goals listed above.

## Recent learnings from previous attempt

### dark-crag-0344-external-contract-gates-precede-behavioral-tdd.md

```
---
title: "External contract gates precede behavioral TDD"
date: 2026-07-28
category: architecture
component: general
tags: [openclaw, plugins, external-authority, tdd, contracts]
file_type: rules
---

# External contract gates precede behavioral TDD

For a plugin whose behavior is owned by an external authority, verify that the
accepted wire fixtures actually exist in the repository before creating even an
inert scaffold. A plan may prescribe the later RED test while separately making
the fixture bundle a prerequisite; the prerequisite controls execution order.

If versioned schemas, provena
```

## Implementation session log excerpt (last 50 lines)

```
d.md
[0m
Implementation is blocked by the plan’s prerequisite gate.

Missing repository-local accepted artifacts:

- Versioned KM wire fixtures with provenance/hash manifest
- Authentication, endpoint, and header policy
- Intake/list/reserve/complete/reconcile schemas
- Pagination, lease, and CAS semantics
- Final-delivery and `NOT_SENT` reconciliation fixtures
- Persisted cutover and synthetic-control contracts

Recorded the blocker in:

- `plans/checkpoints/dark-crag-0344.checkpoint.md`
- `plans/checkpoints/dark-crag-0344.red-green-proof.md`

No production code, fabricated TDD evidence, tests, build, or autoreview were run. `git diff --check` passed for the checkpoint artifacts. Learning saved to `learnings/architecture/dark-crag-0344-external-contract-gates-precede-behavioral-tdd.md`.

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
