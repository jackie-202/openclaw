# [acceptance-fix] Converge OpenClaw Deliberation intake and mirrored KM contract: goal-001: Converge OpenClaw Deliberation intake and mirrored KM contract

Auto-created by the monitor because the original task `quick-reef-1568` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-001: Converge OpenClaw Deliberation intake and mirrored KM contract

### [BLOCKING] finding-001 - required_tdd_proof_missing / evidence

**Scope:** `goal-001`  
**Claim:** The caller-declared mandatory TDD proof must demonstrate a complete behavior-linked RED/GREEN cycle for the intake and contract change.

**Observed**
The supplied proof contains RED metadata and an exit code, but the visible output starts with the new sourceThreadId client assertion already passing and supplies neither the relevant failing assertion nor a GREEN phase with its outcome; the checkpoint's summary assertion does not replace that proof.

**Why this matters**
With tddRequired true, an exit code alone does not establish that the required behavior failed before implementation and passed afterward.

**Required action**
Provide the complete task-scoped RED/GREEN proof showing the intended sourceThreadId or contract assertion failing in RED and the same focused command passing in GREEN.

**Evidence**
- artifact: `plans/checkpoints/quick-reef-1568.red-green-proof.md:RED Phase`
- artifact: `plans/checkpoints/quick-reef-1568.checkpoint.md:Last completed`

### [BLOCKING] finding-002 - required_artifact_missing / correctness

**Scope:** `goal-001`  
**Claim:** The task requires a final note that lists verification commands and results, identifies the intentional OpenClaw overlay retained outside the owner mirror, and records any owner-pin follow-up.

**Observed**
The supplied checkpoint reports aggregate pass counts and blockers and mentions the owner-pin follow-up, but it does not list the executed commands with their results or identify the retained OpenClaw overlay; no separate final note was supplied.

**Why this matters**
The explicit acceptance record is incomplete, so reviewers cannot distinguish the generic owner mirror from intentionally stricter OpenClaw constraints or map reported outcomes to commands.

**Required action**
Supply the required final note with each executed command and result, the retained OpenClaw overlay and rationale, and the unresolved owner provenance pin follow-up.

**Evidence**
- file: `plans/tasks/2026-08-17_converge-openclaw-deliberation-intake-and-mirrored-km-contra.md:Acceptance`
- artifact: `plans/checkpoints/quick-reef-1568.checkpoint.md:Last completed`


## Context

- Original task: `quick-reef-1568`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Use the concrete goals and findings above to repair the untrustworthy task outcome. Make the minimum implementation and test changes needed, and verify the repaired behavior.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-08-17_quick-reef-1568_converge-openclaw-deliberation-intake-and-mirrored-km.md` for full context. Focus only on the unmet goals listed above.

## Recent learnings from previous attempt


### deliberation-generic-wire-provider-overlay-separation.md

```
---
title: "Deliberation: oddělit generický owner wire od provider overlay"
date: 2026-08-17
category: architecture
component: backend
tags: [deliberation, contracts, wire-schema, provider-adapters, provenance]
file_type: rules
---

# Deliberation owner mirrors and provider overlays are separate contracts

When KM owns a provider-generic wire target such as `{ provider, accountId, channelId, threadId? }`, OpenClaw must mirror that generic shape exactly at durable HTTP boundaries. Provider-specific restrictions, such as Slack timestamp grammar or the set of adapters OpenClaw can actually load, 
```

## Implementation session log excerpt (last 50 lines)

```
68.red-green-proof.md`.
- Learning saved: `learnings/architecture/deliberation-generic-wire-provider-overlay-separation.md`.

Verification:

- Focused tests: 138 passed.
- Full Deliberation suite: 240 passed.
- `pnpm tsgo:extensions`: passed.
- `pnpm tsgo:extensions:test`: passed.
- `pnpm build`: passed.
- Scoped formatting and `git diff --check`: passed.
- Fallback scoped review: no actionable findings.

Proof gaps:

- `pnpm check:changed` could not start because the local Blacksmith CLI is unavailable.
- Scoped lint is blocked by the unrelated missing `primeChannelOutboundSendMock` export.
- Autoreview exceeded its worktree-wide 1,048,576-character bundle limit; the scoped fallback review was clean.
- Exact replacement KM owner revision and hashes remain pending owner-supplied evidence.

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
