# [acceptance-fix] RED-GREEN: ship and verify the doctor migration artifact: goal-008: Build, focused doctor/config suites, packaging check, lint, and canoni

Auto-created by the monitor because the original task `cool-reef-8673` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-008: Build, focused doctor/config suites, packaging check, lint, and canonical Test Gate pass.

### [BLOCKING] finding-001 - verification_evidence_missing / evidence

**Scope:** `goal-008`  
**Claim:** The required canonical Test Gate pass is not evidenced.

**Observed**
The caller-supplied canonical Test Gate status is 'not run' and states that no Test Gate evidence exists; the checkpoint likewise records canonical npm test as infrastructure-blocked before execution.

**Why this matters**
Goal goal-008 explicitly requires the canonical Test Gate to pass. Build, focused suites, packaging, lint, and format evidence cannot substitute for the absent caller-owned canonical Test Gate result.

**Required action**
Run the canonical Test Gate through its owning infrastructure and supply a passing canonical Test Gate evidence reference.

**Evidence**

- test-gate: `canonical Test Gate reference: not run`
- artifact: `plans/checkpoints/cool-reef-8673.checkpoint.md:8`

## Context

- Original task: `cool-reef-8673`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Treat this as an evidence-only follow-up. Production-code changes are forbidden by default. You must inspect the parent implementation and evidence first, then supply only the missing acceptance evidence. Escalate only if that inspection lets you document a real implementation defect; in that case, make only the minimal fix with tests.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-08-23_cool-reef-8673_red-green-ship-and-verify-the-doctor-migration-artifact.md` for full context. Focus only on the unmet goals listed above.

## Previous attempt: acceptance context

**Already done (do NOT redo):**

- goal-001: A temporary legacy config migrates deterministically to canonical `pipelines[]`.
- goal-002: Mixed legacy/new authority is rejected rather than guessed.
- goal-003: Re-running `doctor --fix` is idempotent.
- goal-004: Canonical startup/config validation succeeds on the migrated temporary config.
- goal-005: Invalid duplicate routes and impossible thread inheritance remain rejected.
- goal-006: Tests execute through the built/package CLI, not only imported source helpers.
- goal-007: No live config is read or modified by tests.

## Recent learnings from previous attempt

### cool-reef-8673-doctor-refusal-and-quarantine.md

```
---
title: "Balíčkové migrace ověřují odmítnutí i karanténu doctoru"
date: 2026-08-23
category: test-failures
component: e2e
tags: [openclaw, doctor, migration, packaging, plugins]
file_type: checklist
---

# Test package migrations at both ownership boundaries

A source-level compatibility normalizer test is not enough for a bundled plugin migration. OpenClaw derives top-level bundled plugin build entries from `git ls-files`, so an untracked `doctor-contract-api.ts` can pass direct-import tests while disappearing from a successful build and npm tarball.

The reliable proof sequence is:

1. Bu
```

## Implementation session log excerpt (last 50 lines)

```
n-doctor-package.e2e.test.ts`.
- Verified deterministic migration, idempotence, canonical validation, plugin discovery, and invalid-route rejection.
- Preserved authentic RED/GREEN evidence in `plans/checkpoints/cool-reef-8673.red-green-proof.md`.
- No live configuration, Gateway restart, or deployment occurred.

**Verification**
- Packaged CLI test: passed.
- Focused doctor/config suites: 58 tests passed.
- `pnpm build`: passed.
- Tarball integrity, targeted lint, format, and diff checks: passed.
- Bounded Codex autoreview: clean, no actionable findings.
- `npm test`: infrastructure-blocked before execution. Azure was unconfigured, AWS broker login was absent, and Blacksmith CLI was unavailable.

Learning saved to `learnings/test-failures/cool-reef-8673-doctor-refusal-and-quarantine.md`.

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
