# [acceptance-fix] Prepare Deliberation v2 for a bounded live test after safe silence: goal-001: Prepare Deliberation v2 for a bounded live test after safe silence

Auto-created by the monitor because the original task `fresh-brook-8143` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-001: Prepare Deliberation v2 for a bounded live test after safe silence

### [BLOCKING] finding-001 - required_implementation_missing / correctness

**Scope:** `goal-001`  
**Claim:** Prepare Deliberation v2 for a bounded live test after safe silence

**Observed**
The supplied checkpoint states no production, fixture, or docs edits were made because the canonical KM contract could not be reconstructed, and the task remains failed closed at the contract gate.

**Why this matters**
The task acceptance required a canonical OpenClaw-side wire/control implementation, fail-closed preparation mode, install/config/operator documentation, focused tests, and checkpoint evidence. A fail-closed stop with no implementation/docs/fixture edits names a blocker but does not prepare Deliberation v2 for the bounded live test.

**Required action**
Deliver the fork-owned Deliberation wire/control implementation, preparation-mode behavior, docs, fixtures/tests, and checkpoint evidence, or supply a task contract that explicitly accepts the blocked fail-closed checkpoint as completion.

**Evidence**

- artifact: `plans/checkpoints/fresh-brook-8143.checkpoint.md`
- artifact: `plans/checkpoints/fresh-brook-8143.red-green-proof.md`
- task: `plans/tasks/2026-07-29_prepare-deliberation-v2-for-a-bounded-live-test-after-safe-s.md`

### [BLOCKING] finding-002 - required_tdd_proof_missing / evidence

**Scope:** `goal-001`  
**Claim:** TDD required for fresh-brook-8143

**Observed**
The supplied RED/GREEN proof says the RED phase was only a contract-gate blocker and that no production code changed after it; it does not provide an actual failing focused test command/result before implementation followed by a passing result after implementation.

**Why this matters**
The manifest has tddRequired=true and the plan required creating/updating km-client.test.ts, running the focused Vitest command to verify RED, implementing the smallest passing change, and recording RED/GREEN evidence. The supplied proof does not demonstrate that cycle.

**Required action**
Provide a valid task-owned RED/GREEN TDD proof with exact failing and passing focused command evidence, or do not mark the TDD-required task as satisfied.

**Evidence**

- artifact: `plans/checkpoints/fresh-brook-8143.red-green-proof.md`
- plan: `plans/2026-07-29_fresh-brook-8143_prepare-deliberation-v2-for-a-bounded-live-test-after-safe.md`
- manifest: `manifest.json`

## Context

- Original task: `fresh-brook-8143`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Use the concrete goals and findings above to repair the untrustworthy task outcome. Make the minimum implementation and test changes needed, and verify the repaired behavior.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-07-29_fresh-brook-8143_prepare-deliberation-v2-for-a-bounded-live-test-after-safe.md` for full context. Focus only on the unmet goals listed above.

## Recent learnings from previous attempt

### contract-gated-deliberation-missing-km-authority.md

```
---
title: "Contract-gated Deliberation work stops on missing KM authority"
date: 2026-07-29
category: architecture
component: general
tags: [deliberation, contracts, km, fail-closed]
file_type: rules
---

# Contract-gated Deliberation work must stop on missing immutable KM authority

When a Deliberation task asks to reconcile OpenClaw wire paths, headers, schemas, control operations, reservation semantics, or reconciliation behavior against a KM-owner contract, do not proceed from sparse repository summaries alone.

If the task-named audit or accepted KM-owner bundle is absent, treat that as
```

## Implementation session log excerpt (last 50 lines)

```
e missing KM-owner-approved immutable wire/control bundle is still the blocker.

Updated required artifacts:
- `plans/checkpoints/fresh-brook-8143.checkpoint.md`
- `plans/checkpoints/fresh-brook-8143.red-green-proof.md` with both `## RED Phase` and `## GREEN Phase`
- `learnings/architecture/contract-gated-deliberation-missing-km-authority.md`

Verification:
- `node scripts/run-vitest.mjs extensions/deliberation/src --reporter=verbose`: passed, 8 files, 30 tests
- `pnpm docs:list`: passed
- `pnpm lint:docs plans/checkpoints/fresh-brook-8143.checkpoint.md`: passed after checkpoint-only markdown spacing fix
- `pnpm docs:check-mdx`: passed, 681 files
- `pnpm build`: passed

No live config, routes, spool, Gateway process, cron, channel, external service, or message-send mutation was performed.

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
