# [acceptance-fix] Fix stale Deliberation KM client contract fixtures: goal-001: Fix stale Deliberation KM client contract fixtures

Auto-created by the monitor because the original task `swift-reef-2132` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-001: Fix stale Deliberation KM client contract fixtures

### [BLOCKING] finding-001 - required_tdd_proof_missing / evidence

**Scope:** `goal-001`  
**Claim:** The caller-declared mandatory TDD proof does not include a supplied GREEN phase.

**Observed**
The supplied TDD proof/provenance contains metadata and a RED phase with 2 failing tests, but no GREEN phase command output or result; the checkpoint only states that GREEN evidence exists.

**Why this matters**
With tddRequired true, an assertion in a checkpoint is not the required RED/GREEN proof itself, and the supplied material does not establish the post-change GREEN half of the cycle.

**Required action**
Supply the run-scoped TDD proof containing both the captured RED result and the subsequent GREEN result for the focused km-client test command.

**Evidence**

- artifact: `plans/checkpoints/swift-reef-2132.red-green-proof.md`
- artifact: `plans/checkpoints/swift-reef-2132.checkpoint.md`

## Context

- Original task: `swift-reef-2132`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Treat this as an evidence-only follow-up. Production-code changes are forbidden by default. You must inspect the parent implementation and evidence first, then supply only the missing acceptance evidence. Escalate only if that inspection lets you document a real implementation defect; in that case, make only the minimal fix with tests.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-08-09_swift-reef-2132_fix-stale-deliberation-km-client-contract-fixtures.md` for full context. Focus only on the unmet goals listed above.

## Recent learnings from previous attempt

### 2026-08-09_closed-schema-fixtures-must-reach-field-boundaries.md

```
---
title: "Closed-schema fixtures must reach field boundaries"
date: 2026-08-09
category: test-failures
component: tooling
tags: [deliberation, fixtures, closed-schema, contracts, vitest]
file_type: rules
---

# Closed-schema parser tests must mutate canonical fixtures

When an external response parser uses exact-key validation, malformed-field tests should start from one canonical valid fixture and override exactly one field. Otherwise a newly required sibling field can make parsing fail at the object-shape guard and silently mask the intended field-level assertion.

For Deliberation KM rese
```

## Implementation session log excerpt (last 50 lines)

```
ed isolated malformed envelope, digest, and hash assertions at `extensions/deliberation/src/km-client.test.ts:477`.
- Production parser remains unchanged.
- RED/GREEN proof saved at `plans/checkpoints/swift-reef-2132.red-green-proof.md`.

Verification:

- Focused suite: **17 passed, 0 failed**, 1 file.
- Broader Deliberation suite: **109 passed, 0 failed**, 11 files.
- KM integration: **4 passed, 0 failed**.
- Formatting: passed.
- Autoreview: clean, no actionable findings.
- Lint wrapper was blocked by an unrelated Slack declaration-generation error; direct lint only found two pre-existing `no-promise-executor-return` findings.
- Build intentionally not run per task instruction.

Learning saved at `learnings/test-failures/2026-08-09_closed-schema-fixtures-must-reach-field-boundaries.md`.

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
