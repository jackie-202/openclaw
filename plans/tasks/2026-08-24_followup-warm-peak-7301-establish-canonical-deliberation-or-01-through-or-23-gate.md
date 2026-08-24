# [acceptance-fix] Establish canonical Deliberation OR-01 through OR-23 gate: goal-001: Establish canonical Deliberation OR-01 through OR-23 gate

Auto-created by the monitor because the original task `bright-fork-2292` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-001: Establish canonical Deliberation OR-01 through OR-23 gate

### [BLOCKING] finding-001 - required_artifact_missing / correctness

**Scope:** `goal-001`  
**Claim:** The required complete canonical OR-01 through OR-23 result artifact is absent.

**Observed**
The supplied task checkpoint states that the canonical full-gate command failed clean-checkout preflight and that no 23-row artifact was manufactured; rollout readiness likewise says no validated 23-row canonical artifact exists.

**Why this matters**
The task contract makes a complete immutable 23-row artifact an explicit deliverable and requires the canonical command to finish with 23/23 named leaves Green. Focused checks and a deliberately absent artifact do not satisfy that deliverable.

**Required action**
Produce plans/checkpoints/bright-fork-2292.full-gate.json from one successful canonical run with exactly ordered, unique OR-01 through OR-23 Green rows and the required immutable evidence.

**Evidence**

- artifact: `plans/checkpoints/bright-fork-2292.checkpoint.md`
- artifact: `plans/checkpoints/fresh-peak-7129.rollout-readiness.md`
- file: `plans/tasks/2026-08-23_establish-canonical-deliberation-or-01-through-or-23-gate.md`

### [BLOCKING] finding-002 - verification_evidence_missing / evidence

**Scope:** `goal-001`  
**Claim:** The explicitly required canonical completion note and its successful gate evidence are absent.

**Observed**
The supplied checkpoint says no final note was manufactured after the canonical command stopped at dirty-checkout preflight. The supplied readiness document remains unknown and points to a different historical quick-brook artifact rather than validated bright-fork evidence.

**Why this matters**
The task explicitly requires a final note containing the canonical command, revisions, accepted hashes, all 23 results, negative fail-closed characterization, and build/package/provenance and focused results. The supplied focused-check summary is not that required canonical validation report.

**Required action**
After a successful canonical run, produce plans/checkpoints/bright-fork-2292.final-note.md with every completion-evidence field required by the task and update readiness to consume only the validated bright-fork artifact.

**Evidence**

- artifact: `plans/checkpoints/bright-fork-2292.checkpoint.md`
- artifact: `plans/checkpoints/fresh-peak-7129.rollout-readiness.md`
- file: `plans/tasks/2026-08-23_establish-canonical-deliberation-or-01-through-or-23-gate.md`

### [BLOCKING] finding-003 - required_tdd_proof_missing / evidence

**Scope:** `goal-001`  
**Claim:** The caller-required TDD proof is incomplete because no GREEN phase proof is supplied.

**Observed**
The supplied bright-fork-2292.red-green-proof.md material records the exact RED command and failing output, but includes no GREEN phase command, exit status, or passing output. The checkpoint summarizes later focused results without supplying the required RED/GREEN proof record.

**Why this matters**
The manifest declares tddRequired true and the plan requires preserved exact RED and GREEN commands and outcomes. A RED-only capture plus a narrative checkpoint is not a complete mandatory TDD proof.

**Required action**
Complete the TDD proof artifact with attributable GREEN-phase metadata, the exact matching test command, exit status, and passing outcome after the implementation change.

**Evidence**

- artifact: `plans/checkpoints/bright-fork-2292.red-green-proof.md`
- artifact: `plans/checkpoints/bright-fork-2292.checkpoint.md`
- plan: `plans/2026-08-24_bright-fork-2292_establish-canonical-deliberation-or-01-through-or-23-gate.md`
- artifact: `acceptance-run-manifest:tddRequired=true`

## Context

- Original task: `bright-fork-2292`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Use the concrete goals and findings above to repair the untrustworthy task outcome. Make the minimum implementation and test changes needed, and verify the repaired behavior.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-08-24_bright-fork-2292_establish-canonical-deliberation-or-01-through-or-23-gate.md` for full context. Focus only on the unmet goals listed above.

## Recent learnings from previous attempt

### bright-fork-2292-finalization-evidence-snapshots.md

```
---
title: "Snapshot candidate evidence before final integrity"
date: 2026-08-24
category: tooling
component: ci-cd
tags: [acceptance-ledger, immutable-evidence, stale-evidence, clean-checkout]
file_type: rules
---

# Snapshot candidate evidence before the final integrity leaf

A multi-stage acceptance ledger must snapshot its provisional evidence before running the final integrity leaf. Reusing mutable `commands` and `leaves` arrays means appending OR-23 also mutates the candidate object, so its later digest no longer matches the 22-row candidate reconstructed by final validation.

Use copied
```

## Implementation session log excerpt (last 50 lines)

```
a8db8370a1212ff7eb3878695afbb5d0fec3721fbab326908de44b`
- Fixtures: `f26ca9afb804664cdcc03947262001d1d8441eab6d5ad9d92bb8533ae3c916b4`
- Wire: `a0e42e4fe54eedab6f9955e77f439a4e69c9614a60560ca46532ce0de9dbb528`
- Spool contracts: `47587e405d3e6b7f433eb7d450bd02969546860ff0d6822ad7bea9ff2478a0ca`

**Blocked Acceptance**
Canonical command: `pnpm test:deliberation:full-gate`

It correctly failed before execution because the shared checkout is dirty. Consequently, no synthetic 23-row artifact, final note, or Green readiness claim was created. Additionally, `pnpm tsgo:extensions:test` has unrelated existing failures in untouched Deliberation history and Discord/Slack tests. Missing, duplicate, stale, and malformed verifier cases are independently proven to exit nonzero without output artifacts.

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
