# [acceptance-fix] Fix: Deliberation plugin inbound_claim intake nezapisuje zprávy do KM spoolu: goal-003: `pnpm exec vitest run extensions/deliberation` zelené.

Auto-created by the monitor because the original task `calm-dune-8979` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-003: `pnpm exec vitest run extensions/deliberation` zelené.

### [BLOCKING] finding-001 - verification_evidence_missing / evidence

**Scope:** `goal-003`  
**Claim:** The required full Deliberation Vitest command is green.

**Observed**
The canonical Test Gate status is not run and supplies no evidence for pnpm exec vitest run extensions/deliberation; the supplied focused TDD proof covers only hooks.test.ts, while the checkpoint assertion is not canonical Test Gate evidence.

**Why this matters**
Goal goal-003 explicitly requires a green full-plugin test run, and the caller requires explicit test-artifact goals to be assessed from supplied artifacts and the canonical Test Gate reference. That canonical reference contains no execution evidence.

**Required action**
Provide canonical Test Gate evidence that pnpm exec vitest run extensions/deliberation completed successfully.

**Evidence**

- test-gate: `canonical-status:not-run`
- artifact: `plans/checkpoints/calm-dune-8979.red-green-proof.md`

## Context

- Original task: `calm-dune-8979`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Treat this as an evidence-only follow-up. Production-code changes are forbidden by default. You must inspect the parent implementation and evidence first, then supply only the missing acceptance evidence. Escalate only if that inspection lets you document a real implementation defect; in that case, make only the minimal fix with tests.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-08-01_calm-dune-8979_fix-deliberation-plugin-inbound-claim-intake-nezapisuje-zpr.md` for full context. Focus only on the unmet goals listed above.

## Previous attempt: acceptance context

**Already done (do NOT redo):**

- goal-001: Unit testy pokrývají realný event tvar a projdou.
- goal-002: Skip větve mají log s důvodem.

## Recent learnings from previous attempt

### deliberation-normalize-canonical-channel-identities.md

```
---
title: "Deliberation: normalizace kanonických identit kanálů"
date: 2026-08-01
category: architecture
component: backend
tags: [deliberation, discord, inbound-claim, route-matching, fail-closed]
file_type: rules
---

# Normalize channel identities at the consuming plugin boundary

Discord's canonical inbound hook context can represent a top-level channel conversation as `channel:<id>`, even when operator-facing plugin configuration intentionally stores the bare channel ID. Synthetic hook tests that use only bare `conversationId` values can therefore pass while every real inbound event miss
```

## Implementation session log excerpt (last 50 lines)

```
iagnostikuje všechny skip větve a bezpečně loguje KM chyby.
- Media-only zprávy zapisují placeholder, například `[media: audio/ogg]`, bez úniku cest či URL.
- Přidány realistické inbound event, media a diagnostické testy v `extensions/deliberation/src/hooks.test.ts`.
- RED/GREEN důkaz: `plans/checkpoints/calm-dune-8979.red-green-proof.md`.
- Learning: `learnings/architecture/deliberation-normalize-canonical-channel-identities.md`.

**Verifikace**
- Focused tests: 15/15
- Celý Deliberation plugin: 51/51
- `pnpm build`: prošel
- Extension TypeScript kontroly: prošly
- Scoped format a lint: prošly
- `git diff --check`: prošel
- Autoreview: bez actionable findings

Broad `pnpm lint:extensions` blokuje nesouvisející existující chyba ve Slack test harness exportu `primeChannelOutboundSendMock`.

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
