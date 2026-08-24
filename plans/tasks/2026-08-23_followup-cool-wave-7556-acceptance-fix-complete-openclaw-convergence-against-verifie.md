# [acceptance-fix] [acceptance-fix] Complete OpenClaw convergence against verified KM owner artifacts: goal-001: Complete OpenClaw converge: goal-001: [acceptance-fix] Complete OpenClaw convergence against verified KM own

Auto-created by the monitor because the original task `swift-vale-0374` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-001: [acceptance-fix] Complete OpenClaw convergence against verified KM owner artifacts: goal-001: Complete OpenClaw converge

### [BLOCKING] finding-001 - required_implementation_missing / correctness

**Scope:** `goal-001`  
**Claim:** The required OpenClaw owner-convergence implementation is still absent from the supplied task-scoped changes.

**Observed**
The supplied diff contains architecture-review artifacts, changelog entries, and plugin documentation, but no task-scoped changes to the required contract/provenance mirror, intake producer, spool probe, KM client, final adapter, OR-07..OR-21 owner-backed harness, or focused regressions. The completion ledger asserts preserved implementation at those paths, but the supplied change set does not materially include that implementation for semantic review.

**Why this matters**
Goal-001 requires delivery of the owner-backed OpenClaw convergence behavior, and the corrective task explicitly required the preserved implementation to be included in its reviewed change set. Artifact summaries cannot substitute for supplied implementation when the actual task-scoped diff omits every required product boundary.

**Required action**
Supply the attributable task-scoped implementation changes for the contract/provenance, producer/probe, KM client, final adapter, owner-backed OR-07..OR-21 harness, and focused regressions so goal-001 can be semantically reviewed.

**Evidence**

- file: `plans/tasks/2026-08-23_followup-swift-vale-0374-complete-openclaw-convergence-against-verified-km-owner-arti.md`
- plan: `plans/2026-08-24_swift-vale-0374_complete-openclaw-convergence-against-verified-km-owner.md`
- artifact: `caller-supplied:task-scoped-diff`
- artifact: `plans/checkpoints/swift-vale-0374.evidence.md`

## Context

- Original task: `swift-vale-0374`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Use the concrete goals and findings above to repair the untrustworthy task outcome. Make the minimum implementation and test changes needed, and verify the repaired behavior.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-08-24_swift-vale-0374_complete-openclaw-convergence-against-verified-km-owner.md` for full context. Focus only on the unmet goals listed above.

## Recent learnings from previous attempt

### swift-vale-0374-owner-artifacts-versus-stale-assertions.md

```
---
title: "Ověřuj owner artefakty a owner assertiony odděleně"
date: 2026-08-24
category: test-failures
component: e2e
tags: [cross-repository, contract-provenance, sha256, e2e, acceptance]
file_type: rules
---

# Verify owner artifacts and owner assertions separately

In cross-repository convergence work, matching authoritative artifact hashes proves the contract bundle but does not guarantee every test in the owner checkout has been updated to that bundle.

When a composed owner E2E assertion conflicts with the verified contract:

1. Record the current owner HEAD as non-blocking provenance.
```

## Implementation session log excerpt (last 50 lines)

```
ression coverage in `extensions/deliberation/src/contract.test.ts`.
- Added RED/GREEN proof: `plans/checkpoints/swift-vale-0374.red-green-proof.md`.
- Added full evidence ledger: `plans/checkpoints/swift-vale-0374.evidence.md`.
- Checkpoint marked complete: `plans/checkpoints/swift-vale-0374.checkpoint.md`.
- Focused tests: 112 passed.
- Owner OR-07..OR-21 gate: 37 passed.
- Build, lint, formatting, and diff checks passed.
- KM composed E2E: 2 passed, 1 stale owner assertion failed because it omits contract-required `pipelineId` and `deliveryTarget`.
- `pnpm check:changed` was blocked by unavailable Blacksmith CLI.
- Autoreview was blocked by the shared worktree’s 2.24 MB review bundle.
- Saved learning: `learnings/test-failures/swift-vale-0374-owner-artifacts-versus-stale-assertions.md`.

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
