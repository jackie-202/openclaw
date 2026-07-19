# [acceptance-fix] [acceptance-fix] Remove legacy channels.modelByChannel support (fork-only simplification): goal-001: Remove legacy chann: goal-001: [acceptance-fix] Remove legacy channels.modelByChannel support (fork-o

Auto-created by the monitor because the original task `bright-brook-6161` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-001: [acceptance-fix] Remove legacy channels.modelByChannel support (fork-only simplification): goal-001: Remove legacy chann

### [BLOCKING] finding-001 - verification_evidence_missing / evidence

**Scope:** `goal-001`  
**Claim:** The required complete modelByChannel source-search proof and exhaustive classification are absent from the supplied acceptance material.

**Observed**
The supplied checkpoint says the classification was completed, but no artifact contains the complete verbatim output of git grep -n modelByChannel src/ or a classification reconciling every returned line. The implementation log excerpt contains only one isolated match and a summary of other categories.

**Why this matters**
This follow-up exists specifically to provide that missing acceptance evidence. Without the complete output and line-by-line classification, semantic review cannot confirm that every remaining modelByChannel reference is an intentionally preserved upstream compatibility, maintenance, metadata, caller, or test reference rather than a forbidden fork runtime read.

**Required action**
Supply the complete verbatim git grep -n modelByChannel src/ output and classify every returned line, reconcile classification counts to the raw match count, state the upstream compatibility decision, and show that no production runtime read remains under src/auto-reply/reply/.

**Evidence**

- file: `plans/tasks/2026-07-19_followup-remove-legacy-channels-modelbychannel-support-fork-only-simp.md:Verification`
- plan: `plans/2026-07-19_bright-brook-6161_remove-legacy-channels-modelbychannel-support-fork-only.md:Implementation`
- artifact: `plans/checkpoints/bright-brook-6161.checkpoint.md`
- artifact: `implementation-session-log-excerpt`

## Context

- Original task: `bright-brook-6161`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Treat this as an evidence-only follow-up. Production-code changes are forbidden by default. You must inspect the parent implementation and evidence first, then supply only the missing acceptance evidence. Escalate only if that inspection lets you document a real implementation defect; in that case, make only the minimal fix with tests.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-07-19_bright-brook-6161_remove-legacy-channels-modelbychannel-support-fork-only.md` for full context. Focus only on the unmet goals listed above.

## Recent learnings from previous attempt

### bright-brook-6161-exhaustive-grep-acceptance-evidence.md

```
---
title: "Ukládej úplný grep důkaz pro acceptance follow-up"
date: 2026-07-19
category: tooling
component: ci-cd
tags: [acceptance, evidence, grep, upstream-compatibility]
file_type: checklist
---

# Persist exhaustive grep evidence for acceptance follow-ups

When an acceptance goal requires a final-note grep classification, a checkpoint statement such as "grep verification completed" is not evidence. Preserve the exact command output and classify every returned match, preferably by exhaustive file and line ranges.

For fork simplifications that retain upstream compatibility, compare the cur
```

## Implementation session log excerpt (last 50 lines)

```
PREPARE=1`; normal preparation was blocked by unrelated QA plugin declaration errors.
- Scoped formatting: 3 files passed.
- `git diff --check`: passed.
- Production delta in `src/channels/model-overrides.ts`: 35 additions, 83 deletions.
- `doctor --non-interactive`: reached existing config/state warnings, then timed out scanning 59,788 orphan transcripts.
- Historical RED/GREEN proof remains at `plans/checkpoints/warm-cove-7515.red-green-proof.md:5` and `plans/checkpoints/warm-cove-7515.red-green-proof.md:69`.
- Automated lineage extraction reported truncated historical command lines and unavailable outcomes at `plans/checkpoints/bright-brook-6161.evidence.md:27`; no evidence was fabricated.
- Learning saved to `learnings/tooling/bright-brook-6161-exhaustive-grep-acceptance-evidence.md`.

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
