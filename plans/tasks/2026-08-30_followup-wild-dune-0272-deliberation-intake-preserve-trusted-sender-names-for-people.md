# [acceptance-fix] Deliberation intake: preserve trusted sender names for People Intel identity resolution: goal-004: Existing source-target, idempotency, replay, and delivery routing beha

Auto-created by the monitor because the original task `quick-cove-1732` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-004: Existing source-target, idempotency, replay, and delivery routing behavior is unchanged.
- goal-005: Canonical contract generation/provenance verification passes.
- goal-006: Focused Deliberation intake/contract tests pass.
- goal-007: Final note documents exact source fields used for every supported indicator and the serialized contract shape consumed by KM.

### [BLOCKING] finding-001 - unknown / correctness

**Scope:** `goal-004`  
**Claim:** The sender-hints task must leave existing delivery routing semantics unchanged.

**Observed**
The supplied task-scoped diff changes the canonical Deliberation reference from Discord root source-anchor/thread creation semantics to root-channel delivery without threadId, and changes source-default destination derivation accordingly.

**Why this matters**
This is a material routing-contract rewrite in the evaluated change set and cannot be reconciled with the explicit unchanged-routing goal from the supplied material.

**Required action**
Remove the routing-semantic rewrite from this task's changes or supply a task-scoped implementation/diff that preserves the pre-task source-target and delivery-routing contract.

**Evidence**

- file: `docs/plugins/reference/deliberation.md`

### [BLOCKING] finding-002 - verification_evidence_missing / evidence

**Scope:** `goal-005`, `goal-006`  
**Claim:** Canonical contract provenance verification and focused Deliberation intake/contract tests must have passing canonical verification evidence.

**Observed**
The caller-supplied canonical Test Gate status is not run and explicitly states that no Test Gate evidence exists; the supplied TDD proof covers only the focused Discord regression and is not canonical Test Gate evidence for these goals.

**Why this matters**
Goals 005 and 006 are explicit verification-evidence goals, and Acceptance cannot infer their passing state from checkpoint prose or execute the suites itself.

**Required action**
Provide canonical Test Gate evidence showing the contract generation/provenance verification and focused Deliberation intake/contract tests passed.

**Evidence**

- test-gate: `canonical Test Gate status: not run; no evidence`
- artifact: `plans/checkpoints/quick-cove-1732.red-green-proof.md`

### [BLOCKING] finding-003 - required_artifact_missing / correctness

**Scope:** `goal-007`  
**Claim:** The task must deliver a final note documenting every supported sender-indicator source field and the serialized KM contract shape.

**Observed**
No final note was supplied. The checkpoint only states completion and does not enumerate the source fields or serialized shape; documentation changes elsewhere do not satisfy the explicitly required final-note deliverable.

**Why this matters**
Goal 007 makes the final note itself a required deliverable, and the supplied artifacts do not contain that deliverable's required content.

**Required action**
Provide the task final note with exact Discord and Slack source-field precedence for each indicator and the serialized senderIdentityHints shape consumed by KM.

**Evidence**

- artifact: `plans/checkpoints/quick-cove-1732.checkpoint.md`
- file: `docs/plugins/reference/deliberation.md`

## Context

- Original task: `quick-cove-1732`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Use the concrete goals and findings above to repair the untrustworthy task outcome. Make the minimum implementation and test changes needed, and verify the repaired behavior.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-08-30_quick-cove-1732_deliberation-intake-preserve-trusted-sender-names-for.md` for full context. Focus only on the unmet goals listed above.

## Previous attempt: acceptance context

**Already done (do NOT redo):**

- goal-001: A Discord event with trusted sender metadata reaches the Deliberation listener request with the opaque ID plus bounded display-name/username indicators.
- goal-002: No sender indicator is sourced from user-controlled envelope text.
- goal-003: Missing display-name/username fields remain valid and preserve current behavior.

## Recent learnings from previous attempt

### deliberation-textual-sender-hints-stay-non-authoritative.md

```
---
title: "Textual sender hints stay outside identity authority"
date: 2026-08-31
category: architecture
component: shared
tags: [deliberation, discord, slack, identity, plugin-sdk]
file_type: decisions
---

# Keep textual sender hints outside identity authority

Exclusive channel claims run before ordinary finalized-message mapping. Adding sender metadata only to `FinalizedMsgContext` or generic hook mappers therefore does not reach configured Discord or Slack owners. Each channel must project authenticated native identity facts into the early `inbound_claim` event, while the owner plugin no
```

## Implementation session log excerpt (last 50 lines)

```
, and 2048 serialized bytes. Aliases are case-insensitively deduplicated. Message text never supplies hints, and sender-ID-only events remain valid.

Verification passed:

- Discord, Slack, mapper, Deliberation intake/client/contract/producer tests
- `pnpm build`
- Deliberation, Discord, and Slack typechecks
- Targeted extension lint
- Docs MDX and `git diff --check`
- Contract JSON validation and provenance hashes
- Scoped autoreview: clean
- RED/GREEN proof: `plans/checkpoints/quick-cove-1732.red-green-proof.md`
- Learning: `learnings/architecture/deliberation-textual-sender-hints-stay-non-authoritative.md`

`pnpm check:changed` could not dispatch because Blacksmith was unavailable and the configured Azure/AWS Crabbox providers lacked local authentication. All task-scoped checks passed.

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
