# [acceptance-fix] Converge Deliberation contract provenance and rollout readiness: goal-002: The manifest is accepted by the repository-local validator and no long

Auto-created by the monitor because the original task `fresh-brook-6923` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-002: The manifest is accepted by the repository-local validator and no longer reports `invalid provenance manifest`.
- goal-003: Every pinned file hash matches its current repository file.
- goal-004: The final note distinguishes semantic evidence from hash evidence and records the exact accepted owner pin.

### [BLOCKING] finding-001 - required_implementation_missing / correctness

**Scope:** `goal-002`  
**Claim:** The required accepted provenance manifest was not delivered.

**Observed**
The supplied blocked checkpoint states that provenance.json remains unresolved and that km-listener.cross-repo.ts cannot accept it because ownerPin lacks an exact KM owner revision and a non-empty ownerFiles map.

**Why this matters**
Goal-002 requires repository-local validator acceptance without invalid provenance manifest; retaining ownerPin.status follow-up-required cannot satisfy that validator contract.

**Required action**
Provide the immutable owner revision and complete ownerFiles path-to-SHA-256 map, then update and validate the manifest with the exact accepted owner pin.

**Evidence**
- artifact: `plans/checkpoints/fresh-brook-6923.blocked.md:3-16`
- plan: `plans/2026-08-17_fresh-brook-6923_converge-deliberation-contract-provenance-and-rollout.md:45-51`

### [BLOCKING] finding-002 - required_implementation_missing / correctness

**Scope:** `goal-003`  
**Claim:** The provenance manifest was not reconciled after a pinned contract file changed.

**Observed**
The task-scoped diff changes extensions/deliberation/contracts/cutover-controls-v1.json, while the supplied blocker states that provenance.json remains unchanged and the task material identifies it as pinning the supplied hash for that file.

**Why this matters**
A changed file has different content from the version represented by an unchanged SHA-256 pin, so the unchanged manifest cannot establish that every pin matches the current repository file.

**Required action**
Reconcile the manifest only with authoritative provenance evidence, or restore an approved state in which every pinned contract file matches its recorded SHA-256.

**Evidence**
- file: `extensions/deliberation/contracts/cutover-controls-v1.json:task-scoped-diff`
- artifact: `plans/checkpoints/fresh-brook-6923.blocked.md:13-16`
- plan: `plans/2026-08-17_fresh-brook-6923_converge-deliberation-contract-provenance-and-rollout.md:20-22`

### [BLOCKING] finding-003 - required_artifact_missing / correctness

**Scope:** `goal-004`  
**Claim:** The required final note with the exact accepted owner pin was not delivered.

**Observed**
The supplied task artifacts include fresh-brook-6923.blocked.md and checkpoint.md but no fresh-brook-6923.final-note.md; the blocker confirms the exact owner revision and ownerFiles map remain unavailable.

**Why this matters**
Goal-004 explicitly requires a final note that distinguishes semantic and hash evidence and records the exact accepted owner pin; a blocked note cannot record an unavailable accepted pin.

**Required action**
After receiving the immutable owner bundle and accepting the manifest, add the final note with the exact owner pin and separate semantic, hash, and rollout evidence.

**Evidence**
- artifact: `plans/checkpoints/fresh-brook-6923.blocked.md:3-16`
- artifact: `plans/checkpoints/fresh-brook-6923.checkpoint.md:7-9`
- plan: `plans/2026-08-17_fresh-brook-6923_converge-deliberation-contract-provenance-and-rollout.md:55-56`


## Context

- Original task: `fresh-brook-6923`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Use the concrete goals and findings above to repair the untrustworthy task outcome. Make the minimum implementation and test changes needed, and verify the repaired behavior.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-08-17_fresh-brook-6923_converge-deliberation-contract-provenance-and-rollout.md` for full context. Focus only on the unmet goals listed above.

## Previous attempt: acceptance context


**Already done (do NOT redo):**
- goal-001: Repository-local provenance/contract tests pass.
- goal-005: Focused Deliberation tests pass without real network/provider/transport calls.
- goal-006: A concise rollout note states that a full gateway restart—not a plugin-only reload—is the remaining deployment step.

## Recent learnings from previous attempt


### fresh-brook-6923-preserve-test-lock-ownership.md

```
---
title: "Preserve Test Lock Ownership During Contract-Gate Closeout"
date: 2026-08-17
category: tooling
component: ci-cd
tags: [testing, vitest, contract-gate, provenance]
file_type: rules
---

# Preserve Test Lock Ownership During Contract-Gate Closeout

When a focused OpenClaw test waits on the local heavy-check lock, do not bypass
the lock with a concurrent Vitest invocation or terminate the owning process.
Record that the test did not start, including the exact command and timeout,
then preserve the fail-closed contract decision. A test-lock timeout is not
semantic or provenance evidenc
```

## Implementation session log excerpt (last 50 lines)

```
so `extensions/deliberation/contracts/provenance.json` remains unresolved.

- Recorded blocker: `plans/checkpoints/fresh-brook-6923.blocked.md`
- Updated task checkpoint: `plans/checkpoints/fresh-brook-6923.checkpoint.md`
- Confirmed local consumer requires `ownerFiles`: `extensions/deliberation/scripts/km-listener.cross-repo.ts:60`
- Semantic mirror evidence is distinct from local hash integrity; neither supplies owner provenance.
- Focused test command waited on an existing test lock for 120 seconds and did not start; no concurrent test was run.
- Saved learning: `learnings/tooling/fresh-brook-6923-preserve-test-lock-ownership.md`

After an immutable owner pin is supplied and validation passes, Jackie must perform a full gateway restart, not a plugin-only reload, followed by live smoke.

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
