# [acceptance-fix] [acceptance-fix] Deliberation cross-provider E2E and Slack pilot readiness: goal-001: Deterministic E2E coverage proves : goal-001: [acceptance-fix] Deliberation cross-provider E2E and Slack pilot readi

Auto-created by the monitor because the original task `quick-fork-8802` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-001: [acceptance-fix] Deliberation cross-provider E2E and Slack pilot readiness: goal-001: Deterministic E2E coverage proves

### [BLOCKING] finding-001 - required_implementation_missing / correctness

**Scope:** `goal-001`  
**Claim:** The supplied task material includes reviewable deterministic E2E implementation proving Slack root and reply inputs reach only the explicit Discord target with identity separation and one provider call.

**Observed**
The supplied task-scoped diff contains documentation, changelog, and contract-fixture changes, but it does not include extensions/deliberation/src/orchestration.test.ts or another concrete test implementation showing the required Slack root/reply orchestration assertions. Checkpoints and TDD GREEN summaries report passing tests, but their prose and stdout do not expose the omitted test semantics for review.

**Why this matters**
Goal-001 requires deterministic repository-local coverage of root/reply identity separation, exact Discord-only routing, and one provider call. Claimed test results cannot establish those semantics when the implementation under test is absent from the caller-supplied review material.

**Required action**
Supply the task-scoped orchestration test implementation that exercises Slack root and reply inputs through the public Deliberation seams and asserts child/root identity separation, the exact Discord destination, one Discord call, and zero Slack calls.

**Evidence**
- file: `task-scoped diff`
- artifact: `plans/checkpoints/quick-fork-8802.checkpoint.md`
- artifact: `plans/checkpoints/quick-fork-8802.red-green-proof.md`
- file: `plans/tasks/2026-08-16_followup-quick-fork-8802-deliberation-cross-provider-e2e-and-slack-pilot-readiness.md`


## Context

- Original task: `quick-fork-8802`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Use the concrete goals and findings above to repair the untrustworthy task outcome. Make the minimum implementation and test changes needed, and verify the repaired behavior.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-08-17_quick-fork-8802_deliberation-cross-provider-e2e-and-slack-pilot-readiness.md` for full context. Focus only on the unmet goals listed above.

## Recent learnings from previous attempt


### quick-fork-8802-prove-replay-at-reservation-fence.md

```
---
title: "Prove no-duplicate delivery at the reservation fence"
date: 2026-08-17
category: test-failures
component: backend
tags: [deliberation, replay, fencing, idempotency, testing]
file_type: rules
---

# Prove no-duplicate delivery at the reservation fence

When a durable delivery test claims that a provider send is not retried after ambiguous or rejected completion evidence, a second poll with an empty ready queue is insufficient. It only proves that no work causes no send.

Replay the same ready item on the next poll and have the durable owner return its canonical conflict outcome from
```

## Implementation session log excerpt (last 50 lines)

```
nsupported-destination and reservation-conflict replay fencing tests in `extensions/deliberation/src/final-adapter.test.ts:239`.
- Added stale reservation and invocation/completion target-drift coverage in `extensions/deliberation/src/km-client.test.ts:821`.
- Completed checkpoint and RED/GREEN evidence.
- Saved learning at `learnings/test-failures/quick-fork-8802-prove-replay-at-reservation-fence.md`.

Verification:

- Focused Deliberation: 89 tests passed.
- Full Deliberation: 231 tests passed.
- Required Slack outbound: 30 tests passed.
- Extension production/test typechecks: passed.
- Formatting: passed.
- Full build: passed.
- Autoreview actionable replay finding resolved.
- Extension lint remains blocked by the pre-existing missing `primeChannelOutboundSendMock` SDK boundary export.

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
