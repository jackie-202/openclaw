# [acceptance-fix] Deliberation delivery target: cross-repository integration coverage: goal-001: Deliberation delivery target: cross-repository integration coverage

Auto-created by the monitor because the original task `quick-crag-3748` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-001: Deliberation delivery target: cross-repository integration coverage

### [BLOCKING] finding-001 - required_implementation_missing / correctness

**Scope:** `goal-001`  
**Claim:** The required cross-repository final-delivery coverage does not complete the override route and its dependent provenance, durable-fencing, and fake-provider assertions end to end.

**Observed**
The supplied completion checkpoint states that only the default real-listener route passes and that full cross-repository verification is blocked because the isolated KM listener rejects deliveryTarget with HTTP 400 SCHEMA_INVALID.

**Why this matters**
The task requires both default and override routing through the real isolated listener/spool; rejection of the configured target before that flow completes leaves a required behavior absent regardless of Test Gate execution.

**Required action**
Provide a contract-compatible isolated KM listener/spool path where the override route reaches ready, reservation, invocation, fake-provider delivery, completion, provenance checks, and mismatch fencing as specified.

**Evidence**
- file: `plans/tasks/2026-08-14_deliberation-delivery-target-cross-repo-integration.md`
- artifact: `plans/checkpoints/quick-crag-3748.checkpoint.md`

### [BLOCKING] finding-002 - required_tdd_proof_missing / evidence

**Scope:** `goal-001`  
**Claim:** The caller-required TDD proof does not demonstrate the planned cross-repository routing behavior.

**Observed**
The supplied RED/GREEN artifact runs only extensions/deliberation/scripts/intake-producer.test.ts; its RED is an invalid producer input and its GREEN proves optional target serialization, while the plan requires the first RED/GREEN cycle in km-listener.cross-repo.ts for default reviewed delivery through the real listener, KM client, and final adapter.

**Why this matters**
A RED/GREEN cycle for producer schema forwarding is not proof that the task's cross-repository integration behavior was test-driven, and the supplied artifact contains no RED/GREEN evidence for that required default-route integration cycle.

**Required action**
Supply genuine RED and GREEN evidence for the cross-repository default-route scenario, using the planned integration harness and showing failure before implementation and success after implementation.

**Evidence**
- plan: `plans/2026-08-14_quick-crag-3748_deliberation-delivery-target-cross-repository-integration.md`
- artifact: `plans/checkpoints/quick-crag-3748.red-green-proof.md`


## Context

- Original task: `quick-crag-3748`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Use the concrete goals and findings above to repair the untrustworthy task outcome. Make the minimum implementation and test changes needed, and verify the repaired behavior.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-08-14_quick-crag-3748_deliberation-delivery-target-cross-repository-integration.md` for full context. Focus only on the unmet goals listed above.

## Recent learnings from previous attempt


### cross-repository-delivery-proof-contract-drift.md

```
---
title: "Cross-repository delivery proof and contract drift"
date: 2026-08-14
category: test-failures
component: e2e
tags: [openclaw, deliberation, km-system, integration-testing, durable-fencing]
file_type: checklist
---

# Cross-repository delivery tests must verify both routing and durable fences

An isolated final-delivery integration test needs more than an assertion on the fake provider call. The useful proof chain is:

1. Intake preserves the canonical source identity while independently carrying the configured final target.
2. The real spool is advanced through source-context captur
```

## Implementation session log excerpt (last 50 lines)

```
der calls, invocation/completion fencing, and durable evidence.
- Added RED/GREEN proof at `plans/checkpoints/quick-crag-3748.red-green-proof.md`.
- Autoreview passed with no actionable findings.
- Saved learning at `learnings/test-failures/cross-repository-delivery-proof-contract-drift.md`.

Verification:

- Focused tests: 35 passed.
- `pnpm tsgo:extensions`: passed.
- `pnpm build`: passed.
- Default real-listener route: passed.
- `pnpm test:deliberation:km-integration`: blocked because the available KM listener rejects intake `deliveryTarget` with `400 SCHEMA_INVALID`. Its executable contract is older than OpenClaw’s copied KM contract.
- `pnpm lint:extensions`: blocked by unrelated pre-existing Slack boundary DTS errors involving `primeChannelOutboundSendMock` and missing Vitest types.

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
