# [acceptance-fix] [acceptance-fix] Ship and verify OpenClaw Deliberation doctor migration package: goal-001: Ship and verify OpenClaw Deli: goal-001: [acceptance-fix] Ship and verify OpenClaw Deliberation doctor migratio

Auto-created by the monitor because the original task `dark-mist-2518` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-001: [acceptance-fix] Ship and verify OpenClaw Deliberation doctor migration package: goal-001: Ship and verify OpenClaw Deli

### [BLOCKING] finding-001 - required_implementation_missing / correctness

**Scope:** `goal-001`  
**Claim:** The required named OR-22 leaf implementation is not present in the supplied task-scoped change material.

**Observed**
The caller-supplied task-scoped diff contains no change to test/scripts/deliberation-doctor-package.e2e.test.ts and no statically reviewable installed-runtime probe or assertions for the exact ordered five hooks and sole deliberation-final-delivery service. The supplied plan describes the intended code, while checkpoint prose and captured test stdout only claim that it was applied.

**Why this matters**
The acceptance-fix goal specifically requires the named OR-22 leaf itself to exercise the installed runtime and assert five-hook singleton behavior. Plans, agent prose, and stdout do not establish that the required implementation was delivered.

**Required action**
Supply the actual OR-22 test implementation that loads the installed Deliberation runtime and asserts the exact ordered five hooks plus only the deliberation-final-delivery service, while retaining the standalone singleton smoke.

**Evidence**

- file: `plans/tasks/2026-08-23_followup-dark-mist-2518-ship-and-verify-openclaw-deliberation-doctor-migration-packa.md:10-27`
- plan: `plans/2026-08-23_dark-mist-2518_ship-and-verify-openclaw-deliberation-doctor-migration.md:Implementation steps 2-4`
- artifact: `caller-supplied task-scoped diff`

## Context

- Original task: `dark-mist-2518`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Use the concrete goals and findings above to repair the untrustworthy task outcome. Make the minimum implementation and test changes needed, and verify the repaired behavior.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-08-23_dark-mist-2518_ship-and-verify-openclaw-deliberation-doctor-migration.md` for full context. Focus only on the unmet goals listed above.

## Recent learnings from previous attempt

### dark-mist-2518-named-package-leaf-runtime-coverage.md

```
---
title: "Named package leaves must assert every behavior in their name"
date: 2026-08-23
category: test-failures
component: e2e
tags: [openclaw, package-e2e, acceptance, deliberation, tdd]
file_type: checklist
---

# Named package leaves must assert every behavior in their name

An independent smoke test does not satisfy an acceptance requirement that a specific named E2E leaf cover the same behavior. The Deliberation package suite already ran `scripts/test-built-plugin-singleton.mjs`, but `OR-22 doctor-package-writeback-built-five-hook-runtime` itself only verified doctor migration and pac
```

## Implementation session log excerpt (last 50 lines)

```
 acceptance fix.

- `test/scripts/deliberation-doctor-package.e2e.test.ts:151` now loads the installed Deliberation runtime and asserts the ordered five hooks and sole `deliberation-final-delivery` service.
- Preserved all migration, idempotence, validation, and refusal coverage.
- Left the standalone singleton smoke unchanged.
- Added required RED/GREEN evidence and checkpoint.
- Saved learning at `learnings/test-failures/dark-mist-2518-named-package-leaf-runtime-coverage.md`.

Verification passed:

- `pnpm build`
- Package creation and integrity check
- Installed-package OR-22: 1/1 passed
- `pnpm test:build:singleton`
- Scoped Oxlint
- Format check
- `git diff --check`
- Bounded Codex autoreview: clean, no actionable findings

Proof: `plans/checkpoints/dark-mist-2518.red-green-proof.md`

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
