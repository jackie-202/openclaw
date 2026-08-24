# [acceptance-fix] [acceptance-fix] Define deliberation pipelines config and legacy normalization: goal-001: Define deliberation pipelines : goal-001: [acceptance-fix] Define deliberation pipelines config and legacy norma

Auto-created by the monitor because the original task `dark-mist-7145` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-001: [acceptance-fix] Define deliberation pipelines config and legacy normalization: goal-001: Define deliberation pipelines

### [BLOCKING] finding-001 - required_tdd_proof_missing / evidence

**Scope:** `goal-001`  
**Claim:** The mandatory TDD artifact must demonstrate a valid RED and GREEN cycle for the acceptance repair's identical focused source-thread regression command.

**Observed**
The canonical proof metadata and both captured phases use only 'pnpm test extensions/deliberation/src/config.test.ts -- --reporter=verbose'. The supplied repair plan instead requires RED and GREEN for the identical focused command covering route-match, contract, KM client, and intake producer tests; the reused parser RED does not exercise the sourceThreadId regression repaired by this follow-up.

**Why this matters**
Because tddRequired is true, a historical RED is credible only when it applies to the repaired behavior and is paired with the required identical-command GREEN. The supplied parser-only cycle proves canonical pipeline parsing, not the follow-up's sourceThreadId contract repair.

**Required action**
Provide a genuine RED and GREEN capture for the repair's specified identical focused source-thread regression command, or supply credible historical RED provenance for that same behavior paired with an identical-command GREEN.

**Evidence**

- artifact: `plans/checkpoints/dark-mist-7145.red-green-proof.md`
- plan: `plans/2026-08-21_dark-mist-7145_define-deliberation-pipelines-config-and-legacy.md`
- file: `plans/tasks/2026-08-21_followup-dark-mist-7145-define-deliberation-pipelines-config-and-legacy-normalizatio.md`

## Context

- Original task: `dark-mist-7145`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Treat this as an evidence-only follow-up. Production-code changes are forbidden by default. You must inspect the parent implementation and evidence first, then supply only the missing acceptance evidence. Escalate only if that inspection lets you document a real implementation defect; in that case, make only the minimal fix with tests.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-08-21_dark-mist-7145_define-deliberation-pipelines-config-and-legacy.md` for full context. Focus only on the unmet goals listed above.

## Recent learnings from previous attempt

### 2026-08-21_config-only-acceptance-repairs-restore-wire-invariants.md

```
---
title: "Konfigurační acceptance opravy musí obnovit odmítnutý wire drift end-to-end"
date: 2026-08-21
category: architecture
component: shared
tags: [configuration, acceptance, wire-contracts, tdd, deliberation]
file_type: rules
---

# Configuration-only acceptance repairs must restore rejected wire drift end-to-end

When a configuration task explicitly defers producer behavior, inspect the full diff for incidental wire changes rather than reviewing only the parser and manifest. Fixture conversions can hide an out-of-scope contract change by updating every assertion to agree with the new b
```

## Implementation session log excerpt (last 50 lines)

```
ark-mist-7145`.

- Restored the required `sourceThreadId` intake and KM wire contract to match `HEAD`.
- Preserved the pipeline configuration and legacy normalization implementation.
- Added complete RED/GREEN evidence at `plans/checkpoints/dark-mist-7145.red-green-proof.md`.
- Completed checkpoint and saved a learning.

Verification:
- Focused config: 41 passed.
- Focused extension tests: 182 passed.
- Loader tests: 3 passed.
- Deliberation suite: 249 passed.
- `pnpm build`: passed.
- Scoped formatting and direct Oxlint: passed.
- `git diff --check`: passed.
- Codex autoreview: clean, no actionable findings.

The standard lint wrapper remains blocked by an unrelated missing Slack test-harness export, `primeChannelOutboundSendMock`.

https://docs.openclaw.ai/plugins/reference/deliberation

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
