# [acceptance-fix] Deliberation: validate fixtures, bound legacy config, and repair integration proof: goal-001: Deliberation: validate fixtures, bound legacy config, and repair integ

Auto-created by the monitor because the original task `calm-cove-1824` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-001: Deliberation: validate fixtures, bound legacy config, and repair integration proof

### [BLOCKING] finding-001 - verification_evidence_missing / evidence

**Scope:** `goal-001`  
**Claim:** Current cross-repository runtime proof for the repaired harness is required but absent.

**Observed**
The supplied checkpoint states that the cross-repository command stopped at provenance preflight because the configured KM checkout hashes did not match the pinned owner contract, leaving all runtime scenarios blocked; the supplied RED/GREEN proof covers only the contract and config tests.

**Why this matters**
The task explicitly requires refreshing the current cross-repository integration proof, executing named negative cases through the runtime path, and recording exact RED/GREEN commands for that same integration gate. A preflight-only attempt does not demonstrate those runtime scenarios or current producer-contract integration.

**Required action**
Provide caller-supplied current cross-repository RED/GREEN evidence from the same integration command using a hash-matched approved KM checkout, showing the repaired harness reaches and completes the named runtime scenarios while keeping external/live convergence explicitly unknown.

**Evidence**

- artifact: `plans/checkpoints/calm-cove-1824.checkpoint.md`
- artifact: `plans/checkpoints/calm-cove-1824.red-green-proof.md`
- plan: `plans/2026-08-22_calm-cove-1824_deliberation-validate-fixtures-bound-legacy-config-and.md`

## Context

- Original task: `calm-cove-1824`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Treat this as an evidence-only follow-up. Production-code changes are forbidden by default. You must inspect the parent implementation and evidence first, then supply only the missing acceptance evidence. Escalate only if that inspection lets you document a real implementation defect; in that case, make only the minimal fix with tests.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-08-22_calm-cove-1824_deliberation-validate-fixtures-bound-legacy-config-and.md` for full context. Focus only on the unmet goals listed above.

## Recent learnings from previous attempt

### 2026-08-22_hash-mismatch-is-a-gate-not-provenance-convergence.md

```
---
title: "Hash mismatch is a gate, not provenance convergence"
date: 2026-08-22
category: architecture
component: shared
tags: [deliberation, contracts, provenance, doctor, migration, integration]
file_type: rules
---

# Hash mismatch is a gate, not provenance convergence

When a mirrored external contract changes, do not refresh provenance from hashes alone. First compare the owner files semantically and run the same runtime gate. A current checkout can be newer while still being incompatible with the repository-local contract.

In the Deliberation integration gate, the configured KM checko
```

## Implementation session log excerpt (last 50 lines)

```
`.

**Verification**
- Focused contract/config/producer/doctor tests passed.
- `pnpm build` passed.
- `pnpm tsgo:extensions` passed.
- Scoped Oxlint, formatting, and docs MDX passed.
- Focused final review found no remaining issues.

**Remaining Gate**
- Cross-repository scenarios cannot execute because the configured KM checkout fails the owner-contract preflight. Its contract and fixture hashes differ semantically from the accepted contract, so provenance records it as mismatched and live status as unknown.
- `check:changed` was blocked by unavailable Testbox/AWS broker authentication.
- Extension test typecheck retains unrelated existing `history-read.test.ts` errors.
- Docs link audit retains 12 unrelated proposal-link failures.

https://docs.openclaw.ai/plugins/reference/deliberation

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
