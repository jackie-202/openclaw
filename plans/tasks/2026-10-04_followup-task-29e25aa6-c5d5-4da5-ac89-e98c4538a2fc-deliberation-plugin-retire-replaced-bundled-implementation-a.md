# [acceptance-fix] Deliberation plugin: retire replaced bundled implementation and host path coupling: goal-001: Deliberation plugin: retire replaced bundled implementation and host p

Auto-created by the monitor because the original task `calm-fork-3432` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-001: Deliberation plugin: retire replaced bundled implementation and host path coupling

### [BLOCKING] finding-001 - required_implementation_missing / correctness

**Scope:** `goal-001`  
**Claim:** Remaining host integration consumers must load Deliberation through the separately packaged public API/test contract rather than the retired sibling implementation.

**Observed**
The retirement checkpoint marks the work partial and identifies three unchanged Discord/Slack real-domain loaders that still require a runnable public package input; their owner-path scenarios currently cannot load Deliberation.

**Why this matters**
Retiring the bundled sources without migrating these active consumers leaves the requested host path decoupling incomplete and does not satisfy the explicit public-boundary requirement.

**Required action**
Provide the repo-local offline public package/test contract, migrate all three loaders to config-origin public package resolution, and preserve their existing assertions and scenarios without skips or replacement domain hooks.

**Evidence**

- artifact: `plans/checkpoints/deliberation_bundled_plugin_retirement.md:5`
- artifact: `plans/checkpoints/deliberation_bundled_plugin_retirement.md:107-109`
- artifact: `plans/checkpoints/deliberation_bundled_plugin_retirement.md:120-124`
- artifact: `plans/checkpoints/deliberation_bundled_plugin_retirement.md:157`

### [BLOCKING] finding-002 - verification_evidence_missing / evidence

**Scope:** `goal-001`  
**Claim:** The retirement deliverable must provide assertion-level ownership/scenario mapping for transferred native coverage; filename and case-count parity alone are insufficient.

**Observed**
For the two parameterized Slack root/child orchestration cases, the supplied manifest has no dynamic target titles or target assertions, and the checkpoint states that the two-case count and external suite pass do not prove the producer-resolve conversion preserved the required assertions.

**Why this matters**
The task explicitly requires scenario mappings and warns that filename/count parity is not scenario equivalence, so the acknowledged unmapped orchestration assertions leave required retirement evidence incomplete.

**Required action**
Supply external-owner assertion-level mapping for both dynamic Slack orchestration cases, covering identity, bounded history, unrelated-thread exclusion, envelope/receipt invariants, and one-Discord/zero-Slack send behavior.

**Evidence**

- artifact: `plans/checkpoints/deliberation_bundled_plugin_retirement.md:81`
- artifact: `plans/checkpoints/deliberation_bundled_plugin_retirement.md:91`
- artifact: `plans/checkpoints/deliberation_bundled_plugin_retirement.md:158`
- artifact: `plans/handoffs/deliberation-plugin-retirement/accepted-host-contract.md:5`

## Context

- Original task: `calm-fork-3432`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Use the concrete goals and findings above to repair the untrustworthy task outcome. Make the minimum implementation and test changes needed, and verify the repaired behavior.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-10-04_calm-fork-3432_deliberation-plugin-retire-replaced-bundled-implementation.md` for full context. Focus only on the unmet goals listed above.

## Recent learnings from previous attempt

### 2026-10-04_pnpm-docs-command-can-reconcile-after-workspace-retirement.md

```
---
title: "Pnpm docs příkaz může po odstranění workspace změnit závislosti"
date: 2026-10-04
category: tooling
component: tooling
tags: [pnpm, workspace, plugin-retirement, source-only-verification]
---

# Pnpm docs commands can reconcile dependencies after workspace retirement

During manifest-backed removal of `extensions/deliberation`, updating `pnpm-lock.yaml` and removing the workspace package changed pnpm's dependency status. Running the otherwise read-only `pnpm docs:list` triggered automatic `pnpm install` reconciliation before the docs script. Output reported 170 removed packages, no
```

## Implementation session log excerpt (last 50 lines)

```
pecheck lanes report diagnostics in unrelated files.
- Production build omitted under the supplied live-`dist` isolation policy.

**Required to finish:** a repo-local runnable `@openclaw-deliberation/plugin` entry, manifest, and public test contract for the three channel loader migrations, plus assertion-level mapping for the external Slack root/child orchestration cases.

Artifacts:
- `plans/checkpoints/deliberation_bundled_plugin_retirement.md`
- `plans/checkpoints/calm-fork-3432.red-green-proof.md`
- `plans/checkpoints/calm-fork-3432.checkpoint.md`

Saved the required learning. Also recorded that `pnpm docs:list` unexpectedly triggered dependency reconciliation before timing out; subsequent checks used direct Node wrappers.

Docs: https://docs.openclaw.ai/plugins/reference/deliberation

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
