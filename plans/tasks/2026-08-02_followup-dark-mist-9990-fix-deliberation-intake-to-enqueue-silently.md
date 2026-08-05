# [acceptance-fix] Fix deliberation intake to enqueue silently: goal-005: Existing fail-closed guard tests remain green.

Auto-created by the monitor because the original task `quick-cove-7908` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-005: Existing fail-closed guard tests remain green.
- goal-006: Focused deliberation plugin tests and the relevant core dispatch test pass.

### [BLOCKING] finding-001 - verification_evidence_missing / evidence

**Scope:** `goal-005`, `goal-006`
**Claim:** The required fail-closed guard, focused deliberation plugin, and core dispatch test pass evidence is absent.

**Observed**
The canonical Test Gate status is not run and supplies no evidence; the supplied RED/GREEN artifact covers only extensions/deliberation/src/hooks.test.ts, while the task evidence reports both proof-capture outcomes as unavailable.

**Why this matters**
Goals goal-005 and goal-006 explicitly require these tests to remain green or pass, but no caller-supplied canonical evidence establishes those outcomes.

**Required action**
Supply canonical Test Gate evidence establishing the required guard, focused plugin, and core dispatch test outcomes.

**Evidence**

- test-gate: `canonical:not-run`
- artifact: `plans/checkpoints/quick-cove-7908.red-green-proof.md`
- artifact: `plans/checkpoints/quick-cove-7908.evidence.md`

## Context

- Original task: `quick-cove-7908`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Treat this as an evidence-only follow-up. Production-code changes are forbidden by default. You must inspect the parent implementation and evidence first, then supply only the missing acceptance evidence. Escalate only if that inspection lets you document a real implementation defect; in that case, make only the minimal fix with tests.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-08-02_quick-cove-7908_fix-deliberation-intake-to-enqueue-silently.md` for full context. Focus only on the unmet goals listed above.

## Previous attempt: acceptance context

**Already done (do NOT redo):**

- goal-001: A realistic Discord source-channel claim matching `channel=discord`, `accountId=default`, and `conversationId=1494265174389948538` is accepted and queued.
- goal-002: The claim result is terminal (`handled: true`) and contains no public response text.
- goal-003: Regression coverage proves normal agent dispatch and send are not invoked after successful enqueue.
- goal-004: A non-source Discord channel is not claimed.

## Implementation session log excerpt (last 50 lines)

```
sions/deliberation/src/hooks.test.ts -- --reporter=verbose` -> expected 1 failure.
- GREEN: same command -> 16 passed.
- `pnpm test extensions/deliberation/src/plugin.test.ts -- --reporter=verbose` -> 1 passed.
- `pnpm test extensions/deliberation -- --reporter=verbose` -> 52 passed.
- Core focused test -> 1 passed, 192 skipped.
- `pnpm tsgo:extensions` -> passed.
- `pnpm tsgo:extensions:test` -> passed.
- `pnpm tsgo:core:test` -> passed.
- Scoped `oxlint`, format check, and `git diff --check` -> passed.
- Autoreview -> clean, no actionable findings.
- Build was not run because no build, package, or lazy-module boundary changed.

Proof: `plans/checkpoints/quick-cove-7908.red-green-proof.md`
Learning: `learnings/architecture/quick-cove-7908-terminal-inbound-claim-after-durable-intake.md`

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
