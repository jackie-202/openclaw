# [acceptance-fix] Remove legacy channels.modelByChannel support (fork-only simplification): goal-001: Remove legacy channels.modelByChannel support (fork-only simplificatio

Auto-created by the monitor because the original task `warm-cove-7515` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-001: Remove legacy channels.modelByChannel support (fork-only simplification)

### [BLOCKING] finding-001 - verification_evidence_missing / evidence

**Scope:** `goal-001`  
**Claim:** The required final-note grep proof and classification are absent from the supplied acceptance material.

**Observed**
The task requires final-note output from git grep -n modelByChannel src/ with every remaining match classified, but the supplied artifacts contain only a completion checkpoint and RED/GREEN proof; neither includes that output or classification.

**Why this matters**
The grep classification is explicit acceptance evidence for distinguishing preserved upstream compatibility from removed fork-added runtime reads. A checkpoint assertion that verification completed does not supply the required evidence.

**Required action**
Supply the final note containing the git grep -n modelByChannel src/ output and classification of every remaining match, including the upstream-ownership finding and resulting compatibility decision.

**Evidence**

- file: `plans/tasks/2026-07-18_remove-legacy-modelbychannel-support.md:Verification`
- artifact: `plans/checkpoints/warm-cove-7515.checkpoint.md`

## Context

- Original task: `warm-cove-7515`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Treat this as an evidence-only follow-up. Production-code changes are forbidden by default. You must inspect the parent implementation and evidence first, then supply only the missing acceptance evidence. Escalate only if that inspection lets you document a real implementation defect; in that case, make only the minimal fix with tests.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-07-19_warm-cove-7515_remove-legacy-channels-modelbychannel-support-fork-only.md` for full context. Focus only on the unmet goals listed above.

## Recent learnings from previous attempt

### oddel-forkove-runtime-chovani-od-upstream-kompatibility.md

```
---
title: "Oddel forkove runtime chovani od upstream kompatibility"
date: 2026-07-19
category: architecture
component: shared
tags: [openclaw, upstream-compatibility, model-selection, runtime-profiles]
file_type: decisions
---

# Oddel forkove runtime chovani od upstream kompatibility

Pri odstranovani zdvojene konfiguracni vrstvy nestaci zmenit sdileny resolver jen proto, ze ho pouziva novy runtime. `resolveChannelModelOverride` je upstream-owned kompatibilitni API a pouzivaji ho take status, agent command a plugin SDK. Jeho zmena by rozsirila fork diff a rozbila upstream konfigurace s `chan
```

## Implementation session log excerpt (last 50 lines)

```

src/config/zod-schema.channels-config.ts:78  upstream-owned validation
```

Other matches are upstream tests, migration/doctor, update, and config-maintenance paths. No production match remains under `src/auto-reply/reply/`.

**Verification**

- Focused selection tests: 27 passed.
- Runtime dispatch tests: 2 passed.
- Config help tests: 32 passed.
- `pnpm build`: passed.
- `node openclaw.mjs doctor --non-interactive`: completed successfully with existing live-config/state warnings.
- Source formatting: passed.
- Final autoreview: clean, no actionable findings.
- Scoped lint was blocked before execution by an unrelated existing Slack declaration error for `primeChannelOutboundSendMock`.
- Learning saved at `learnings/architecture/oddel-forkove-runtime-chovani-od-upstream-kompatibility.md`.

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
```
