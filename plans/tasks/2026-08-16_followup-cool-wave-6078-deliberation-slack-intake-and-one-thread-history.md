# [acceptance-fix] Deliberation Slack intake and one-thread history: goal-001: A configured Slack root and a reply are admitted with `providerEventId

Auto-created by the monitor because the original task `calm-vale-7471` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-001: A configured Slack root and a reply are admitted with `providerEventId` equal to the actual message timestamp and a normalized thread identity equal to `thread_ts ?? message.ts`.
- goal-002: The history reader returns only that thread, with canonical `v1:slack:<account>:<channel>` provenance and existing message/byte bounds.
- goal-003: Conflicting, malformed, unconfigured, cross-account, or cross-channel Slack metadata fails closed.
- goal-004: Existing Discord route, history, freshness, and contract tests still pass.
- goal-005: Focused tests prove exact Slack timestamp validation/ordering and distinguish child-message identity from thread identity.
- goal-006: Final note records exact commands/results and any stable wire-contract detail needed by the following KM task.

### [BLOCKING] finding-001 - required_implementation_missing / correctness

**Scope:** `goal-001`, `goal-002`, `goal-003`  
**Claim:** The required Slack admission, child-to-thread correlation, and one-thread history implementation is absent from the supplied task-scoped change set.

**Observed**
The supplied diff changes CHANGELOG.agent.md, two documentation files, and extensions/deliberation/contracts/cutover-controls-v1.json, but supplies no production changes to Deliberation config, route matching, intake, history reading, Slack runtime seams, or keyed-state correlation.

**Why this matters**
Checkpoint prose asserting completion cannot establish delivered runtime behavior when the caller-supplied implementation diff contains none of the components required by goals 001 through 003.

**Required action**
Supply the production implementation for configured Slack root/reply admission, separate child and thread identities, exact thread-only bounded history, and fail-closed metadata validation.

**Evidence**
- artifact: `caller-supplied:task-scoped-diff`
- plan: `plans/2026-08-16_calm-vale-7471_deliberation-slack-intake-and-one-thread-history.md`

### [BLOCKING] finding-002 - required_tdd_proof_missing / evidence

**Scope:** `goal-005`  
**Claim:** The caller-required TDD proof is incomplete.

**Observed**
The supplied proof contains a RED phase with exit code 1 and failing Slack tests, but no GREEN phase or passing result is supplied; the manifest declares tddRequired true.

**Why this matters**
A RED-only artifact does not prove the required behavior was implemented through a completed RED/GREEN cycle, and checkpoint prose saying GREEN exists is not the proof itself.

**Required action**
Provide the complete run-scoped TDD proof with both RED and GREEN phases, including the exact focused command and successful GREEN result.

**Evidence**
- artifact: `plans/checkpoints/calm-vale-7471.red-green-proof.md`
- artifact: `plans/checkpoints/calm-vale-7471.checkpoint.md`

### [BLOCKING] finding-003 - required_artifact_missing / correctness

**Scope:** `goal-006`  
**Claim:** The required final note is absent from the supplied artifacts.

**Observed**
The supplied checkpoint gives a high-level completion summary, but no final note records the exact verification commands and results or a stable wire-contract handoff detail for the following KM task.

**Why this matters**
Goal 006 makes that final note a deliverable; a summary checkpoint does not contain the required exact command/result record or the KM-facing contract handoff.

**Required action**
Provide the final note with exact commands and outcomes and the stable Slack wire-contract details needed by the next KM task.

**Evidence**
- artifact: `plans/checkpoints/calm-vale-7471.checkpoint.md`
- file: `plans/tasks/2026-08-15_deliberation-slack-intake-one-thread-history.md`

### [BLOCKING] finding-004 - unknown / correctness

**Scope:** `goal-004`  
**Claim:** The task-scoped change set contains broad unrelated semantic contract and final-delivery changes that prevent a trustworthy Discord contract-regression assessment.

**Observed**
The diff rewrites extensions/deliberation/contracts/cutover-controls-v1.json with health, identity, intake, delivery-envelope, and reservation semantics and documents final sender polling/delivery behavior, although the evaluated task is limited to Slack intake and one-thread history and explicitly forbids unrelated refactors.

**Why this matters**
This is material protocol and behavior churn rather than incidental formatting, no concurrent assignment was supplied for exclusion, and it obscures whether the existing Discord contract was preserved as required by goal 004.

**Required action**
Remove the unrelated contract/final-delivery changes from this task-scoped change set or supply them under an independently attributable task before re-running acceptance.

**Evidence**
- artifact: `caller-supplied:task-scoped-diff`
- file: `extensions/deliberation/contracts/cutover-controls-v1.json`
- file: `docs/plugins/reference/deliberation.md`


## Context

- Original task: `calm-vale-7471`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Use the concrete goals and findings above to repair the untrustworthy task outcome. Make the minimum implementation and test changes needed, and verify the repaired behavior.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-08-16_calm-vale-7471_deliberation-slack-intake-and-one-thread-history.md` for full context. Focus only on the unmet goals listed above.

## Recent learnings from previous attempt


### deliberation-slack-routing-identity-outside-closed-wire.md

```
---
title: "Keep Slack routing identity outside a closed external wire"
date: 2026-08-16
category: architecture
component: shared
tags: [deliberation, slack, thread-history, plugin-state, runtime-context, wire-contract]
file_type: rules
---

# Keep provider routing identity outside a closed external wire

When a provider needs a conversation key that the accepted external request does not carry, do not overload the provider event ID or channel-scoped source identity and do not add an unowned wire field.

For Deliberation Slack intake, keep three facts distinct:

- `providerEventId`: the admitt
```

## Implementation session log excerpt (last 50 lines)

```
ration

**Verification**
- Required six-file Vitest command: 117 passed.
- Focused Slack tests: 93 passed.
- `pnpm tsgo:core`: passed.
- `pnpm tsgo:extensions`: passed.
- `pnpm tsgo:extensions:test`: passed.
- Scoped `oxfmt --check`: passed.
- `pnpm format:docs:check`: passed.
- `pnpm build`: passed.
- RED/GREEN proof verified at `plans/checkpoints/calm-vale-7471.red-green-proof.md`.
- Autoreview findings affecting changed paths were fixed.

The oxlint wrapper remains blocked by the pre-existing missing `primeChannelOutboundSendMock` Slack boundary export. Two unrelated pre-existing `final-adapter.ts` plugin tests also fail around durable delivery target selection; neither was modified.

Learning saved at `learnings/architecture/deliberation-slack-routing-identity-outside-closed-wire.md`.

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
