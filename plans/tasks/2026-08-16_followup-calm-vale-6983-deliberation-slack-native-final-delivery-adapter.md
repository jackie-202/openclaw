# [acceptance-fix] Deliberation Slack-native final delivery adapter: goal-001: Canonical Slack destinations send once through the established Slack t

Auto-created by the monitor because the original task `bold-dune-7459` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-001: Canonical Slack destinations send once through the established Slack transport to exact account/channel/thread.
- goal-002: Both Slack → Slack and Discord → Slack work through destination-based dispatch.
- goal-003: Discord targets still use only Discord and all seq 4 regressions pass.
- goal-004: Provider receipts and bounded failure evidence are completed through KM without target drift.
- goal-005: Unsupported/malformed/conflicting destinations produce no provider call.

### [BLOCKING] finding-001 - required_implementation_missing / correctness

**Scope:** `goal-001`, `goal-002`, `goal-004`  
**Claim:** The required Slack final-delivery path and its KM-bound receipt/failure completion are not delivered.

**Observed**
The supplied checkpoint says the pinned KM owner contract remains Discord-only and that real Slack delivery requires an owner-side contract/runtime update; the supplied Deliberation reference also states that final delivery remains Discord-only and describes only one Discord provider call.

**Why this matters**
Without a Slack-authorized durable destination contract and runtime path, canonical Slack destinations cannot dispatch through Slack for either Slack or Discord sources, and Slack provider receipts or bounded failures cannot be completed through the required KM lifecycle.

**Required action**
Deliver the owner-authorized Slack destination contract/runtime support and destination-selected Slack adapter, preserving exact account/channel/thread and binding bounded Slack receipt or failure evidence to KM completion.

**Evidence**
- artifact: `/Users/michal/Projects/openclaw-fork/plans/checkpoints/bold-dune-7459.checkpoint.md`
- file: `docs/plugins/reference/deliberation.md`
- plan: `/Users/michal/Projects/openclaw-fork/plans/2026-08-16_bold-dune-7459_deliberation-slack-native-final-delivery-adapter.md`

### [BLOCKING] finding-002 - required_tdd_proof_missing / evidence

**Scope:** `goal-001`, `goal-002`, `goal-003`, `goal-004`, `goal-005`  
**Claim:** The caller-required TDD proof is incomplete in the supplied material.

**Observed**
The supplied TDD artifact contains proof-capture metadata and a RED Phase with a failing command, but no GREEN Phase or passing post-implementation evidence is supplied.

**Why this matters**
The manifest declares tddRequired true, so RED evidence alone does not establish the required RED-GREEN cycle.

**Required action**
Supply the corresponding GREEN phase in the canonical TDD proof, with post-implementation command provenance and successful evidence for the scoped behavior.

**Evidence**
- artifact: `/Users/michal/Projects/openclaw-fork/plans/checkpoints/bold-dune-7459.red-green-proof.md`
- file: `/Users/michal/Projects/openclaw-fork/plans/checkpoints/acceptance-runs/bold-dune-7459-acceptance-001/manifest.json:40`


## Context

- Original task: `bold-dune-7459`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Use the concrete goals and findings above to repair the untrustworthy task outcome. Make the minimum implementation and test changes needed, and verify the repaired behavior.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-08-16_bold-dune-7459_deliberation-slack-native-final-delivery-adapter.md` for full context. Focus only on the unmet goals listed above.

## Previous attempt: acceptance context


**Already done (do NOT redo):**
- goal-006: No live config enables Slack-native delivery.

## Recent learnings from previous attempt


### deliberation-slack-exact-account-and-receipt-evidence.md

```
---
title: "Preserve exact Slack delivery evidence across generic outbound seams"
date: 2026-08-17
category: architecture
component: backend
tags: [deliberation, slack, delivery, account-routing, error-classification, receipts]
file_type: rules
---

# Preserve exact Slack delivery evidence across generic outbound seams

A generic channel outbound adapter can accept an explicit `accountId` and still route through the wrong credentials when the provider's account resolver inherits channel-level defaults for unknown named accounts. Cross-provider durable delivery must verify that a non-default na
```

## Implementation session log excerpt (last 50 lines)

```
ests.

Verification:
- Focused tests: 98 passed.
- Full Deliberation suite: 218 passed.
- Extension production/test typechecks: passed.
- Targeted oxlint and oxfmt: passed.
- `pnpm build`: passed.
- RED/GREEN proof: `plans/checkpoints/bold-dune-7459.red-green-proof.md`.
- Learning: `learnings/architecture/deliberation-slack-exact-account-and-receipt-evidence.md`.

Limitations:
- Prettier is not installed; repository-standard oxfmt passed.
- The pinned KM contract at `extensions/deliberation/contracts/km-wire-v1.json:94` remains Discord-only. Slack delivery stays dormant and requires a KM-owner contract/runtime update before end-to-end activation.
- Structured autoreview exceeded its bundle limit due unrelated worktree files; the scoped review rerun found no repository-actionable findings.

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
