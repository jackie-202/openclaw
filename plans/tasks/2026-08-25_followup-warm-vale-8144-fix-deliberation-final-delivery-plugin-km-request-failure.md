# [acceptance-fix] Fix Deliberation final-delivery plugin KM request failure: goal-001: Fix Deliberation final-delivery plugin KM request failure

Auto-created by the monitor because the original task `swift-crag-1214` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-001: Fix Deliberation final-delivery plugin KM request failure

### [BLOCKING] finding-001 - required_implementation_missing / correctness

**Scope:** `goal-001`  
**Claim:** The required narrow KM request-boundary correction and safe final-delivery warning implementation are absent from the supplied task-scoped implementation diff.

**Observed**
The supplied diff adds delivery-probe surfaces, lifecycle fixtures, documentation, and a semantically equivalent direct service registration, but shows no change to extensions/deliberation/src/km-client.ts or extensions/deliberation/src/final-adapter.ts implementing endpoint-prefix correction or operation/path/status/cause warning metadata.

**Why this matters**
The task explicitly requires fixing the proven plugin/KM-client request mismatch and improving bounded runtime diagnostics; fixtures and documentation alone do not deliver those runtime behaviors.

**Required action**
Provide the narrow request-boundary implementation in the owning plugin/client code and bounded final-delivery warning metadata while preserving authentication, protocol, reservation, destination, and unknown-outcome guards.

**Evidence**

- file: `extensions/deliberation/src/km-client.ts`
- file: `extensions/deliberation/src/final-adapter.ts`
- plan: `plans/2026-08-25_swift-crag-1214_fix-deliberation-final-delivery-plugin-km-request-failure.md`

### [BLOCKING] finding-002 - required_tdd_proof_missing / evidence

**Scope:** `goal-001`  
**Claim:** The caller-declared mandatory RED/GREEN TDD proof is incomplete in the supplied material.

**Observed**
The supplied proof records a timestamped failing RED command and failures, but supplies no timestamped GREEN phase command, exit status, or output; the checkpoint's summary assertion that GREEN exists is not concrete proof provenance.

**Why this matters**
The manifest declares tddRequired true and the task requires a genuine failing-before/passing-after lifecycle and diagnostic cycle, so RED evidence alone cannot establish the required TDD progression.

**Required action**
Supply the corresponding concrete GREEN proof for the same scoped behavior, including command provenance and passing outcome, without relying only on a checkpoint summary.

**Evidence**

- artifact: `plans/checkpoints/swift-crag-1214.red-green-proof.md`
- artifact: `plans/checkpoints/swift-crag-1214.checkpoint.md`

## Context

- Original task: `swift-crag-1214`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Use the concrete goals and findings above to repair the untrustworthy task outcome. Make the minimum implementation and test changes needed, and verify the repaired behavior.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-08-25_swift-crag-1214_fix-deliberation-final-delivery-plugin-km-request-failure.md` for full context. Focus only on the unmet goals listed above.

## Recent learnings from previous attempt

### deliberation-listener-process-can-lag-owner-source.md

```
---
title: "A current CLI and stale listener can disagree over the same spool"
date: 2026-08-25
category: runtime-errors
component: backend
tags: [openclaw, deliberation, km, listener, process-lifecycle, diagnostics]
file_type: rules
---

# A current CLI and stale listener can disagree over the same spool

When a Python operator CLI lists a ready record but an authenticated listener on the canonical host and port does not, do not assume the TypeScript client or credential is wrong. Compare the listener process start time with every imported projection and validation module, not only the listen
```

## Implementation session log excerpt (last 50 lines)

```
d unknown-outcome semantics.
- No production spool mutation, provider send, deployment, or restart occurred.

Verification:

- Focused tests: 157 passed.
- Isolated accepted KM lifecycle: 39 passed.
- `pnpm tsgo:extensions`: passed.
- `pnpm tsgo:extensions:test`: passed.
- Docs MDX, formatting, and `git diff --check`: passed.
- Extension lint remains blocked by two unrelated concurrent errors in `extensions/deliberation/src/delivery-probe.test.ts`.
- Autoreview: no accepted task findings remain.
- RED/GREEN proof: `plans/checkpoints/swift-crag-1214.red-green-proof.md`.
- Learning saved: `learnings/runtime-errors/deliberation-listener-process-can-lag-owner-source.md`.

Deployment and listener restart remain separate operator actions.

https://docs.openclaw.ai/plugins/reference/deliberation

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
