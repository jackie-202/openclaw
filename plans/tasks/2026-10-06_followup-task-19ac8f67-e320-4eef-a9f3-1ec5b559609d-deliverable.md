# [acceptance-fix] Deliverable: goal-001: Deliverable

Auto-created by the monitor because the original task `task-9585a131-9645-4da4-8cf4-739de464bf18` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-001: Deliverable

### [BLOCKING] finding-001 - required_implementation_missing / correctness

**Scope:** `goal-001`  
**Claim:** Replace retired Deliberation loader/config/wire coupling in the retained Discord and Slack owner-path tests with a minimal generic exclusive-owner fixture while preserving host behavior coverage.

**Observed**
The task-scoped implementation diff changes only one Discord policy expectation from ownerPluginId deliberation to host-test-owner; it adds no generic owner fixture and makes no planned adaptations to the Discord process or Slack owner-path tests. The supplied checkpoint marks fixture replacement unfinished.

**Why this matters**
Renaming the expected owner does not provide the required generic registered owner or decouple the retained suites from the retired plugin loader/config/wire assumptions, so the central deliverable is absent.

**Required action**
Implement the bounded generic host-owner fixture adaptation across the three named retained test surfaces while preserving the required host-path assertions and avoiding production behavior changes.

**Evidence**

- file: `extensions/discord/src/monitor/message-handler.deliberation.test.ts:185`
- artifact: `plans/checkpoints/task-9585a131-9645-4da4-8cf4-739de464bf18.checkpoint.md:7-10`
- plan: `plans/2026-10-06_task-9585a131-9645-4da4-8cf4-739de464bf18_deliverable.md:Implementation`

### [BLOCKING] finding-002 - verification_evidence_missing / evidence

**Scope:** `goal-001`  
**Claim:** Record exact characterization, focused before/after commands and outcomes, assertion mapping, and source-only proof in plans/checkpoints/deliberation_generic_host_fixture_cleanup.md.

**Observed**
No required deliberation_generic_host_fixture_cleanup.md artifact is supplied, and the task checkpoint marks focused/broader verification and evidence mapping unfinished.

**Why this matters**
The canonical task makes this checkpoint and its exact command/result and assertion-mapping contents explicit verification evidence for the deliverable; the supplied materials contain only an incomplete RED proof and a progress checkpoint.

**Required action**
Provide the required cleanup checkpoint with the specified characterization-to-final assertion mapping, exact permitted verification commands and outcomes, blockers where applicable, and explicit source-suite-only scope, relying on canonical Test Gate evidence for test interpretation.

**Evidence**

- artifact: `plans/checkpoints/task-9585a131-9645-4da4-8cf4-739de464bf18.checkpoint.md:7-10`
- plan: `plans/tasks/2026-10-05_deliberation-generic-host-fixture-cleanup.md:Verification and evidence`

### [BLOCKING] finding-003 - required_tdd_proof_missing / evidence

**Scope:** `goal-001`  
**Claim:** Provide valid RED-then-GREEN TDD proof because the run manifest declares TDD required.

**Observed**
The supplied TDD projection and proof artifact contain only a RED phase and explicitly report that the GREEN phase and phase order are incomplete.

**Why this matters**
With tddRequired true, a RED-only capture cannot demonstrate the mandatory completed RED/GREEN cycle.

**Required action**
Complete and supply valid ordered RED/GREEN proof for the scoped implementation using the caller-owned TDD evidence workflow.

**Evidence**

- artifact: `plans/checkpoints/task-9585a131-9645-4da4-8cf4-739de464bf18.red-green-proof.md:7-11`
- artifact: `TDD proof/provenance:missing GREEN Phase`
- file: `plans/checkpoints/acceptance-runs/task-9585a131-9645-4da4-8cf4-739de464bf18-acceptance-001/manifest.json:39-40`

## Context

- Original task: `task-9585a131-9645-4da4-8cf4-739de464bf18`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Use the concrete goals and findings above to repair the untrustworthy task outcome. Make the minimum implementation and test changes needed, and verify the repaired behavior.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-10-06_task-9585a131-9645-4da4-8cf4-739de464bf18_deliverable.md` for full context. Focus only on the unmet goals listed above.

## Recent learnings from previous attempt

### 2026-10-06_generic-host-tests-and-retired-plugin-discovery.md

```
---
title: "Generic host tests must not depend on retired plugin discovery"
date: 2026-10-06
category: architecture
component: general
tags: [plugin-retirement, host-tests, exclusive-ownership]
---

Native adapter tests should inject an opaque exclusive owner through the generic hook test seam and continue exercising the real Discord/Slack handlers. A test that loads a retired bundled plugin can fail before reaching the host behavior it was meant to protect; an assertion expecting a synthetic owner first exposes that coupling. Keep producer-owned config and wire serialization assertions at the
```

## Implementation session log excerpt (last 50 lines)

```
-tests-and-retired-plugin-discovery.md
[0m
**The implementation is incomplete.** I read the authoritative plan and its cited evidence, loaded the TDD skill, and captured accepted RED proof at `plans/checkpoints/task-9585a131-9645-4da4-8cf4-739de464bf18.red-green-proof.md`. The focused Discord run failed as expected: retired-plugin discovery produced ordinary routing instead of the expected exclusive synthetic owner.

I did not complete the generic fixture adaptation, capture GREEN, or run broader verification. The only test edit so far changes that owner expectation; the three loader/config/wire-coupled test surfaces still need the planned cleanup. The checkpoint records this partial progress, and I saved a learning about keeping native host tests independent of retired plugin discovery.

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
