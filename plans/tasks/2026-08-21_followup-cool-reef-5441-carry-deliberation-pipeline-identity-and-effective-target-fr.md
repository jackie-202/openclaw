# [acceptance-fix] Carry deliberation pipeline identity and effective target from intake: goal-001: Carry deliberation pipeline identity and effective target from intake

Auto-created by the monitor because the original task `swift-peak-3523` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-001: Carry deliberation pipeline identity and effective target from intake

### [BLOCKING] finding-001 - required_tdd_proof_missing / evidence

**Scope:** `goal-001`  
**Claim:** The caller-required TDD artifact must contain credible RED and GREEN evidence for the identical focused command.

**Observed**
The supplied TDD proof contains metadata and an exit-1 RED phase only; no GREEN phase or successful identical-command result is present. The checkpoint's narrative claim of 149/149 does not supply the missing proof record.

**Why this matters**
The manifest declares tddRequired true, so a RED-only artifact cannot establish the required completed RED/GREEN cycle.

**Required action**
Supply the run-scoped TDD proof containing both RED and GREEN phases for the identical command, including the successful GREEN outcome.

**Evidence**

- artifact: `plans/checkpoints/swift-peak-3523.red-green-proof.md`
- artifact: `plans/checkpoints/swift-peak-3523.checkpoint.md`

### [BLOCKING] finding-002 - implemented_behavior_incorrect / correctness

**Scope:** `goal-001`  
**Claim:** Repository reference documentation must describe the delivered producer-side pipeline selection and effective-target behavior consistently with this slice.

**Observed**
The changed reference and extension README still state that this is a configuration-only slice, that per-pipeline selection and source-default resolution activate in a following slice, and that a temporary common-target projection remains operative.

**Why this matters**
Those statements directly contradict this task's required behavior and plan, which activate authenticated per-source selection and remove the temporary global target projection; leaving them in updated user-facing documentation makes the repository-local contract internally inconsistent.

**Required action**
Update the deliberation reference and README to describe active producer-side pipeline selection, source-default target resolution, exact explicit targets, and removal of the temporary common-target projection.

**Evidence**

- file: `docs/plugins/reference/deliberation.md:93`
- file: `docs/plugins/reference/deliberation.md:113`
- file: `extensions/deliberation/README.md:105`

## Context

- Original task: `swift-peak-3523`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Use the concrete goals and findings above to repair the untrustworthy task outcome. Make the minimum implementation and test changes needed, and verify the repaired behavior.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-08-21_swift-peak-3523_carry-deliberation-pipeline-identity-and-effective-target.md` for full context. Focus only on the unmet goals listed above.

## Recent learnings from previous attempt

### 2026-08-21_authenticated-pipeline-routing-fixes-target-at-admission.md

```
---
title: "Autentizované směrování pipeline odděluje source parent a reply anchor"
date: 2026-08-21
category: architecture
component: backend
tags: [deliberation, routing, pipeline, threads, contracts]
file_type: decisions
---

# Authenticated thread routing separates the source parent from the reply anchor

For plugin `inbound_claim`, a threaded provider event can expose two different route facts: `PluginHookInboundClaimContext.parentConversationId` identifies the configured parent source, while `PluginHookInboundClaimEvent.threadId` identifies the existing reply thread. Treating `conversati
```

## Implementation session log excerpt (last 50 lines)

```
ains active across all configured sources and producer outcomes.
- Updated producer fixtures, contract overlay/provenance, orchestration, and loader-backed Discord evidence.
- KM adoption remains explicitly marked as pending.

**Verification**
- Focused RED/GREEN: 149 passed.
- Deliberation suite: 259 passed.
- Plugin, identity, Discord integration: 121 passed.
- `pnpm build`: passed.
- Scoped oxfmt and oxlint: passed.
- Autoreview: clean, no actionable findings.
- Broad lint/type reruns encountered unrelated Slack boundary and missing MCP SDK module errors.

Proof: `plans/checkpoints/swift-peak-3523.red-green-proof.md`
Checkpoint: `plans/checkpoints/swift-peak-3523.checkpoint.md`
Learning: `learnings/architecture/2026-08-21_authenticated-pipeline-routing-fixes-target-at-admission.md`

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
