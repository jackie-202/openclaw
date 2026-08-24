# [acceptance-fix] RED-GREEN: enforce exclusive deliberation ownership before channel side effects: goal-001: A configured source causes zero ordinary acknowledgement, typing, auto

Auto-created by the monitor because the original task `dark-wave-6899` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-001: A configured source causes zero ordinary acknowledgement, typing, auto-thread, assistant-dispatch, or fallback side effects before/after claim.
- goal-004: Discord and Slack owner-path integration tests cover positive and negative cases.
- goal-006: Focused tests, relevant channel/plugin integration tests, build, lint, and canonical Test Gate pass.

### [BLOCKING] finding-001 - required_tdd_proof_missing / evidence

**Scope:** `goal-001`, `goal-004`  
**Claim:** The mandatory RED proof must demonstrate through the real inbound/channel owner path that an authenticated deliberation source reaches a pre-claim ordinary channel side effect before production changes.

**Observed**
The supplied RED phase fails only in src/plugin-sdk/channel-inbound.test.ts because resolveChannelInboundEventPolicy returned { allowDebounce: true } instead of { kind: separate }; it does not show acknowledgement, typing, auto-thread, abort, dispatch, or fallback occurring through Discord or Slack.

**Why this matters**
The task explicitly rejects non-side-effect RED failures and requires the complete real channel-path matrix before production edits. The supplied proof therefore does not establish the caller-required RED state despite later GREEN output.

**Required action**
Provide authentic RED/GREEN proof using the same focused command, with RED containing an assertion-level Discord or Slack owner-path failure caused by a real pre-claim ordinary side effect and GREEN showing that same assertion passing.

**Evidence**

- artifact: `plans/checkpoints/dark-wave-6899.red-green-proof.md:RED-Phase`
- file: `plans/tasks/2026-08-22_deliberation-exclusive-ownership-before-channel-side-effects.md:RED-GREEN-requirement`

### [BLOCKING] finding-002 - verification_evidence_missing / evidence

**Scope:** `goal-006`  
**Claim:** The explicitly required caller-owned canonical Test Gate must pass and provide canonical evidence.

**Observed**
The supplied Test Gate status is not run and states that no Test Gate evidence exists; the checkpoint likewise says the caller-owned canonical Test Gate supplied no run reference.

**Why this matters**
Local focused, integration, build, lint, or checkpoint claims cannot substitute for the explicitly required canonical Test Gate reference, and acceptance does not execute that gate.

**Required action**
Run the caller-owned canonical Test Gate and supply its passing canonical run reference for acceptance.

**Evidence**

- test-gate: `canonical:not-run`
- artifact: `plans/checkpoints/dark-wave-6899.checkpoint.md:Context-for-resume`

## Context

- Original task: `dark-wave-6899`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Treat this as an evidence-only follow-up. Production-code changes are forbidden by default. You must inspect the parent implementation and evidence first, then supply only the missing acceptance evidence. Escalate only if that inspection lets you document a real implementation defect; in that case, make only the minimal fix with tests.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-08-22_dark-wave-6899_red-green-enforce-exclusive-deliberation-ownership-before.md` for full context. Focus only on the unmet goals listed above.

## Previous attempt: acceptance context

**Already done (do NOT redo):**

- goal-002: Failure and disabled paths remain silent in the source while producing bounded diagnostics.
- goal-003: Exactly one authenticated pipeline owns the event; duplicate/ambiguous routes fail closed.
- goal-005: Existing non-deliberation channel behavior remains unchanged.

## Recent learnings from previous attempt

### exclusive-inbound-ownership-before-transport-effects.md

```
---
title: "Výhradní vlastnictví inbound události předchází transportním efektům"
date: 2026-08-23
category: architecture
component: shared
tags: [deliberation, inbound, ownership, discord, slack, fail-closed]
file_type: rules
---

# Exclusive inbound policy must identify one owner

A pre-debounce policy that returns only `allowDebounce: false` protects event identity but does not protect channel side effects. The host must preserve which plugin declared `dispatch: "exclusive"`, and channels must re-evaluate that decision from authenticated preflight facts before acknowledgement, typing, auto-
```

## Implementation session log excerpt (last 50 lines)

```
ate | exclusive | ambiguous` policy decisions.
- Discord and Slack now target the authenticated owner before typing, acknowledgement, threading, dispatch, or fallback.
- Exclusive failures and ambiguity remain silent and fail closed.
- Added loader-backed Discord/Slack integration coverage.
- RED/GREEN proof recorded at `plans/checkpoints/dark-wave-6899.red-green-proof.md`.
- Build, focused tests, channel regressions, formatting, and scoped lint passed.
- Final scoped review is clean.
- Saved learning at `learnings/architecture/exclusive-inbound-ownership-before-transport-effects.md`.

Remote `check:changed` was blocked by unavailable Blacksmith and missing Crabbox Azure/AWS authentication. No caller-owned canonical Test Gate reference was supplied.

https://docs.openclaw.ai/plugins/hooks

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
