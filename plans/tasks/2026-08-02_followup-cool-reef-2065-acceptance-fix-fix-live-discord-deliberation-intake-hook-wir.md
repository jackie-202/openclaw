# [acceptance-fix] [acceptance-fix] Fix live Discord deliberation intake hook wiring: goal-004: Existing deliberation and Discord inbound t: goal-001: [acceptance-fix] Fix live Discord deliberation intake hook wiring: goa

Auto-created by the monitor because the original task `fresh-fork-4718` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-001: [acceptance-fix] Fix live Discord deliberation intake hook wiring: goal-004: Existing deliberation and Discord inbound t

### [BLOCKING] finding-001 - verification_evidence_missing / evidence

**Scope:** `goal-001`
**Claim:** The required existing Deliberation and Discord inbound tests must have canonical evidence that they remain green.

**Observed**
The caller states that Test Gate was not run and no Test Gate evidence exists. The supplied run-scoped TDD proof reports local GREEN results, but no canonical Test Gate reference establishes the explicit test-result goal.

**Why this matters**
The goal requires a test outcome, and acceptance may assess that outcome only from supplied artifacts and the canonical Test Gate reference. The canonical evidence is absent, while acceptance does not own test execution.

**Required action**
Supply canonical Test Gate evidence showing the required existing Deliberation and Discord inbound tests remain green.

**Evidence**

- test-gate: `status:not-run`
- artifact: `plans/checkpoints/fresh-fork-4718.red-green-proof.md`
- file: `manifest.json:10-20`

## Context

- Original task: `fresh-fork-4718`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Treat this as an evidence-only follow-up. Production-code changes are forbidden by default. You must inspect the parent implementation and evidence first, then supply only the missing acceptance evidence. Escalate only if that inspection lets you document a real implementation defect; in that case, make only the minimal fix with tests.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-08-02_bright-mist-1370_fix-live-discord-deliberation-intake-hook-wiring.md` for full context. Focus only on the unmet goals listed above.

## Recent learnings from previous attempt

### evidence-only-tdd-followups-preserve-historical-red.md

```
---
title: "Evidence-only TDD follow-ups preserve historical RED provenance"
date: 2026-08-02
category: tooling
component: ci-cd
tags: [acceptance, tdd, evidence, regression-tests]
file_type: rules
---

# Evidence-only TDD follow-ups must preserve historical RED provenance

When an acceptance follow-up starts after the production fix already exists, do
not force a new failure by reverting code or weakening tests. Link the original
run-scoped proof containing the genuine pre-implementation RED, then capture a
fresh GREEN with the same focused command.

For a test-result acceptance goal, also ru
```

## Implementation session log excerpt (last 50 lines)

```
-category "tooling" --component "ci-cd" --tags "acceptance,tdd,evidence,regression-tests" --file-type "rules" --content-file tmp/fresh-fork-4718-learning.md --output learnings/tooling/evidence-only-tdd-followups-preserve-historical-red.md
✓ Learning saved to learnings/tooling/evidence-only-tdd-followups-preserve-historical-red.md
[0m
Implemented the evidence-only acceptance fix with no production-code changes.

- Added `plans/checkpoints/fresh-fork-4718.red-green-proof.md` with genuine historical RED provenance and fresh GREEN evidence.
- Focused Discord suite: 105 passed.
- Goal-004 regression matrix: 353 passed.
- `pnpm build`: passed.
- Markdown lint: 0 issues.
- Checkpoint marked complete.
- Learning saved at `learnings/tooling/evidence-only-tdd-followups-preserve-historical-red.md`.

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
