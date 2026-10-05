# [acceptance-fix] [acceptance-fix] Deliberation plugin: retire replaced bundled implementation and host path coupling: goal-001: Deliberat: goal-001: [acceptance-fix] Deliberation plugin: retire replaced bundled implemen

Auto-created by the monitor because the original task `task-29e25aa6-c5d5-4da5-ac89-e98c4538a2fc` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-001: [acceptance-fix] Deliberation plugin: retire replaced bundled implementation and host path coupling: goal-001: Deliberat

### [BLOCKING] finding-001 - required_implementation_missing / correctness

**Scope:** `goal-001`  
**Claim:** Remaining Discord and Slack consumers must load Deliberation through the separately packaged public API/test contract rather than the retired bundled implementation.

**Observed**
The task checkpoint marks the package acquisition and three-loader migration incomplete; the supplied handoff inventory contains no public package contract or archive, and the owner-path consumers remain unable to load Deliberation.

**Why this matters**
Retiring the bundled source without a runnable config-origin public package path leaves active host integration consumers coupled to an implementation that no longer exists, so the requested host decoupling is incomplete.

**Required action**
Provide the pinned repo-local offline public package/test contract and migrate all three loaders to config-origin package resolution while preserving their existing scenarios and assertions.

**Evidence**

- artifact: `plans/checkpoints/task-29e25aa6-c5d5-4da5-ac89-e98c4538a2fc.checkpoint.md:3-17`
- artifact: `plans/checkpoints/deliberation_bundled_plugin_retirement.md:3-8`
- artifact: `plans/handoffs/deliberation-plugin-retirement`

### [BLOCKING] finding-002 - verification_evidence_missing / evidence

**Scope:** `goal-001`  
**Claim:** The retirement deliverable must include assertion-level external-owner mapping and immutable proof for both transferred Slack root and child orchestration scenarios.

**Observed**
The supplied retirement checkpoint says the manifest has no dynamic target titles or target assertions and that two-case count parity does not establish preservation; the follow-up checkpoint marks acquisition of orchestration-assertion-map.json and expanded root/child proof incomplete.

**Why this matters**
Without assertion-level mapping, the supplied material does not establish preservation of identity, bounded history, unrelated-thread exclusion, envelope and receipt invariants, send counts, and lifecycle behavior required by the task.

**Required action**
Supply the owner-exported assertion map and immutable expanded root/child evidence covering every required scenario invariant.

**Evidence**

- artifact: `plans/checkpoints/deliberation_bundled_plugin_retirement.md:74-91`
- artifact: `plans/checkpoints/task-29e25aa6-c5d5-4da5-ac89-e98c4538a2fc.checkpoint.md:6-17`
- plan: `plans/2026-10-04_task-29e25aa6-c5d5-4da5-ac89-e98c4538a2fc_deliberation-plugin-retire-replaced-bundled-implementation.md:23-29`

### [BLOCKING] finding-003 - required_tdd_proof_missing / evidence

**Scope:** `goal-001`  
**Claim:** This caller-declared TDD task requires a complete, ordered RED/GREEN proof for the follow-up repair.

**Observed**
The supplied TDD projection explicitly reports a missing GREEN phase and incomplete phase order; the task checkpoint likewise leaves focused GREEN capture incomplete.

**Why this matters**
The manifest sets tddRequired to true, and a RED-only loader characterization does not demonstrate that the follow-up implementation reached GREEN.

**Required action**
After delivering the repair, capture and supply the fresh GREEN phase linked to the valid historical or characterization RED, with complete phase ordering and provenance.

**Evidence**

- artifact: `plans/checkpoints/task-29e25aa6-c5d5-4da5-ac89-e98c4538a2fc.red-green-proof.md:1-6`
- artifact: `plans/checkpoints/task-29e25aa6-c5d5-4da5-ac89-e98c4538a2fc.checkpoint.md:3-17`
- file: `plans/checkpoints/acceptance-runs/task-29e25aa6-c5d5-4da5-ac89-e98c4538a2fc-acceptance-001/manifest.json:57-58`

## Context

- Original task: `task-29e25aa6-c5d5-4da5-ac89-e98c4538a2fc`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Use the concrete goals and findings above to repair the untrustworthy task outcome. Make the minimum implementation and test changes needed, and verify the repaired behavior.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-10-04_task-29e25aa6-c5d5-4da5-ac89-e98c4538a2fc_deliberation-plugin-retire-replaced-bundled-implementation.md` for full context. Focus only on the unmet goals listed above.

## Recent learnings from previous attempt

### 2026-10-04_missing-owner-exports-allow-loader-characterization-not-green.md

```
---
title: "Chybějící export vlastníka lze ověřit bez obnovy odstraněného pluginu"
date: 2026-10-04
category: test-failures
component: tooling
tags: [deliberation, plugin-retirement, tdd, owner-contract, acceptance]
---

# Missing owner exports can be characterized without recreating retired code

The Deliberation retirement acceptance follow-up required a pinned public package and expanded owner assertion evidence, but the repo-local handoff contained only an ownership note, a filename/hash manifest, and a source-suite log. None was runnable offline public-package input.

The existing Slack l
```

### 2026-10-04_retirement-followups-need-separate-loader-and-assertion-proof.md

```
---
title: "Dokončení retirement vyžaduje oddělený důkaz loaderu a assertions"
date: 2026-10-04
category: architecture
component: tooling
tags: [deliberation, acceptance, public-package, scenario-mapping, planning]
file_type: checklist
---

# Separate public-loader proof from transferred assertion proof

Planning task `task-29e25aa6-c5d5-4da5-ac89-e98c4538a2fc` found two independent
acceptance gaps after successful bundled source retirement. Discord/Slack loaders
still enabled Deliberation against a bundled root, while the external suite receipt
provided case counts without expanded Slack orch
```

## Implementation session log excerpt (last 50 lines)

```
hild cases, covering identity, bounded history, thread exclusion/freshness, envelopes/receipts, and one-Discord/zero-Slack send behavior.

**Verification performed:** captured the existing Slack loader suite through the required TDD helper. It accepted genuine RED with child exit **1**: **8 owner-path tests failed** at the loaded-plugin assertion; **3 native history tests passed**. No tests or production code were altered.

Saved:
- Checkpoint: `plans/checkpoints/task-29e25aa6-c5d5-4da5-ac89-e98c4538a2fc.checkpoint.md`
- Captured RED: `plans/checkpoints/task-29e25aa6-c5d5-4da5-ac89-e98c4538a2fc.red-green-proof.md`
- Required learning via `save-learning`

Both acceptance findings remain open. GREEN, loader migration, build, and lint verification remain pending; existing work was preserved.

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
