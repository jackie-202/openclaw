# [acceptance-fix] [acceptance-fix] Route per-pipeline deliberation and deliver source-default replies: goal-001: Route per-pipeline delibe: goal-001: [acceptance-fix] Route per-pipeline deliberation and deliver source-de

Auto-created by the monitor because the original task `calm-reef-2510` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-001: [acceptance-fix] Route per-pipeline deliberation and deliver source-default replies: goal-001: Route per-pipeline delibe

### [BLOCKING] finding-001 - required_tdd_proof_missing / evidence

**Scope:** `goal-001`  
**Claim:** The caller-required TDD evidence must demonstrate the planned RED/GREEN cycle with fresh GREEN from the identical owner contract-gate command.

**Observed**
The proof credibly links the historical RED from the parent contract test, but its GREEN phase runs extensions/deliberation/src/plugin.test.ts instead of the plan's identical extensions/deliberation/src/contract.test.ts command. The supplied proof therefore does not establish that the exact RED contract gate became GREEN.

**Why this matters**
The manifest declares tddRequired true, and the task plan explicitly defines the identical contract command as the GREEN evidence needed to close the original missing-owner-contract failure. Passing a different behavioral suite does not prove that required transition.

**Required action**
Append credible fresh GREEN evidence from the identical contract-gate command specified in the plan, preserving the linked historical RED provenance.

**Evidence**

- artifact: `plans/checkpoints/calm-reef-2510.red-green-proof.md`
- artifact: `plans/checkpoints/calm-vale-3982.red-green-proof.md`
- plan: `plans/2026-08-21_calm-reef-2510_route-per-pipeline-deliberation-and-deliver-source-default.md`

## Context

- Original task: `calm-reef-2510`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Treat this as an evidence-only follow-up. Production-code changes are forbidden by default. You must inspect the parent implementation and evidence first, then supply only the missing acceptance evidence. Escalate only if that inspection lets you document a real implementation defect; in that case, make only the minimal fix with tests.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-08-21_calm-reef-2510_route-per-pipeline-deliberation-and-deliver-source-default.md` for full context. Focus only on the unmet goals listed above.

## Recent learnings from previous attempt

### 2026-08-21_durable-target-modes-reject-contradictory-evidence.md

```
---
title: "Durable target modes must reject contradictory inbound evidence"
date: 2026-08-21
category: architecture
component: shared
tags: [deliberation, pipeline-routing, delivery-target, discord, fail-closed]
file_type: rules
---

# Durable target modes must reject contradictory inbound evidence

Per-pipeline delivery cannot represent Discord source-default roots with only an optional `threadId`. The durable target needs a closed mode discriminator:

- `root` means an exact channel root and has no `threadId`.
- `thread` means an exact existing thread and requires `threadId`.
- `source_anch
```

## Implementation session log excerpt (last 50 lines)

```
contradictory Discord thread evidence.
- Updated contracts, fixtures, provenance, tests, README, and public docs.
- Created verified RED/GREEN proof at `plans/checkpoints/calm-reef-2510.red-green-proof.md`.
- Saved learning at `learnings/architecture/2026-08-21_durable-target-modes-reject-contradictory-evidence.md`.

Verification passed:

- Deliberation suite: 263 tests
- Discord outbound: 37 tests
- Focused core parent-context test
- `pnpm tsgo:prod`
- `pnpm build`
- Targeted Oxlint
- `pnpm docs:check-mdx`
- Scoped autoreview: clean

Broad `check:changed` was blocked because the Blacksmith binary is unavailable. Repository-wide docs formatting and extension lint also report unrelated pre-existing findings outside the changed lines.

https://docs.openclaw.ai/plugins/reference/deliberation

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
