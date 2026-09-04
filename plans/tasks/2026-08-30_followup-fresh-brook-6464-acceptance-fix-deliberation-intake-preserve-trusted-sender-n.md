# [acceptance-fix] [acceptance-fix] Deliberation intake: preserve trusted sender names for People Intel identity resolution: goal-004: Exis: goal-001: [acceptance-fix] Deliberation intake: preserve trusted sender names fo

Auto-created by the monitor because the original task `wild-dune-0272` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-001: [acceptance-fix] Deliberation intake: preserve trusted sender names for People Intel identity resolution: goal-004: Exis

### [BLOCKING] finding-001 - implemented_behavior_incorrect / correctness

**Scope:** `goal-001`  
**Claim:** The acceptance repair must preserve existing source-target, idempotency, replay, and delivery-routing behavior.

**Observed**
The supplied task-scoped diff rewrites the Deliberation README's omitted-target Discord root behavior from source_anchor thread creation/reuse to mode root without threadId. This is a delivery-routing contract change, despite the supplied final note claiming the unrelated root-routing wording was removed.

**Why this matters**
Changing source-default Discord root delivery from source_anchor to root materially conflicts with the evaluated unchanged-routing goal. No concurrent context assignment was supplied that could attribute or exclude this changed path.

**Required action**
Remove the routing-semantic rewrite from the evaluated task changes or supply task-scoped material that preserves the pre-task source-anchor/source-thread delivery contract.

**Evidence**

- file: `extensions/deliberation/README.md`
- artifact: `plans/checkpoints/wild-dune-0272.final-note.md`

## Context

- Original task: `wild-dune-0272`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Use the concrete goals and findings above to repair the untrustworthy task outcome. Make the minimum implementation and test changes needed, and verify the repaired behavior.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-08-31_wild-dune-0272_deliberation-intake-preserve-trusted-sender-names-for.md` for full context. Focus only on the unmet goals listed above.

## Recent learnings from previous attempt

### wild-dune-0272-bind-acceptance-evidence-to-task-candidate.md

```
---
title: "Bind acceptance evidence to the actual task candidate"
date: 2026-08-31
category: tooling
component: ci-cd
tags: [acceptance, test-gate, provenance, dirty-worktree, plugin-sdk]
file_type: checklist
---

# Attribute shared-worktree hunks before acceptance repair

When an acceptance monitor receives a broad dirty-worktree diff, it can attribute older behavior changes to a later task. A passing rerun does not repair that provenance failure.

Before changing code, identify prior ownership from dated plans, proofs, and final notes. Snapshot hashes for the disputed files before and after
```

## Implementation session log excerpt (last 50 lines)

```
to-task-candidate.md
✓ Learning saved to learnings/tooling/wild-dune-0272-bind-acceptance-evidence-to-task-candidate.md
[0m
Implemented acceptance repair for `wild-dune-0272`.

- Restored pre-task source-anchor/source-thread routing documentation.
- Added exact Discord/Slack sender-field and KM contract final note.
- Added task-scoped Test Gate and RED/GREEN evidence with candidate digest.
- Passed 29 channel/mapper tests, 146 intake/contract tests, and 79 routing/replay tests.
- Passed build, tsgo, oxlint, oxfmt, MDX validation, and provenance hashes.
- Final autoreview: clean.
- Saved required learning.

Evidence: `plans/checkpoints/wild-dune-0272.test-gate.md`
Final note: `plans/checkpoints/wild-dune-0272.final-note.md`
Docs: https://docs.openclaw.ai/plugins/reference/deliberation

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
