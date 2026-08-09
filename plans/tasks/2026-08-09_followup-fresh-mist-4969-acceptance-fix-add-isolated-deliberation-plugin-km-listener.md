# [acceptance-fix] [acceptance-fix] Add isolated Deliberation plugin → KM listener → spool integration harness: goal-008: Existing Delibera: goal-001: [acceptance-fix] Add isolated Deliberation plugin → KM listener → spoo

Auto-created by the monitor because the original task `bold-reef-5266` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-001: [acceptance-fix] Add isolated Deliberation plugin → KM listener → spool integration harness: goal-008: Existing Delibera

### [BLOCKING] finding-001 - verification_evidence_missing / evidence

**Scope:** `goal-001`  
**Claim:** Canonical caller-owned evidence is required that the existing Deliberation TypeScript tests and focused KM listener/wire/spool tests remain green.

**Observed**
The caller-supplied Test Gate status is not run with no Test Gate evidence. The task evidence explicitly identifies its fresh commands as local implementation-agent runs, and the Deliberation aggregate local command exited 1 with 103 passed and 2 failed.

**Why this matters**
Goal 001 is an explicit test-artifact goal whose assessment is restricted to supplied artifacts and the canonical Test Gate reference. Local or historical prose cannot establish the required caller-owned passing result, and the supplied local aggregate result is not green.

**Required action**
Provide an inspectable caller-owned Test Gate tied to bold-reef-5266 that records exact commands and passing outcomes for both the existing Deliberation TypeScript suite and the focused KM listener/wire/spool suite.

**Evidence**

- test-gate: `caller-supplied status: not run; no Test Gate evidence exists`
- artifact: `plans/checkpoints/bold-reef-5266.evidence.md`
- artifact: `plans/checkpoints/bold-reef-5266.checkpoint.md`

## Context

- Original task: `bold-reef-5266`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Treat this as an evidence-only follow-up. Production-code changes are forbidden by default. You must inspect the parent implementation and evidence first, then supply only the missing acceptance evidence. Escalate only if that inspection lets you document a real implementation defect; in that case, make only the minimal fix with tests.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-08-09_bold-reef-5266_add-isolated-deliberation-plugin-km-listener-spool.md` for full context. Focus only on the unmet goals listed above.

## Recent learnings from previous attempt

### bold-reef-5266-preserve-aggregate-exit-status.md

```
---
title: "Preserve Aggregate Exit Status in Acceptance Evidence"
date: 2026-08-09
category: tooling
component: ci-cd
tags: [acceptance, test-gate, evidence, provenance]
file_type: rules
---

# Preserve Aggregate Exit Status in Acceptance Evidence

A focused sub-suite can pass while the acceptance command that owns the goal still exits nonzero. Record both facts separately: the exact passing selection and the aggregate command's exit code, failed test names, and counts.

For evidence-only follow-ups, pre-existing or unrelated failures may explain why no implementation fix is appropriate, but
```

## Implementation session log excerpt (last 50 lines)

```
mp/bold-reef-5266-fresh-gate-learning.md --output learnings/tooling/bold-reef-5266-preserve-aggregate-exit-status.md
✓ Learning saved to learnings/tooling/bold-reef-5266-preserve-aggregate-exit-status.md
[0m
[0m% [0mPatch 1 file
Evidence-only follow-up recorded in `plans/checkpoints/bold-reef-5266.evidence.md`.

- KM listener/wire/spool: 90/90 passed.
- Integration harness: 4/4 passed.
- Deliberation suite: 103/105 passed; same two pre-existing reservation-schema failures.
- Typecheck and build passed.
- Extension lint remains blocked by the unrelated Slack boundary export error.
- No production or test files changed.
- Required learning saved.

The caller-owned canonical Test Gate run ID/manifest was not supplied, so finding-001 remains externally blocked despite fresh local evidence.

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.

## Plan

`plans/2026-08-09_fresh-mist-4969_acceptance-fix-add-isolated-deliberation-plugin-km-listener.md`
