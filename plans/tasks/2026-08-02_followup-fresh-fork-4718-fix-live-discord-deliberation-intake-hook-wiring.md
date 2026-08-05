# [acceptance-fix] Fix live Discord deliberation intake hook wiring: goal-004: Existing deliberation and Discord inbound tests remain green.

Auto-created by the monitor because the original task `bright-mist-1370` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-004: Existing deliberation and Discord inbound tests remain green.

### [BLOCKING] finding-001 - required_tdd_proof_missing / evidence

**Scope:** cross-cutting
**Claim:** The caller-required TDD proof must contain a valid RED and GREEN cycle for this run.

**Observed**
The supplied TDD proof contains metadata and a RED phase with exit code 1, but no GREEN phase, successful focused rerun, or GREEN output is present in the supplied artifact.

**Why this matters**
The manifest declares tddRequired=true, and a RED-only capture does not demonstrate the mandatory completed RED/GREEN cycle; the checkpoint's summary assertion is not a substitute for the required proof artifact.

**Required action**
Provide the run-scoped TDD proof with both the genuine RED capture and the subsequent GREEN capture for the declared focused command.

**Evidence**

- artifact: `plans/checkpoints/bright-mist-1370.red-green-proof.md`
- file: `manifest.json:36`

### [BLOCKING] finding-002 - verification_evidence_missing / evidence

**Scope:** `goal-004`
**Claim:** The required existing Deliberation and Discord inbound tests must have canonical evidence that they remain green.

**Observed**
The caller states that Test Gate was not run and that no Test Gate evidence exists; the supplied checkpoint only summarizes local verification and provides no canonical Test Gate reference establishing goal-004.

**Why this matters**
Goal-004 is explicitly a test-result goal, and the acceptance guidance permits assessing it only from supplied artifacts and the canonical Test Gate reference. That canonical evidence is absent.

**Required action**
Supply canonical Test Gate evidence showing the required existing Deliberation and Discord inbound tests remain green.

**Evidence**

- test-gate: `status:not-run`
- file: `manifest.json:24-25`

## Context

- Original task: `bright-mist-1370`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Treat this as an evidence-only follow-up. Production-code changes are forbidden by default. You must inspect the parent implementation and evidence first, then supply only the missing acceptance evidence. Escalate only if that inspection lets you document a real implementation defect; in that case, make only the minimal fix with tests.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-08-02_bright-mist-1370_fix-live-discord-deliberation-intake-hook-wiring.md` for full context. Focus only on the unmet goals listed above.

## Previous attempt: acceptance context

**Already done (do NOT redo):**

- goal-001: A realistic Discord event for channel `1494265174389948538` reaches `createInboundClaimHandler`/KM intake in the integration test.
- goal-002: Successful intake is present in the canonical spool/audit contract and no normal agent response is dispatched.
- goal-003: Listener-unavailable failure is observable in logs and cannot leak into ordinary dispatch.
- goal-005: The final task note identifies the exact live wiring cause and records focused test/typecheck results.

## Recent learnings from previous attempt

### discord-intake-hooks-need-assembled-sender-identity.md

```
---
title: "Discord intake hooks need assembled sender identity"
date: 2026-08-02
category: test-failures
component: shared
tags: [discord, plugins, inbound-claim, deliberation, integration-testing]
file_type: rules
---

# Discord hook failures require assembled-context proof

When a channel-scoped `inbound_claim` hook appears absent while a later `before_dispatch` hook still silences the same message, do not infer hook registration failure from the visible behavior alone. Compose the channel process harness with the production dispatcher and a loader-backed registry, then observe the register
```

## Implementation session log excerpt (last 50 lines)

```
:

- Focused matrix: 352 tests passed.
- Final Discord/source-checkout run: 108 tests passed.
- `pnpm tsgo:core`, `pnpm tsgo:extensions`, and both test type lanes passed.
- `pnpm build` passed.
- Targeted Oxlint passed.
- Docs formatting, Markdown lint, and MDX checks passed.
- Final autoreview: clean, no actionable findings.
- RED/GREEN proof verified at `plans/checkpoints/bright-mist-1370.red-green-proof.md`.
- Learning saved to `learnings/test-failures/discord-intake-hooks-need-assembled-sender-identity.md`.

`pnpm check:changed` remains blocked by unrelated dirty-worktree debt: unpinned `extensions/deliberation/package.json` `zod` dependency. Full docs checking similarly reaches unrelated missing Chinese glossary entries. Live listener/spool confirmation remains an external follow-up.

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
