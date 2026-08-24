# [acceptance-fix] Establish caller-owned Deliberation OR-01 through OR-23 full gate: goal-001: Establish caller-owned Deliberation OR-01 through OR-23 full gate

Auto-created by the monitor because the original task `quick-brook-1900` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-001: Establish caller-owned Deliberation OR-01 through OR-23 full gate

### [BLOCKING] finding-001 - required_implementation_missing / correctness

**Scope:** `goal-001`  
**Claim:** The canonical full gate does not implement the required executable OR-07 through OR-21 leaves.

**Observed**
The supplied checkpoint marks the step to expose OR-07 through OR-21 as incomplete and states those scenarios cannot be honestly exposed; the final note confirms no behavioral leaves ran and no 23-row result is claimed.

**Why this matters**
Goal-001 requires one caller-owned command with real executable OR-01 through OR-23 leaves exactly once. Missing fifteen owner-runtime leaves means the delivered gate plumbing cannot establish the required full gate.

**Required action**
Implement OR-07 through OR-21 as exact executable owner-boundary selectors and compose them with OR-01 through OR-23 in the canonical fail-closed command without synthetic rows.

**Evidence**

- artifact: `plans/checkpoints/quick-brook-1900.checkpoint.md`
- artifact: `plans/checkpoints/quick-brook-1900.final-note.md`
- file: `plans/tasks/2026-08-23_establish-caller-owned-deliberation-or-01-through-or-23-full.md`

### [BLOCKING] finding-002 - verification_evidence_missing / evidence

**Scope:** `goal-001`  
**Claim:** The required canonical 23/23 Green ledger and completion evidence are absent.

**Observed**
The supplied final note says the canonical command stopped at dirty-checkout preflight, executed no behavioral leaves, and did not create plans/checkpoints/quick-brook-1900.full-gate.json; Test Gate status is not run.

**Why this matters**
The task explicitly requires a zero-exit canonical run with 23/23 named leaves Green, a complete 23-row result artifact, exact clean revisions and hashes, negative fail-closed evidence, and elapsed output. The negative TDD characterization alone does not establish the full gate result.

**Required action**
From an authorized clean workspace with verified immutable KM authority, run the canonical gate and preserve its validated 23-row Green ledger plus the specified completion evidence; do not reconstruct or synthesize rows.

**Evidence**

- artifact: `plans/checkpoints/quick-brook-1900.final-note.md`
- artifact: `plans/checkpoints/fresh-peak-7129.rollout-readiness.md`
- test-gate: `status:not-run`
- file: `plans/tasks/2026-08-23_establish-caller-owned-deliberation-or-01-through-or-23-full.md`

## Context

- Original task: `quick-brook-1900`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Use the concrete goals and findings above to repair the untrustworthy task outcome. Make the minimum implementation and test changes needed, and verify the repaired behavior.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-08-23_quick-brook-1900_establish-caller-owned-deliberation-or-01-through-or-23.md` for full context. Focus only on the unmet goals listed above.

## Recent learnings from previous attempt

### quick-brook-1900-fail-closed-named-leaf-gates.md

```
---
title: "Canonical evidence gates must stop before inventing leaves"
date: 2026-08-23
category: tooling
component: ci-cd
tags: [acceptance, evidence, provenance, fail-closed, deliberation]
file_type: rules
---

# Canonical evidence gates must stop before inventing leaves

An aggregate integration suite cannot be relabeled into a named acceptance matrix. A canonical gate should extract exact reporter selectors from the owning tests, bind them to one current run and immutable authority, and reject missing or duplicate selectors. Reporter totals and historical Green output are supporting conte
```

## Implementation session log excerpt (last 50 lines)

```
unting with canonical-artifact-only status.
- TDD proof contains both RED and GREEN: `plans/checkpoints/quick-brook-1900.red-green-proof.md`
- Focused tests: 14 passed, 1 conditional OR-23 skipped.
- `pnpm build`: passed.
- Scoped Oxlint and `git diff --check`: passed.
- Saved learning: `learnings/tooling/quick-brook-1900-fail-closed-named-leaf-gates.md`

Canonical execution fails closed because the checkout is dirty. Additionally, `extensions/deliberation/contracts/provenance.json` remains stale, and `OR-07` through `OR-21` do not exist as executable selectors. External KM source access was denied, so those leaves were not fabricated.

No `quick-brook-1900.full-gate.json` was created and no 23/23 readiness claim was made. Details are in `plans/checkpoints/quick-brook-1900.final-note.md`.

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
