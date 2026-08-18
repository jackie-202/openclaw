# [acceptance-fix] [acceptance-fix] Converge Deliberation contract provenance and rollout readiness: goal-002: The manifest is accepted by : goal-001: [acceptance-fix] Converge Deliberation contract provenance and rollout

Auto-created by the monitor because the original task `calm-dune-9914` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-001: [acceptance-fix] Converge Deliberation contract provenance and rollout readiness: goal-002: The manifest is accepted by

### [BLOCKING] finding-001 - verification_evidence_missing / evidence

**Scope:** `goal-001`  
**Claim:** Repository-local validator acceptance is not established by supplied verdict-grade evidence.

**Observed**
The supplied material contains no canonical Test Gate reference or validator acceptance artifact. The RED/GREEN proof is task-authored prose about a focused contract test, while the stated Test Gate status is not run.

**Why this matters**
The goal requires that the manifest be accepted by the repository-local validator and no longer report an invalid provenance manifest. Without canonical validator evidence, that required outcome cannot be verified; task prose and stdout are not verdict data.

**Required action**
Provide the canonical repository-local validator acceptance artifact or canonical Test Gate reference establishing that the current manifest is accepted without an invalid provenance-manifest report.

**Evidence**
- artifact: `plans/checkpoints/calm-dune-9914.red-green-proof.md:20-30`
- plan: `plans/2026-08-17_calm-dune-9914_converge-deliberation-contract-provenance-and-rollout.md:82-85`


## Context

- Original task: `calm-dune-9914`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Treat this as an evidence-only follow-up. Production-code changes are forbidden by default. You must inspect the parent implementation and evidence first, then supply only the missing acceptance evidence. Escalate only if that inspection lets you document a real implementation defect; in that case, make only the minimal fix with tests.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-08-17_calm-dune-9914_converge-deliberation-contract-provenance-and-rollout.md` for full context. Focus only on the unmet goals listed above.

## Recent learnings from previous attempt


### calm-dune-9914-recover-owner-pins-from-baselines.md

```
---
title: "Recover Owner Pins From Repository Baselines"
date: 2026-08-17
category: architecture
component: shared
tags: [provenance, contracts, deliberation, testing]
file_type: rules
---

# Recover Owner Pins From Repository Baselines

When a provenance repair replaces an accepted immutable owner pin with an
unresolved placeholder, inspect the repository baseline before declaring the
owner evidence unavailable. A baseline manifest can provide the exact revision
and owner-relative hash map without deriving either from semantic handoffs or
local mirror hashes.

Keep three evidence classes sep
```

## Implementation session log excerpt (last 50 lines)

```
calm-dune-9914-recover-owner-pins-from-baselines.md
[0m
Restored accepted provenance in `extensions/deliberation/contracts/provenance.json`:

- Owner revision: `401ababdd3`
- Complete two-file `ownerFiles` SHA-256 map
- Preserved all five current local artifact hashes and semantic metadata

Updated `extensions/deliberation/src/contract.test.ts` to require the accepted pin and reject unresolved `ownerPin`.

Evidence created:

- `plans/checkpoints/calm-dune-9914.red-green-proof.md`
- `plans/checkpoints/calm-dune-9914.final-note.md`
- `learnings/architecture/calm-dune-9914-recover-owner-pins-from-baselines.md`

Verification passed:

- `pnpm test extensions/deliberation/src/contract.test.ts -- --reporter=verbose` (8/8)
- All five `shasum -a 256` values match the manifest
- `git diff --check`

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
