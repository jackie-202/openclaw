# [acceptance-fix] Deliberation v2 — standard plugin intake, silence and bounded final delivery: goal-001: Deliberation v2 — standard plugin intake, silence and bounded final de

Auto-created by the monitor because the original task `bright-wave-6041` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-001: Deliberation v2 — standard plugin intake, silence and bounded final delivery

### [BLOCKING] finding-001 - required_implementation_missing / correctness

**Scope:** `goal-001`  
**Claim:** The required Deliberation v2 plugin boundary was not delivered.

**Observed**
The supplied checkpoint and RED/GREEN proof state that extensions/deliberation is intentionally absent, production GREEN was not attempted, and implementation stopped because repository-local KM authority contracts were unavailable.

**Why this matters**
Goal-001 requires configured-source intake, terminal silence, restricted-session outbound guards, and bounded KM-reserved final delivery. With no plugin package or production implementation, none of those required behaviors is delivered, even though stopping avoided inventing an unsafe contract.

**Required action**
Supply the authoritative KM contracts identified by the task stop condition, then implement the standard external plugin and all goal-required intake, silence, outbound-guard, reservation, send, reporting, and reconciliation behavior.

**Evidence**

- artifact: `plans/checkpoints/bright-wave-6041.checkpoint.md`
- artifact: `plans/checkpoints/bright-wave-6041.red-green-proof.md`
- file: `plans/tasks/2026-07-27_deliberation-v2-channel-intake-gate-final-send-adapter.md`

### [BLOCKING] finding-002 - required_tdd_proof_missing / evidence

**Scope:** `goal-001`  
**Claim:** The caller-required TDD proof is invalid because it does not contain a production GREEN result for the evaluation target.

**Observed**
The proof records a RED result because the target test file does not exist, then labels a passing pre-existing shared SDK baseline as baseline evidence only and explicitly says it is not a claim that the absent Deliberation plugin is GREEN.

**Why this matters**
The manifest declares tddRequired true and the task requires a RED/GREEN cycle for the plugin. A RED-only target plus an unrelated baseline does not prove that tests drove and validated the required implementation.

**Required action**
After the prerequisite contracts are supplied, complete and retain a genuine target-scoped RED/GREEN cycle showing the Deliberation plugin tests fail before implementation and pass after the required production behavior is implemented.

**Evidence**

- artifact: `plans/checkpoints/bright-wave-6041.red-green-proof.md`
- plan: `plans/2026-07-27_bright-wave-6041_deliberation-v2-standard-plugin-intake-silence-and-bounded.md`
- artifact: `plans/checkpoints/acceptance-runs/bright-wave-6041-acceptance-001/manifest.json:20`

## Context

- Original task: `bright-wave-6041`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Use the concrete goals and findings above to repair the untrustworthy task outcome. Make the minimum implementation and test changes needed, and verify the repaired behavior.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-07-27_bright-wave-6041_deliberation-v2-standard-plugin-intake-silence-and-bounded.md` for full context. Focus only on the unmet goals listed above.

## Recent learnings from previous attempt

### external-authority-wire-contract-blocks-plugin-implementation.md

```
---
title: "Externí autorita musí dodat uzavřený wire kontrakt před implementací pluginu"
date: 2026-07-27
category: architecture
component: shared
tags: [openclaw, plugin-sdk, external-authority, km, contracts, tdd]
file_type: rules
---

# Externí autorita musí dodat uzavřený wire kontrakt před implementací pluginu

Plugin může mít jasně vymezené SDK seam a přesto nesmí být implementován, pokud externí durable autorita nedodala uzavřený wire kontrakt. Typové minimum v návrhu nestačí k bezpečnému odvození HTTP API.

## Povinná kontrola před produkčním kódem

Ověř repository-local authority pro
```

## Implementation session log excerpt (last 50 lines)

```
nflict semantics
- `NOT_SENT` proof and fresh-reservation rules

No production, core, runtime configuration, cron, or external-system changes were made.

Verification:

- Deliberation target: expected RED, no test files
- Shared SDK baseline: 3 files, 19 tests passed
- `git diff --check`: passed
- Build and changed checks were not run because production implementation was prohibited

Artifacts:

- `plans/checkpoints/bright-wave-6041.checkpoint.md`
- `plans/checkpoints/bright-wave-6041.red-green-proof.md`
- `learnings/architecture/external-authority-wire-contract-blocks-plugin-implementation.md`

The plugin therefore uses neither polling nor a wake seam yet. The accepted one-reserved-attempt and unknown-requires-reconciliation boundary remains a design constraint, not implemented behavior.

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
