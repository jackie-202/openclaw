# [acceptance-fix] [acceptance-fix] Deliverable: goal-001: Deliverable: goal-001: [acceptance-fix] Deliverable: goal-001: Deliverable

Auto-created by the monitor because the original task `task-19ac8f67-e320-4eef-a9f3-1ec5b559609d` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-001: [acceptance-fix] Deliverable: goal-001: Deliverable

### [BLOCKING] finding-001 - required_implementation_missing / correctness

**Scope:** `goal-001`  
**Claim:** Replace retired Deliberation loader/config/wire coupling across the three retained Discord and Slack owner-path test surfaces with a minimal generic exclusive-owner fixture while preserving host behavior coverage.

**Observed**
The task-scoped diff changes only one Discord policy expectation from ownerPluginId deliberation to host-test-owner. It supplies no generic registered owner fixture and no adaptations to the Discord process or Slack owner-path tests; the task checkpoint marks the fixture adaptation unfinished.

**Why this matters**
Renaming an expected owner does not register a generic owner or decouple the retained host suites from retired plugin loader, configuration, and wire assumptions, so the central repair deliverable remains absent.

**Required action**
Implement the bounded generic host-owner fixture adaptation in all three named retained test surfaces, preserving the required real host-path assertions and making no production behavior changes.

**Evidence**

- file: `extensions/discord/src/monitor/message-handler.deliberation.test.ts:182-186`
- artifact: `plans/checkpoints/task-19ac8f67-e320-4eef-a9f3-1ec5b559609d.checkpoint.md:Steps`
- plan: `plans/2026-10-06_task-19ac8f67-e320-4eef-a9f3-1ec5b559609d_deliverable-goal-001-deliverable.md:Implementation`

### [BLOCKING] finding-002 - verification_evidence_missing / evidence

**Scope:** `goal-001`  
**Claim:** Provide plans/checkpoints/deliberation_generic_host_fixture_cleanup.md with exact scoped verification outcomes, characterization-to-final assertion mapping, blockers, and explicit source-suite-only scope.

**Observed**
The required cleanup checkpoint is not among the supplied task artifacts, and the supplied task checkpoint marks GREEN, scoped regression verification, and cleanup evidence recording unfinished.

**Why this matters**
The task contract explicitly requires this checkpoint as verification evidence for the fixture cleanup; the supplied RED-only proof and incomplete progress checkpoint do not contain the required final mapping and outcomes.

**Required action**
Supply the required cleanup checkpoint with the specified assertion mapping, exact permitted verification commands and outcomes or blockers, and explicit source-suite-only scope, relying on canonical Test Gate evidence for test interpretation.

**Evidence**

- artifact: `plans/checkpoints/task-19ac8f67-e320-4eef-a9f3-1ec5b559609d.checkpoint.md:Steps 5-6`
- plan: `plans/2026-10-06_task-19ac8f67-e320-4eef-a9f3-1ec5b559609d_deliverable-goal-001-deliverable.md:Implementation step 6 and Testing`
- artifact: `manifest.json:19-43`

### [BLOCKING] finding-003 - required_tdd_proof_missing / evidence

**Scope:** `goal-001`  
**Claim:** Provide valid ordered RED-then-GREEN TDD proof because this run declares TDD required.

**Observed**
The supplied TDD projection and task proof contain only a RED phase and explicitly state that the GREEN phase and phase order are incomplete; the checkpoint also marks GREEN capture unfinished.

**Why this matters**
With tddRequired true, RED-only evidence cannot demonstrate the mandatory completed RED/GREEN cycle for the scoped repair.

**Required action**
Complete and supply valid ordered RED/GREEN proof for the scoped implementation using the caller-owned TDD evidence workflow and the genuine historical RED where applicable.

**Evidence**

- artifact: `plans/checkpoints/task-19ac8f67-e320-4eef-a9f3-1ec5b559609d.red-green-proof.md:RED Phase`
- artifact: `TDD proof/provenance:missing GREEN Phase`
- file: `plans/checkpoints/acceptance-runs/task-19ac8f67-e320-4eef-a9f3-1ec5b559609d-acceptance-001/manifest.json:45-46`

## Context

- Original task: `task-19ac8f67-e320-4eef-a9f3-1ec5b559609d`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Use the concrete goals and findings above to repair the untrustworthy task outcome. Make the minimum implementation and test changes needed, and verify the repaired behavior.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-10-06_task-19ac8f67-e320-4eef-a9f3-1ec5b559609d_deliverable-goal-001-deliverable.md` for full context. Focus only on the unmet goals listed above.

## Recent learnings from previous attempt

### generic-host-tests-avoid-retired-plugin-discovery.md

```
---
title: "Generic host tests avoid retired plugin discovery"
date: 2026-10-06
category: architecture
component: general
tags: [plugin-retirement, host-tests, exclusive-ownership, tdd]
---

Generic host-handler tests should create the hook registry directly with the public test seam (`createMockPluginRegistry` and `initializeGlobalHookRunner`) and use an opaque owner ID. Loader-backed plugin tests otherwise couple native Discord/Slack behavior to retired plugin discovery and configuration. Keep producer-owned wire/config assertions in producer-owned tests; preserve host routing, dedupe, and t
```

## Implementation session log excerpt (last 50 lines)

```
general" --tags "plugin-retirement,host-tests,exclusive-ownership,tdd" --content-file tmp/content.md --output learnings/architecture/generic-host-tests-avoid-retired-plugin-discovery.md
✓ Learning saved to learnings/architecture/generic-host-tests-avoid-retired-plugin-discovery.md
[0m
**Tarefa nedokončena.** Podařilo se zachytit skutečnou RED fázi: testy Discordu selhaly, protože bez registrovaného generického vlastníka vracely `ordinary`. Adaptace tří testovacích ploch, GREEN důkaz ani širší ověření nejsou hotové.

Vznikl checkpoint a povinný soubor `plans/checkpoints/task-19ac8f67-e320-4eef-a9f3-1ec5b559609d.red-green-proof.md` obsahuje `## RED Phase`, ale chybí mu `## GREEN Phase`. Uložil jsem také learning `learnings/architecture/generic-host-tests-avoid-retired-plugin-discovery.md`.

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
