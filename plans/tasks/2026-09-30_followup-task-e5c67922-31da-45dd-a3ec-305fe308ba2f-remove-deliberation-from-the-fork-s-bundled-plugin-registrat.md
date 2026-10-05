# [acceptance-fix] Remove deliberation from the fork's bundled plugin registration surface: goal-001: Remove deliberation from the fork's bundled plugin registration surfac

Auto-created by the monitor because the original task `task-170727a7-f1b4-40e6-b855-2bf5e0147680` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-001: Remove deliberation from the fork's bundled plugin registration surface

### [BLOCKING] finding-001 - implemented_behavior_incorrect / correctness

**Scope:** `goal-001`  
**Claim:** Deliberation remains registered and expected as a bundled plugin in source-checkout runtime behavior.

**Observed**
The implementation checkpoint says src/plugins/bundled-plugin-metadata.test.ts retains the literal source-checkout startup inventory and src/plugins/source-checkout-runtime.test.ts retains real Deliberation hook and intake assertions as source-development behavior; only packaged build entries and artifacts omit Deliberation.

**Why this matters**
The canonical task requires the fork to stop registering and expecting Deliberation as bundled, explicitly identifies the source-checkout onlyPluginIds deliberation registry assertion as coupling that must change, and requires empty-config gateway startup resolution to omit Deliberation from bundled startup ids. Relabeling the retained source-checkout registration does not change that behavior.

**Required action**
Keep extensions/deliberation source intact, but remove Deliberation from bundled discovery/registration and bundled startup expectations in source checkouts; preserve any source-level plugin tests through direct non-bundled loading and assert the explicit-enabled missing external plugin behavior.

**Evidence**

- file: `plans/tasks/2026-09-30_remove-deliberation-from-the-fork-s-bundled-plugin-registrat.md`
- artifact: `plans/checkpoints/deliberation_bundled_registration_removal.md`
- plan: `plans/2026-10-01_task-170727a7-f1b4-40e6-b855-2bf5e0147680_remove-deliberation-from-the-fork-s-bundled-plugin.md`

## Context

- Original task: `task-170727a7-f1b4-40e6-b855-2bf5e0147680`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Use the concrete goals and findings above to repair the untrustworthy task outcome. Make the minimum implementation and test changes needed, and verify the repaired behavior.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-10-01_task-170727a7-f1b4-40e6-b855-2bf5e0147680_remove-deliberation-from-the-fork-s-bundled-plugin.md` for full context. Focus only on the unmet goals listed above.

## Recent learnings from previous attempt

### bundled-plugin-source-versus-distribution-proof.md

```
---
title: "Vyřazení bundled pluginu: zdroj versus balík"
date: 2026-10-01
category: architecture
component: tooling
tags: [plugins, packaging, migration, vitest]
file_type: decisions
---

# Vyřazení bundled pluginu vyžaduje oddělit zdrojový checkout od distribučního artefaktu

Když `extensions/<id>` zůstává v repozitáři, obecný sken manifestů ho dál uvidí a lokální zdrojové testy jej mohou načíst. Samotná úprava očekávaných ID nezmění instalovatelný balík. Vyloučení musí projít kanonickou sestavou build entries, kopírováním metadata (které odstraní i starý `dist` adresář), runtime overlay a f
```

## Implementation session log excerpt (last 50 lines)

```
6-b855-2bf5e0147680.red-green-proof.md`.

**Verification:** `pnpm build`, the built singleton smoke, installed-tarball test, lint, formatting, and docs MDX checks passed. `node scripts/run-vitest.mjs run --config test/vitest/vitest.config.ts src/plugins/bundled-plugin-metadata.test.ts src/plugins/source-checkout-runtime.test.ts` initially hit the no-output watchdog; with `OPENCLAW_VITEST_NO_OUTPUT_TIMEOUT_MS=240000` it passed **40/40**. `node scripts/test-projects.mjs --changed HEAD` passed 3,073 tests and failed 23 in unrelated tooling tests. Test typechecking also reported existing errors outside the changed files. Structured autoreview was not run because its local mode uses version-control commands prohibited by this task.

Docs: https://docs.openclaw.ai/plugins/reference/deliberation

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
