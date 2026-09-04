# [acceptance-fix] Fix Deliberation Discord root-channel delivery routing: goal-001: The production `Unknown Channel` failure mode is reproduced by a focus

Auto-created by the monitor because the original task `dark-vale-4951` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-001: The production `Unknown Channel` failure mode is reproduced by a focused regression test.
- goal-002: Ordinary Discord root-channel deliveries omit `threadId`.
- goal-003: Real Discord thread deliveries retain the actual thread channel ID.
- goal-004: No message snowflake is used as a Discord destination/thread ID.
- goal-005: Slack behavior and fail-closed route validation remain green.
- goal-006: Relevant tests and build/typecheck pass with recorded evidence.

### [BLOCKING] finding-001 - required_tdd_proof_missing / evidence

**Scope:** `goal-001`, `goal-002`, `goal-003`, `goal-004`  
**Claim:** The caller-required TDD cycle must include valid RED and GREEN proof for the focused Discord root-routing regression.

**Observed**
The supplied TDD proof contains the focused RED failure showing deliveryTarget.threadId equals the inbound message ID, but no GREEN phase or passing rerun is present in the supplied proof.

**Why this matters**
The manifest declares tddRequired=true, and RED-only provenance does not demonstrate the required implementation-after-test cycle.

**Required action**
Provide the matching GREEN capture for the identical focused command in the canonical TDD proof artifact.

**Evidence**

- artifact: `plans/checkpoints/dark-vale-4951.red-green-proof.md`
- plan: `plans/2026-08-25_dark-vale-4951_fix-deliberation-discord-root-channel-delivery-routing.md`

### [BLOCKING] finding-002 - verification_evidence_missing / evidence

**Scope:** `goal-005`, `goal-006`  
**Claim:** Slack/fail-closed behavior and the required relevant tests, build, and typecheck must have canonical recorded verification evidence.

**Observed**
The caller states that Test Gate was not run and that no Test Gate evidence exists; the supplied checkpoint gives summary claims but no canonical Test Gate result.

**Why this matters**
These goals explicitly require green and recorded verification, which cannot be established from implementation prose or checkpoint assertions when the canonical Test Gate has no evidence.

**Required action**
Supply canonical Test Gate evidence covering Slack and fail-closed route validation plus the relevant tests, build, and typecheck.

**Evidence**

- test-gate: `status:not-run; evidence:none`
- artifact: `plans/checkpoints/dark-vale-4951.checkpoint.md`

## Context

- Original task: `dark-vale-4951`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Treat this as an evidence-only follow-up. Production-code changes are forbidden by default. You must inspect the parent implementation and evidence first, then supply only the missing acceptance evidence. Escalate only if that inspection lets you document a real implementation defect; in that case, make only the minimal fix with tests.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-08-25_dark-vale-4951_fix-deliberation-discord-root-channel-delivery-routing.md` for full context. Focus only on the unmet goals listed above.

## Recent learnings from previous attempt

### deliberation-delivery-threads-are-not-event-identity.md

```
---
title: "Deliberation delivery threads are not event identity"
date: 2026-08-25
category: architecture
component: shared
tags: [deliberation, discord, routing, thread-identity, exactly-once]
file_type: rules
---

# Deliberation delivery threads are not event identity

In Deliberation admission, `providerEventId`, `sourceThreadId`, history identity, and the provider delivery target serve different owners. A Discord root message may still need its message ID for KM correlation, but that does not make the message snowflake a Discord channel or thread destination.

For a narrow routing repair,
```

## Implementation session log excerpt (last 50 lines)

```
ded route, intake, final-adapter, plugin, and producer regressions.
- Updated documentation: https://docs.openclaw.ai/plugins/reference/deliberation
- RED/GREEN evidence recorded in `plans/checkpoints/dark-vale-4951.red-green-proof.md`.
- Learning saved in `learnings/architecture/deliberation-delivery-threads-are-not-event-identity.md`.

Verification passed:

- 128 focused tests
- 315 Deliberation plugin tests
- Extension source/test type checks
- Focused formatting and lint
- Full build
- Built bundle inspection
- Built-plugin singleton smoke

Worktree-wide docs checks remain blocked by unrelated pre-existing errors in `docs/proposals/proposal-20260809-165021-f994b3_openclaw-upstream-sync-compatibility-review.md`. No deployment, restart, provider traffic, or production E2E was performed.

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
