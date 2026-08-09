# [acceptance-fix] Plugin-confined sole Deliberation final provider adapter: goal-001: Plugin-confined sole Deliberation final provider adapter

Auto-created by the monitor because the original task `dark-reef-5008` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-001: Plugin-confined sole Deliberation final provider adapter

### [BLOCKING] finding-001 - required_implementation_missing / correctness

**Scope:** `goal-001`  
**Claim:** The required plugin-confined final-source provider adapter was not delivered, and the supplied partial-result evidence does not meet the task's only permitted blocker contract.

**Observed**
The task-scoped diff contains no extensions/deliberation/src/final-adapter.ts or final-delivery KM adapter changes. The supplied RED/GREEN proof states that no production code was added because the required KM envelope/invocation acknowledgement and public account-bound one-shot sender are absent. The supplied checkpoint and learning artifacts describe those gates, but no supplied task result provides the required narrow blocker with the smallest proposed core seam.

**Why this matters**
The goal requires one checked-in adapter as the sole provider boundary. The task permits a partial result only when plugin-only implementation is impossible and an evidence-backed blocker in the task result specifies the required capability, inspected public APIs, exact impossibility reason, and smallest proposed core seam. The supplied materials establish absent gates but do not supply that complete permitted blocker result.

**Required action**
Deliver the plugin-confined adapter after both required contracts exist, or provide the task-result blocker required by the task contract, including the smallest proposed generic core seam without changing core.

**Evidence**

- file: `extensions/deliberation/src/final-adapter.ts`
- artifact: `plans/checkpoints/dark-reef-5008.red-green-proof.md`
- artifact: `plans/checkpoints/dark-reef-5008.checkpoint.md`
- artifact: `learnings/architecture/dark-reef-5008-gate-provider-adapters-on-public-seams.md`
- file: `plans/tasks/2026-08-06_deliberation-v2-05b-plugin-confined-final-adapter.md`

## Context

- Original task: `dark-reef-5008`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Use the concrete goals and findings above to repair the untrustworthy task outcome. Make the minimum implementation and test changes needed, and verify the repaired behavior.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-08-07_dark-reef-5008_plugin-confined-sole-deliberation-final-provider-adapter.md` for full context. Focus only on the unmet goals listed above.

## Recent learnings from previous attempt

### dark-reef-5008-final-delivery-contract-gate.md

```
---
title: "Gate Deliberation final delivery on both contracts"
date: 2026-08-07
category: architecture
component: shared
tags: [deliberation, plugin-sdk, provider-delivery, authority]
file_type: rules
---

# Gate Deliberation Final Delivery On Both Contracts

The Deliberation final-delivery adapter cannot be implemented from a reservation alone. Before adding code, verify both independently owned contracts:

- KM supplies a pinned, immutable delivery envelope plus a durable provider-invoked acknowledgement.
- The public Plugin SDK supplies an account-bound, non-durable, one-shot sender that r
```

## Implementation session log excerpt (last 50 lines)

```
-file tmp/dark-reef-5008-learning.md --output learnings/architecture/dark-reef-5008-final-delivery-contract-gate.md
✓ Learning saved to learnings/architecture/dark-reef-5008-final-delivery-contract-gate.md
[0m
Implementation is correctly blocked by missing required contracts.

- KM’s checked-in wire contract lacks the Slice 5A immutable envelope and durable invocation acknowledgment.
- Public plugin APIs lack an account-bound, non-retrying one-shot sender. `sendDurableMessageBatch` is explicitly unsuitable.
- No production/core changes were made.
- Verified: focused ownership test passed; `pnpm tsgo:extensions` passed.
- Required RED/GREEN proof: `plans/checkpoints/dark-reef-5008.red-green-proof.md`
- Learning saved: `learnings/architecture/dark-reef-5008-final-delivery-contract-gate.md`

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
