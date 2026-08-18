# [acceptance-fix] Pin Deliberation draft continuations to the current attempt payload: goal-001: Pin Deliberation draft continuations to the current attempt payload

Auto-created by the monitor because the original task `bold-peak-0850` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-001: Pin Deliberation draft continuations to the current attempt payload

### [BLOCKING] finding-001 - required_implementation_missing / correctness

**Scope:** `goal-001`  
**Claim:** The current-attempt-pinning behavior was not delivered.

**Observed**
The supplied checkpoint states that implementation stopped at the Decision Gate and that no production code was edited; the task-scoped diff contains no draft-dispatch or embedded-runner implementation.

**Why this matters**
The goal requires a trusted runtime-owned envelope and pre-side-effect stale-attempt fencing, but the supplied material establishes that no in-repository ingress or implementation was added.

**Required action**
Deliver the authoritative draft-dispatch envelope and current-attempt execution/result fencing through a trusted in-repository ingress, or revise the task contract to resolve the absent ingress.

**Evidence**
- artifact: `plans/checkpoints/bold-peak-0850.checkpoint.md`
- artifact: `plans/checkpoints/bold-peak-0850.red-green-proof.md`
- file: `Task-scoped diff`

### [BLOCKING] finding-002 - required_tdd_proof_missing / evidence

**Scope:** `goal-001`  
**Claim:** The caller-required TDD proof is invalid.

**Observed**
The supplied TDD proof labels RED as 'TDD: skip' and GREEN as 'Not applicable'; it records only existing isolation-suite output and no regression test reproducing the required attempt-1/2/3 continuation sequence or malformed-envelope fail-closed behavior.

**Why this matters**
The manifest declares tddRequired true, while the proof does not provide a RED-to-GREEN cycle for the required behavior.

**Required action**
Provide valid RED and GREEN evidence for the required stale-attempt regression and inconsistent-envelope rejection after a trusted implementation path is available.

**Evidence**
- artifact: `plans/checkpoints/bold-peak-0850.red-green-proof.md`
- file: `manifest.json:20`


## Context

- Original task: `bold-peak-0850`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Use the concrete goals and findings above to repair the untrustworthy task outcome. Make the minimum implementation and test changes needed, and verify the repaired behavior.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-08-17_bold-peak-0850_pin-deliberation-draft-continuations-to-the-current-attempt.md` for full context. Focus only on the unmet goals listed above.

## Recent learnings from previous attempt


### 2026-08-17_deliberation-continuations-require-trusted-dispatch-ingress.md

```
---
title: "Deliberation continuations require a trusted dispatch ingress"
date: 2026-08-17
category: architecture
component: backend
tags: [deliberation, continuation, dispatch, ownership]
file_type: decisions
---

An attempt-pinning implementation cannot begin at the generic embedded-runner continuation path when the repository has no trusted caller that creates the drafting run.

For Deliberation, `index.ts` registers only source intake/suppression, outbound guards, history reads, and final delivery. Intake posts source events to KM; the KM client exposes drafting details only as an optiona
```

## Implementation session log excerpt (last 50 lines)

```
ss.md
[0m
Implementation stopped at the plan’s mandatory decision gate.

No trusted in-repo Deliberation drafting-dispatch caller exists. `extensions/deliberation/index.ts` registers intake, isolation guards, history, and final delivery only; no path supplies an authoritative attempt envelope to the embedded runner. Creating one from session/channel state would violate the plan.

Verification passed:
- `node scripts/run-vitest.mjs extensions/deliberation/src/hooks.test.ts --reporter=verbose`: 32 passed
- `pnpm test extensions/deliberation -- --reporter=verbose`: 240 passed

Recorded:
- `plans/checkpoints/bold-peak-0850.checkpoint.md`
- `plans/checkpoints/bold-peak-0850.red-green-proof.md`
- `learnings/architecture/2026-08-17_deliberation-continuations-require-trusted-dispatch-ingress.md`

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
