# [acceptance-fix] Deliberation cross-provider E2E and Slack pilot readiness: goal-001: Deterministic E2E coverage proves Slack root and reply inputs reach on

Auto-created by the monitor because the original task `bright-reef-1988` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-001: Deterministic E2E coverage proves Slack root and reply inputs reach only the explicit Discord target with correct identity separation and one provider call.
- goal-002: Provider matrix and fail-closed scenarios are covered without external services.
- goal-003: Existing Discord and relevant Slack outbound suites pass.

### [BLOCKING] finding-001 - required_implementation_missing / correctness

**Scope:** `goal-001`, `goal-002`  
**Claim:** The delivered task material includes reviewable deterministic orchestration, provider-matrix, and fail-closed test implementations covering the required scenarios.

**Observed**
The task-scoped diff contains documentation and contract-fixture changes but no orchestration.test.ts, final-adapter test matrix, or other test implementation showing Slack root/reply identity separation, exact Discord-only dispatch, the four provider cells, or the required fail-closed scenarios. The TDD artifact reports two passing tests but does not supply their implementation.

**Why this matters**
Goals 001 and 002 require concrete repository-local coverage; checkpoint and test-result prose cannot establish the semantics of omitted test code.

**Required action**
Supply the task-scoped test implementation that exercises the public Deliberation seams for Slack root and reply delivery, all four provider combinations, and the specified fail-closed cases without external services.

**Evidence**
- diff: `task-scoped diff`
- artifact: `plans/checkpoints/bright-reef-1988.red-green-proof.md`
- plan: `plans/2026-08-17_bright-reef-1988_deliberation-cross-provider-e2e-and-slack-pilot-readiness.md`

### [BLOCKING] finding-002 - verification_evidence_missing / evidence

**Scope:** `goal-003`  
**Claim:** The supplied final evidence demonstrates that both existing Discord coverage and the specifically relevant Slack outbound suites passed.

**Observed**
The checkpoint records the Deliberation suite and extension test typecheck, but it does not record the required Slack outbound command or result for extensions/slack/src/send.blocks.test.ts and extensions/slack/src/outbound-adapter.test.ts. The canonical Test Gate status is not run and supplies no replacement evidence.

**Why this matters**
Goal 003 explicitly requires passing existing Discord and relevant Slack outbound suites; the supplied artifacts leave the Slack outbound half unverified.

**Required action**
Provide canonical Test Gate evidence or a supplied task artifact recording the exact relevant Slack outbound suite command and successful result.

**Evidence**
- artifact: `plans/checkpoints/bright-reef-1988.checkpoint.md`
- test-gate: `canonical Test Gate status: not run`
- file: `plans/tasks/2026-08-15_deliberation-cross-provider-e2e-pilot-readiness.md:Verification`


## Context

- Original task: `bright-reef-1988`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Use the concrete goals and findings above to repair the untrustworthy task outcome. Make the minimum implementation and test changes needed, and verify the repaired behavior.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-08-17_bright-reef-1988_deliberation-cross-provider-e2e-and-slack-pilot-readiness.md` for full context. Focus only on the unmet goals listed above.

## Previous attempt: acceptance context


**Already done (do NOT redo):**
- goal-004: Runbook is bounded, actionable, secret-free, and preserves Slack source-only pilot rules.
- goal-005: Final note includes test evidence and an explicit `READY`/`NOT READY` verdict.

## Recent learnings from previous attempt


### deliberation-readiness-evidence-gate.md

```
---
title: "Deliberation: keep rollout readiness separate from local behavior proof"
date: 2026-08-17
category: architecture
component: backend
tags: [deliberation, slack, readiness, evidence, e2e, fail-closed]
file_type: rules
---

# Keep rollout readiness separate from local behavior proof

A hermetic registered-plugin test can prove the OpenClaw side of a cross-provider flow without proving that an external owner is ready for rollout. For Deliberation, the useful local harness registers the real plugin and joins captured intake hooks, keyed Slack child-to-thread state, Gateway history reads
```

## Implementation session log excerpt (last 50 lines)

```
ck runbook in `extensions/deliberation/README.md`.
- Recorded genuine RED/GREEN proof in `plans/checkpoints/bright-reef-1988.red-green-proof.md`.
- Saved learning in `learnings/architecture/deliberation-readiness-evidence-gate.md`.

Verification:

- Deliberation: 226 tests passed.
- Slack outbound: 30 tests passed.
- `pnpm tsgo:extensions` and `pnpm tsgo:extensions:test`: passed.
- Scoped oxlint and formatting: passed.
- Autoreview: no accepted actionable findings.
- Broad extension lint remains blocked by the pre-existing missing Slack `primeChannelOutboundSendMock` boundary export.

Readiness remains blocked by missing stable final evidence for batch seq 2 and seq 3, plus the mandatory proposal source being outside the permitted workspace. No rollout or live configuration was activated.

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
