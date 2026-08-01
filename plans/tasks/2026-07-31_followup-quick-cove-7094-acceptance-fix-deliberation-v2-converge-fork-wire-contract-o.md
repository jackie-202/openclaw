# [acceptance-fix] [acceptance-fix] Deliberation v2: converge fork wire contract on KM authority (real fix + commit-ready working tree): go: goal-001: [acceptance-fix] Deliberation v2: converge fork wire contract on KM au

Auto-created by the monitor because the original task `cool-brook-7690` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-001: [acceptance-fix] Deliberation v2: converge fork wire contract on KM authority (real fix + commit-ready working tree): go

### [BLOCKING] finding-001 - required_implementation_missing / correctness

**Scope:** `goal-001`  
**Claim:** The canonical Deliberation wire convergence is not delivered in the caller-supplied target implementation material.

**Observed**
The task-scoped diff contains unrelated architecture-review and session-pointer additions but no source or documentation changes under extensions/deliberation/ or docs/plugins/reference/deliberation.md. The supplied checkpoint and RED/GREEN proof assert completion and focused behavior, but they do not supply the implementation needed to semantically establish removal of the retired header/routes or exclusive use of the six canonical endpoints.

**Why this matters**
Goal-001 requires a real, commit-ready wire-contract repair. Without supplied target source changes, semantic acceptance cannot establish that the retired protocol surface was removed or that production client requests use only the canonical header and endpoints; completion narratives and proof output are not implementation.

**Required action**
Supply the task-scoped implementation and documentation changes that remove the retired header and route family and make production requests use X-Deliberation-Protocol-Version: 1 with only the six canonical endpoints.

**Evidence**

- artifact: `caller-supplied-task-scoped-diff`
- file: `plans/checkpoints/cool-brook-7690.checkpoint.md`
- file: `plans/checkpoints/cool-brook-7690.red-green-proof.md`
- file: `plans/tasks/2026-07-31_followup-cool-brook-7690-deliberation-v2-converge-fork-wire-contract-on-km-authority.md`

## Context

- Original task: `cool-brook-7690`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Use the concrete goals and findings above to repair the untrustworthy task outcome. Make the minimum implementation and test changes needed, and verify the repaired behavior.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-08-01_cool-brook-7690_deliberation-v2-converge-fork-wire-contract-on-km-authority.md` for full context. Focus only on the unmet goals listed above.

## Recent learnings from previous attempt

### cool-brook-7690-canonical-wire-convergence.md

```
---
title: "Canonical wire mirrors require closed parsing and precise residue scans"
date: 2026-08-01
category: architecture
component: backend
tags: [deliberation, wire-contract, closed-schema, residue-audit, fail-closed]
file_type: rules
---

# Canonical wire mirrors need semantic residue scans

When a repository mirrors an external JSON contract byte-for-byte, verify the source hashes before implementation and pin the mirrored hashes in a contract test. Runtime parsers should enforce the same closed response boundary, including known optional field types, rather than checking only top-level
```

## Implementation session log excerpt (last 50 lines)

```
ts with verified hashes:
  - Contract: `e1f3ed030d69f24b7117ca55edb7aa63fd18152b515fa9e047404d495306aebf`
  - Fixtures: `1f62540db97714cfe2cca72b25f2e2c7bd50200284557595991f8c357c85b9c1`
- Removed retired sender worker, mutation facade, and unsafe destination inference.
- Added closed response validation, canonical intake mapping, manifest agreement tests, and updated documentation.
- Retired header/route scan: zero matches.
- TDD proof: `plans/checkpoints/cool-brook-7690.red-green-proof.md`
- Extension tests: 23 passed.
- `pnpm build`, docs lint, MDX check, formatting, and `git diff --check`: passed.
- Final autoreview: clean.
- Learning saved to `learnings/architecture/cool-brook-7690-canonical-wire-convergence.md`.

Documentation: https://docs.openclaw.ai/plugins/reference/deliberation

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
