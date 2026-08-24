# [acceptance-fix] Ship and verify OpenClaw Deliberation doctor migration package: goal-001: Ship and verify OpenClaw Deliberation doctor migration package

Auto-created by the monitor because the original task `cool-cove-3068` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-001: Ship and verify OpenClaw Deliberation doctor migration package

### [BLOCKING] finding-001 - required_implementation_missing / correctness

**Scope:** `goal-001`  
**Claim:** The required named OR-22 acceptance leaf does not cover five-hook singleton behavior.

**Observed**
test/scripts/deliberation-doctor-package.e2e.test.ts defines OR-22 doctor-package-writeback-built-five-hook-runtime, but its assertions stop at packaged sidecar presence, doctor writeback/idempotence, config validation, plugin listing, and refusal cases; it never inspects or asserts the five ordered Deliberation hooks or the singleton service count.

**Why this matters**
The canonical task explicitly says the real named OR-22 leaf itself must cover five-hook singleton behavior. A separately executed scripts/test-built-plugin-singleton.mjs smoke demonstrates that behavior elsewhere but does not make the named OR-22 leaf cover it.

**Required action**
Extend the named OR-22 leaf to exercise the installed or emitted Deliberation runtime and assert the exact ordered five hooks plus the sole deliberation-final-delivery service, while retaining the standalone singleton smoke.

**Evidence**

- file: `plans/tasks/2026-08-23_ship-and-verify-openclaw-deliberation-doctor-migration-packa.md:21-31`
- file: `test/scripts/deliberation-doctor-package.e2e.test.ts:74-218`
- file: `scripts/test-built-plugin-singleton.mjs:213-245`

## Context

- Original task: `cool-cove-3068`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Use the concrete goals and findings above to repair the untrustworthy task outcome. Make the minimum implementation and test changes needed, and verify the repaired behavior.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-08-23_cool-cove-3068_ship-and-verify-openclaw-deliberation-doctor-migration.md` for full context. Focus only on the unmet goals listed above.

## Recent learnings from previous attempt

### cool-cove-3068-git-inventory-installed-package-proof.md

```
---
title: "Package sidecar proof crosses git inventory and installed CLI boundaries"
date: 2026-08-23
category: build-errors
component: ci-cd
tags: [openclaw, plugins, packaging, doctor-migration, git-inventory, e2e]
file_type: checklist
---

# Package-sidecar proof must cross the git inventory and installed CLI boundaries

OpenClaw's bundled-plugin collector prefers `git ls-files` over directory scans. A valid top-level plugin sidecar can therefore exist, pass direct-import tests, and still be absent from `dist`, `dist-runtime`, and the npm tarball when it is not in the git index.

For a doc
```

## Implementation session log excerpt (last 50 lines)

```
d verified OR-22.

- Doctor migration sidecar is tracked, built, packed, and loaded by the installed CLI.
- Canonical writeback, idempotence, startup validation, and fail-closed refusal cases pass.
- Built singleton now expects all five hooks and the sole delivery service.
- Package E2E: 1/1 passed.
- Focused suites: 77/77 passed.
- `pnpm build`, package probe, singleton smoke, scoped lint, and formatting passed.
- Final autoreview: clean.
- Broad test typechecks retain unrelated pre-existing failures documented in `plans/checkpoints/cool-cove-3068.final-note.md`.
- TDD evidence: `plans/checkpoints/cool-cove-3068.red-green-proof.md`.
- Commits: `ee0cc3b2b82`, `de86dca21b4`, `19f39b5e17d`.
- Learning saved to `learnings/build-errors/cool-cove-3068-git-inventory-installed-package-proof.md`.

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
