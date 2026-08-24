# [acceptance-fix] Define deliberation pipelines config and legacy normalization: goal-001: Define deliberation pipelines config and legacy normalization

Auto-created by the monitor because the original task `warm-vale-8134` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-001: Define deliberation pipelines config and legacy normalization

### [BLOCKING] finding-001 - implemented_behavior_incorrect / correctness

**Scope:** `goal-001`  
**Claim:** The configuration-only slice must not change intake or KM wire behavior.

**Observed**
The task-scoped diff removes sourceThreadId from the intake producer expectation, removes it from the KM wire request's required fields, and rewrites reservation semantics to make genuine sourceThreadId optional.

**Why this matters**
These delivered changes alter intake and producer/final-delivery contracts despite the explicit constraint not to change intake or producer/final delivery behavior in this slice.

**Required action**
Restore the pre-existing intake and KM wire sourceThreadId contract in this task and limit the implementation to configuration parsing, normalization, consumers, fixtures, and documentation.

**Evidence**

- file: `extensions/deliberation/scripts/intake-producer.test.ts:69`
- file: `extensions/deliberation/contracts/km-wire-v1.json:89`
- file: `extensions/deliberation/contracts/km-wire-v1.json:317`
- file: `extensions/deliberation/contracts/cutover-controls-v1.json:397`

### [BLOCKING] finding-002 - required_tdd_proof_missing / evidence

**Scope:** `goal-001`  
**Claim:** The caller-declared mandatory TDD evidence must contain a valid RED and GREEN cycle for the focused command.

**Observed**
The supplied TDD proof contains metadata and a genuine failing RED phase, but no GREEN phase or successful identical-command capture is present in the supplied artifact.

**Why this matters**
The manifest sets tddRequired to true, and a checkpoint assertion that GREEN exists does not substitute for the required run-scoped RED/GREEN proof content.

**Required action**
Provide the captured GREEN phase for the identical focused command in the canonical TDD proof artifact, preserving the demonstrated RED phase.

**Evidence**

- artifact: `plans/checkpoints/warm-vale-8134.red-green-proof.md`
- artifact: `plans/checkpoints/warm-vale-8134.checkpoint.md`

## Context

- Original task: `warm-vale-8134`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Use the concrete goals and findings above to repair the untrustworthy task outcome. Make the minimum implementation and test changes needed, and verify the repaired behavior.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-08-21_warm-vale-8134_define-deliberation-pipelines-config-and-legacy.md` for full context. Focus only on the unmet goals listed above.

## Recent learnings from previous attempt

### 2026-08-21_bound-compatibility-at-the-parser-boundary.md

```
---
title: "Ohraničte kompatibilitu na hranici parseru"
date: 2026-08-21
category: architecture
component: shared
tags: [configuration, normalization, compatibility, deliberation, pipelines]
file_type: rules
---

# Bound compatibility at the parser boundary

When a configuration shape changes from global `sources` plus one `deliveryTarget` to per-source pipelines, accepting both raw forms throughout runtime creates two authorities. Parse exactly one closed raw branch at startup, reject any mixed presence before branch parsing, and normalize legacy input immediately into the canonical pipeline
```

## Implementation session log excerpt (last 50 lines)

```
source-checkout-runtime.test.ts -- --reporter=verbose`: 3 tests.
- `pnpm test extensions/deliberation/src/km-client.test.ts extensions/deliberation/scripts/intake-producer.test.ts`: 69 tests.
- `pnpm test extensions/deliberation`: 250 tests.
- `pnpm test src/config/config.plugin-validation.test.ts`: 55 tests.
- Scoped `oxfmt` and `git diff --check`: passed.

Broad gates encountered unrelated environment/worktree blockers:

- `pnpm check:changed`: Blacksmith CLI missing before remote execution.
- Scoped lint preparation: pre-existing missing `primeChannelOutboundSendMock` export in Slack test infrastructure.
- `pnpm docs:check-links`: 12 pre-existing broken links in the older `proposal-20260809-165021-f994b3` document.

Documentation: https://docs.openclaw.ai/plugins/reference/deliberation

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
