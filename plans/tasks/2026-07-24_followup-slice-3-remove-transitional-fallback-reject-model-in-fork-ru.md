# [acceptance-fix] Slice 3: Remove transitional fallback, reject `model` in fork runtime profile: goal-001: Slice 3: Remove transitional fallback, reject `model` in fork runtime 

Auto-created by the monitor because the original task `dark-dune-1632` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-001: Slice 3: Remove transitional fallback, reject `model` in fork runtime profile

### [BLOCKING] finding-001 - verification_evidence_missing / evidence

**Scope:** `goal-001`  
**Claim:** The required canonical repository verification gate has no acceptance evidence.

**Observed**
The canonical Test Gate reference is explicitly not run and contains no Test Gate evidence, while the task requires the repository canonical test/build gate after focused verification.

**Why this matters**
Focused RED/GREEN proof satisfies the caller-owned TDD requirement but cannot substitute for the separately required canonical gate evidence.

**Required action**
Provide the canonical Test Gate result covering the repository test/build gate through the caller-owned Test Gate workflow.

**Evidence**
- test-gate: `canonical:not-run`
- plan: `plans/2026-07-24_dark-dune-1632_slice-3-remove-transitional-fallback-reject-model-in-fork.md:Verification`

### [BLOCKING] finding-002 - required_artifact_missing / correctness

**Scope:** `goal-001`  
**Claim:** The required final task note was not supplied.

**Observed**
The task contract requires a final note recording dispositions for fork commits 9c09c25952, 435059f7d6, and 0529559822 and a brief before/after upstream/main diff-stat comparison; the supplied artifacts include a plan, checkpoint, TDD proof, and learning, but no final task note containing those results.

**Why this matters**
Those recorded dispositions and the measured affected-surface comparison are explicit task deliverables, not optional verification prose, and the plan's proposed table does not establish the final implementation disposition or after-state measurement.

**Required action**
Provide the final task note with the three commit dispositions and the actual before/after affected-surface diff-stat comparison.

**Evidence**
- file: `plans/tasks/2026-07-24_slice-3-remove-transitional-fallback-reject-model-in-fork-ru.md:Requirements`
- plan: `plans/2026-07-24_dark-dune-1632_slice-3-remove-transitional-fallback-reject-model-in-fork.md:Implementation`


## Context

- Original task: `dark-dune-1632`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Use the concrete goals and findings above to repair the untrustworthy task outcome. Make the minimum implementation and test changes needed, and verify the repaired behavior.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-07-24_dark-dune-1632_slice-3-remove-transitional-fallback-reject-model-in-fork.md` for full context. Focus only on the unmet goals listed above.

## Recent learnings from previous attempt


### dark-dune-1632-model-free-runtime-profile-boundary.md

```
---
title: "Retired config keys need separate type and validation boundaries"
date: 2026-07-24
category: architecture
component: shared
tags: [configuration, zod, runtimeByChannel, modelByChannel, migration]
file_type: rules
---

# Reject retired config keys without retaining them in TypeScript types

When a strict Zod object must reject one retired key with a migration-specific message, removing the key from the object shape produces only a generic `Unrecognized key` issue. Keeping it as an accepted `z.unknown()` field plus refinement also makes the accepted schema look broader than the runti
```

## Implementation session log excerpt (last 50 lines)

```
were blocked before provisioning because the Crabbox binary failed version/help sanity checks on both Testbox and brokered fallback.

**Fork Delta**
- Before: 10 affected files, 13,585 insertions / 4,887 deletions versus `upstream/main`.
- After: 11 files, 13,560 insertions / 4,950 deletions. The additional file is the discovered pricing-cache model-authority surface; overall net fork delta decreased by 88 lines.

**Commit Disposition**
- `9c09c25952`: retained narrowly for profile matching and non-model persistence; model ownership replaced by `modelByChannel`.
- `435059f7d6`: runtime-profile model authority replaced; supplemental resolver and unrelated behavior retained.
- `0529559822`: retained narrowly; stale automatic-fallback pins remain validated against canonical `modelByChannel`.

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
