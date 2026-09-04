# [acceptance-fix] Remove OpenClaw dependency on KM Deliberation source layout: goal-001: Remove OpenClaw dependency on KM Deliberation source layout

Auto-created by the monitor because the original task `cool-reef-5098` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-001: Remove OpenClaw dependency on KM Deliberation source layout

### [BLOCKING] finding-001 - required_tdd_proof_missing / evidence

**Scope:** `goal-001`  
**Claim:** The caller-required TDD proof must contain credible RED and GREEN evidence for the declared focused command.

**Observed**
The supplied proof contains a RED phase with exit code 1 and failing target tests, but it provides no GREEN phase, passing command result, or other direct GREEN provenance; the checkpoint only asserts that GREEN exists.

**Why this matters**
With tddRequired true, a checkpoint summary cannot substitute for the missing direct GREEN proof needed to establish the required red-green cycle from caller-supplied material.

**Required action**
Supply the canonical TDD proof with the passing GREEN phase and its direct command outcome for the declared focused test command.

**Evidence**

- artifact: `plans/checkpoints/cool-reef-5098.red-green-proof.md`
- artifact: `plans/checkpoints/cool-reef-5098.checkpoint.md`

## Context

- Original task: `cool-reef-5098`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Treat this as an evidence-only follow-up. Production-code changes are forbidden by default. You must inspect the parent implementation and evidence first, then supply only the missing acceptance evidence. Escalate only if that inspection lets you document a real implementation defect; in that case, make only the minimal fix with tests.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-08-26_cool-reef-5098_remove-openclaw-dependency-on-km-deliberation-source-layout.md` for full context. Focus only on the unmet goals listed above.

## Recent learnings from previous attempt

### 2026-08-26_clean-gates-separate-canonical-and-implementation-proof.md

```
---
title: "Separate canonical clean-checkout evidence from implementation-time isolation proof"
date: 2026-08-26
category: tooling
component: ci-cd
tags: [openclaw, acceptance-gates, isolation, clean-checkout, tdd]
file_type: rules
---

# Separate canonical clean-checkout evidence from implementation-time isolation proof

A canonical acceptance gate can require a clean revision so command identities and artifact digests are immutable. That same preflight prevents the gate from running while a TDD implementation is still an uncommitted patch.

Do not weaken the clean-checkout rule or add an `a
```

## Implementation session log excerpt (last 50 lines)

```
 oxfmt: passed.
- `pnpm build`: passed.
- Active code/config/docs isolation searches: clean, apart from the intentional negative test assertion.
- Autoreview: clean, no actionable findings.

The sanitized full-gate command stopped at its intentional dirty-checkout preflight. It did not inspect or request a KM checkout; final canonical artifact generation must run after the owning workflow commits the patch. Broad `tsgo:all` and docs checks retain unrelated pre-existing failures in `src/plugins/hooks.sync-only.test.ts` and `docs/proposals/proposal-20260809-165021-f994b3_openclaw-upstream-sync-compatibility-review.md`.

KM-side follow-up: maintain listener/storage/restart/reconciliation/migration E2E coverage in the caller repository.

https://docs.openclaw.ai/plugins/reference/deliberation

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
