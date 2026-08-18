# [acceptance-fix] Reconcile OpenClaw with provider-neutral Deliberation owner contract: goal-005: Provenance contains the exact current owner revision and hashes only a

Auto-created by the monitor because the original task `cool-vale-1698` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-005: Provenance contains the exact current owner revision and hashes only after semantic verification.
- goal-006: Final note records exact commands/results and states the remaining rollout: host deploy verifier → full gateway restart → live smoke.

### [BLOCKING] finding-001 - verification_evidence_missing / evidence

**Scope:** `goal-005`  
**Claim:** The supplied acceptance material must demonstrate that provenance.json contains the exact current KM owner revision and owner-file hashes, refreshed only after semantic verification.

**Observed**
The supplied task-scoped diff does not include provenance.json, and the checkpoint only asserts completion without recording the owner revision, either owner-file SHA-256 value, or an ordering artifact that ties the refresh to semantic verification.

**Why this matters**
Without the exact pin and hashes in the caller-supplied material, acceptance cannot establish the provenance goal or distinguish a current semantically gated refresh from a stale or premature pin.

**Required action**
Supply the resulting provenance.json values and semantic-verification evidence showing the exact current owner revision and both owner-file hashes were recorded only after compatibility was established.

**Evidence**
- artifact: `plans/checkpoints/cool-vale-1698.checkpoint.md`
- file: `extensions/deliberation/contracts/provenance.json`

### [BLOCKING] finding-002 - required_artifact_missing / correctness

**Scope:** `goal-006`  
**Claim:** A final note must record the exact verification commands and results and state the remaining rollout sequence: host deploy verifier -> full gateway restart -> live smoke.

**Observed**
No final note is present in the supplied artifacts. The checkpoint gives aggregate outcomes and the rollout sequence, while the TDD proof records only its contract-test command; neither records the exact command/result set claimed for the focused 238/238 run, canonical 7/7 verifier, scoped format/lint, build, proof checks, and autoreview.

**Why this matters**
The checkpoint summary cannot satisfy the explicitly required auditable final-note deliverable because its claimed verification outcomes cannot be mapped to exact commands and results.

**Required action**
Provide the task final note with every exact verification command and corresponding result, plus the remaining rollout sequence in the required order.

**Evidence**
- artifact: `plans/checkpoints/cool-vale-1698.checkpoint.md`
- artifact: `plans/checkpoints/cool-vale-1698.red-green-proof.md`


## Context

- Original task: `cool-vale-1698`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Use the concrete goals and findings above to repair the untrustworthy task outcome. Make the minimum implementation and test changes needed, and verify the repaired behavior.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-08-18_cool-vale-1698_reconcile-openclaw-with-provider-neutral-deliberation-owner.md` for full context. Focus only on the unmet goals listed above.

## Previous attempt: acceptance context


**Already done (do NOT redo):**
- goal-001: Generic OpenClaw wire matches the provider-neutral KM owner semantics.
- goal-002: Concrete provider rules remain in OpenClaw-owned overlays/adapters.
- goal-003: Canonical cross-repository verifier passes 7/7.
- goal-004: Focused Deliberation contract, overlay, adapter, drafting-continuation, and delivery-fence tests pass.

## Recent learnings from previous attempt


### cool-vale-1698-provider-neutral-contract-verification.md

```
---
title: "Provider-neutral mirror verification must be semantic and executable"
date: 2026-08-18
category: architecture
component: shared
tags: [deliberation, contracts, provider-neutral, provenance, fencing]
file_type: checklist
---

# Provider-neutral mirror verification must be semantic and executable

For the Deliberation cross-repository contract, matching provenance hashes is not enough. The OpenClaw mirror can still be stale while `provenance.json` correctly pins the current KM owner files.

The reliable sequence is:

1. Read the canonical owner `deliveryTarget` schema and compare par
```

## Implementation session log excerpt (last 50 lines)

```
3…`.
- Updated lifecycle fixtures and threaded/non-threaded coverage.
- RED/GREEN proof: `plans/checkpoints/cool-vale-1698.red-green-proof.md`.
- Learning: `learnings/architecture/cool-vale-1698-provider-neutral-contract-verification.md`.

Verification:

- Focused Deliberation tests: 238/238 passed.
- `OPENCLAW_DELIBERATION_KM_ROOT=/Users/michal/.openclaw/workspace/km-system pnpm test:deliberation:km-integration`: 7/7 passed.
- `pnpm build`: passed.
- Scoped `oxfmt` and `oxlint`: passed.
- Repository lint wrapper was blocked by an unrelated existing Slack boundary DTS error.
- Final autoreview: clean, no accepted/actionable findings.

No services were restarted and no real transports were called. Remaining rollout: host deploy verifier → full gateway restart → live smoke, owned by Jackie.

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
