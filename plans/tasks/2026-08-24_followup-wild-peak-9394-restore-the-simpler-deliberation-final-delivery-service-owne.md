# [acceptance-fix] Restore the simpler Deliberation final-delivery service owner: goal-001: The plugin registers exactly one `deliberation-final-delivery` service

Auto-created by the monitor because the original task `quick-wave-8748` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-001: The plugin registers exactly one `deliberation-final-delivery` service when Deliberation is enabled and none when disabled.
- goal-002: One service tick processes at most one ready delivery through the existing adapter; overlapping ticks cannot cause concurrent delivery attempts.
- goal-003: Discord and Slack routing/configuration matrix tests from the latest proposal remain green, including account-aware root/thread output.
- goal-004: The production architecture needs only the existing OpenClaw plugin service plus the existing KM runner; no `deliberation-v2-final-sender` cron is required.
- goal-005: The `deliver-once` CLI and callable-only replacement are absent unless the final note identifies an independently required contract and proves it does not create or imply a second scheduler.
- goal-006: No live state or external provider is touched.

### [BLOCKING] finding-001 - required_implementation_missing / correctness

**Scope:** `goal-001`, `goal-002`, `goal-004`, `goal-005`  
**Claim:** The task must restore the registered bounded final-delivery service and remove the rejected deliver-once/callable-only architecture.

**Observed**
The supplied task-scoped diff changes only extensions/deliberation/src/plugin.test.ts to assert one service and one CLI registration and adds a learning artifact entry; it contains no production service wrapper or registration change and no deletion of the three callable-only artifacts named by the plan.

**Why this matters**
Plans, checkpoint claims, and RED/GREEN stdout do not deliver the required production implementation in the caller-supplied task-scoped changes, so the service ownership, non-overlap behavior, single-scheduler architecture, and callable removal cannot be accepted.

**Required action**
Supply task-scoped production changes that register exactly one enabled final-delivery service, implement the bounded non-overlapping adapter loop, and remove the deliver-once/callable-only residue without introducing a second scheduler.

**Evidence**

- file: `task-scoped diff:extensions/deliberation/src/plugin.test.ts`
- plan: `/Users/michal/Projects/openclaw-fork/plans/2026-08-24_quick-wave-8748_restore-the-simpler-deliberation-final-delivery-service.md`

### [BLOCKING] finding-002 - verification_evidence_missing / evidence

**Scope:** `goal-003`, `goal-004`, `goal-005`, `goal-006`  
**Claim:** The final note must provide exact verification results, identify preserved Discord/Slack matrix behavior and removed callable artifacts, and confirm prohibited live/build/deployment actions did not occur.

**Observed**
No final note is supplied. The checkpoint gives aggregate pass counts and a brief no-build statement, but it does not list the exact commands/results, enumerate the preserved account-aware root/thread matrix cases, enumerate the three removed callable artifacts, or provide the required complete no-live-state/provider/config/install/restart/deployment declaration. Test Gate was not run and supplies no canonical evidence.

**Why this matters**
These details are explicitly required verification evidence; summary claims and a single plugin-test RED/GREEN proof do not establish the matrix, architecture cleanup, and no-live-touch boundaries.

**Required action**
Supply the required final note with exact commands and outcomes, preserved Discord/Slack routing cases, removed second-cron/callable artifacts, any repository-local follow-up, and explicit confirmation that no live send/state/config mutation, build/install, Gateway restart, or deployment occurred.

**Evidence**

- artifact: `/Users/michal/Projects/openclaw-fork/plans/checkpoints/quick-wave-8748.checkpoint.md`
- artifact: `/Users/michal/Projects/openclaw-fork/plans/checkpoints/quick-wave-8748.red-green-proof.md`
- test-gate: `status:not-run`

## Context

- Original task: `quick-wave-8748`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Use the concrete goals and findings above to repair the untrustworthy task outcome. Make the minimum implementation and test changes needed, and verify the repaired behavior.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-08-24_quick-wave-8748_restore-the-simpler-deliberation-final-delivery-service.md` for full context. Focus only on the unmet goals listed above.

## Recent learnings from previous attempt

### deliberation-final-delivery-single-owner.md

```
---
title: "Obnova jednoho vlastníka finálního doručení bez návratu routingových změn"
date: 2026-08-24
category: architecture
component: general
tags: [openclaw, deliberation, service-ownership, tdd, routing]
file_type: decisions
---

# Restore an existing runtime owner without reverting adjacent contracts

When an uncommitted proposal replaces a working plugin service with a callable or second scheduler, first compare the changed files against the known-good commit. If the accepted routing/configuration work is already independent, reverse only the scheduler-specific diff: restore the servic
```

## Implementation session log excerpt (last 50 lines)

```
st src/plugins/source-checkout-runtime.test.ts` → 3 passed after retrying an initial tool timeout.
- `pnpm test extensions/deliberation` → 295 passed.
- `pnpm tsgo:extensions` → passed.
- `pnpm tsgo:extensions:test` → passed.
- `pnpm lint:extensions` → passed.
- Formatting and `git diff --check` → passed.
- Callable/second-cron residue search → no matches.
- Autoreview → clean, no actionable findings.

Proof: `plans/checkpoints/quick-wave-8748.red-green-proof.md` contains both RED and GREEN phases.

No build, package installation, deployment, Gateway restart, live send, state/config mutation, or external repository inspection was performed. If `km-system` currently installs a `deliberation-v2-final-sender` cron, that repository should remove that cron registration as a separate follow-up.

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
