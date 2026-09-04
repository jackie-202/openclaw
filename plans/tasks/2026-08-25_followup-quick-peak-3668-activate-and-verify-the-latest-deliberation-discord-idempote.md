# [acceptance-fix] Activate and verify the latest Deliberation Discord idempotency-key fix: goal-003: Relevant build and Deliberation tests pass.

Auto-created by the monitor because the original task `warm-cove-0653` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-003: Relevant build and Deliberation tests pass.

### [BLOCKING] finding-001 - verification_evidence_missing / evidence

**Scope:** `goal-003`  
**Claim:** Relevant build and Deliberation tests pass with canonical verification evidence.

**Observed**
The supplied final note reports local build and test passes, but the canonical Test Gate status is not run and no Test Gate evidence exists.

**Why this matters**
The caller assigns test execution and interpretation exclusively to Test Gate, so agent-authored local test summaries cannot establish the explicit test goal for acceptance.

**Required action**
Provide canonical Test Gate evidence establishing the relevant build and Deliberation test result.

**Evidence**

- test-gate: `canonical:not-run`
- artifact: `plans/checkpoints/warm-cove-0653.final-note.md:Verification`

## Context

- Original task: `warm-cove-0653`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Treat this as an evidence-only follow-up. Production-code changes are forbidden by default. You must inspect the parent implementation and evidence first, then supply only the missing acceptance evidence. Escalate only if that inspection lets you document a real implementation defect; in that case, make only the minimal fix with tests.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-08-25_warm-cove-0653_activate-and-verify-the-latest-deliberation-discord.md` for full context. Focus only on the unmet goals listed above.

## Previous attempt: acceptance context

**Already done (do NOT redo):**

- goal-001: Running Gateway PID/start time is newer than the final relevant build artifact.
- goal-002: Built/runtime code uses a provider idempotency key of at most 25 characters while KM attempt identity remains stable.
- goal-004: Plugin and listener deployment/health verification passes after restart.
- goal-005: No post-restart recurrence of the Discord idempotency-length rejection.
- goal-006: If fresh traffic exists, it reaches `SENT` with receipt evidence exactly once. Otherwise the final note clearly states that fresh-traffic E2E proof is still pending.
- goal-007: No terminal historical record is manually recovered or resent.

## Recent learnings from previous attempt

### warm-cove-0653-pnpm-global-link-without-setup.md

```
---
title: "Opravte source link bez pnpm setup"
date: 2026-08-25
category: tooling
component: tooling
tags: [openclaw, pnpm, global-link, gateway, deployment]
file_type: checklist
---

# Repair a source link without running pnpm setup

On a machine where `openclaw` was already globally linked, bare `pnpm link --global` failed with `ERR_PNPM_NO_GLOBAL_BIN_DIR` even though the shell PATH already contained `$HOME/Library/pnpm` and `/opt/homebrew/bin/openclaw` resolved to the intended checkout.

Do not run `pnpm setup` automatically during deployment verification because it edits shell configurati
```

## Implementation session log excerpt (last 50 lines)

```
rovider key remains 24 hex characters; KM `providerAttemptId` remains unchanged.
- Focused tests: `97/97` passed.
- KM integration: `39/39` passed.
- Build and singleton smoke passed.
- Plugin loaded with five hooks and `deliberation-final-delivery`.
- Deployment/listener convergence checks passed.
- Zero post-restart target errors or service failures.
- Historical failed record remained unchanged with one attempt.
- No fresh natural traffic appeared, so production E2E is explicitly `PENDING FRESH TRAFFIC`.
- Updated stale integration expectations in `extensions/deliberation/scripts/km-listener.cross-repo.ts:21`.
- Full evidence: `plans/checkpoints/warm-cove-0653.final-note.md:1`.
- Autoreview clean; learning saved to `learnings/tooling/warm-cove-0653-pnpm-global-link-without-setup.md:1`.

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
