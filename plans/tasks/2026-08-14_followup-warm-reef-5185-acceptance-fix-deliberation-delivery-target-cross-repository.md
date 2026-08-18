# [acceptance-fix] [acceptance-fix] Deliberation delivery target: cross-repository integration coverage: goal-001: Deliberation delivery ta: goal-001: [acceptance-fix] Deliberation delivery target: cross-repository integr

Auto-created by the monitor because the original task `swift-reef-8917` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-001: [acceptance-fix] Deliberation delivery target: cross-repository integration coverage: goal-001: Deliberation delivery ta

### [BLOCKING] finding-001 - required_tdd_proof_missing / evidence

**Scope:** `goal-001`  
**Claim:** The mandatory TDD proof still does not demonstrate a genuine pre-implementation RED for the required default-route cross-repository scenario.

**Observed**
The supplied swift-reef proof explicitly states that no historical default-route listener RED exists. Its fresh RED shows 'defaults final delivery to source A' passing and only the override route failing with HTTP 400 SCHEMA_INVALID, so it cannot establish a failing default-route test before that behavior was implemented.

**Why this matters**
The canonical acceptance-fix task requires genuine RED and GREEN evidence for the default-route scenario in the planned integration harness. A RED for dependency drift on the override route does not satisfy that distinct caller-required TDD provenance.

**Required action**
Provide credible historical pre-implementation RED evidence for the default-route cross-repository integration scenario and link it to the corresponding GREEN evidence; do not reconstruct or relabel a post-implementation run.

**Evidence**
- file: `plans/tasks/2026-08-14_followup-swift-reef-8917-deliberation-delivery-target-cross-repository-integration-co.md`
- artifact: `plans/checkpoints/swift-reef-8917.red-green-proof.md`
- artifact: `plans/checkpoints/quick-crag-3748.red-green-proof.md`


## Context

- Original task: `swift-reef-8917`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Treat this as an evidence-only follow-up. Production-code changes are forbidden by default. You must inspect the parent implementation and evidence first, then supply only the missing acceptance evidence. Escalate only if that inspection lets you document a real implementation defect; in that case, make only the minimal fix with tests.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-08-14_swift-reef-8917_deliberation-delivery-target-cross-repository-integration.md` for full context. Focus only on the unmet goals listed above.

## Recent learnings from previous attempt


### swift-reef-8917-validate-durable-targets-before-reservation.md

```
---
title: "Validate durable delivery targets before reservation"
date: 2026-08-14
category: test-failures
component: e2e
tags: [openclaw, deliberation, km-system, durable-fencing, cross-repository]
file_type: checklist
---

# Validate durable delivery targets before reservation

Cross-repository delivery consumers must receive the effective durable target in the KM ready item, not discover it only in the reservation response.

## Failure mode

If target parsing happens after `reserve`, a malformed durable target can leave a reservation active without a valid invocation or a terminal failure p
```

## Implementation session log excerpt (last 50 lines)

```
ory default and override delivery routes now pass through ready, reservation, invocation, fake-provider delivery, completion, provenance checks, and mismatch fencing.
- Integration tests: 7/7 passed.
- Focused tests: 41/41 passed.
- Extension tests: 133/133 passed.
- Build and extension typechecks passed.
- Required RED/GREEN evidence: `plans/checkpoints/swift-reef-8917.red-green-proof.md`.
- Autoreview command: `.agents/skills/autoreview/scripts/autoreview --mode local --stream-engine-output`.
- Autoreview found no actionable issues.
- `pnpm lint:extensions` remains blocked by the unrelated pre-existing Slack `primeChannelOutboundSendMock` DTS error.
- Learning saved to `learnings/test-failures/swift-reef-8917-validate-durable-targets-before-reservation.md`.
- Checkpoint marked complete.

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
