# [acceptance-fix] Fix OpenClaw Deliberation live intake request failure: goal-001: Fix OpenClaw Deliberation live intake request failure

Auto-created by the monitor because the original task `bold-cove-8557` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-001: Fix OpenClaw Deliberation live intake request failure

### [BLOCKING] finding-001 - required_tdd_proof_missing / evidence

**Scope:** `goal-001`
**Claim:** The caller-required TDD proof lacks a supplied GREEN phase.

**Observed**
The manifest declares tddRequired=true, while the supplied TDD proof contains a RED Phase with exit code 1 and no GREEN phase or passing post-fix outcome.

**Why this matters**
A RED-only capture cannot establish the required fail-before/pass-after regression cycle, regardless of the checkpoint's prose assertion that GREEN verification completed.

**Required action**
Provide the immutable caller-owned RED/GREEN proof with the focused regression failing before the implementation and passing after it.

**Evidence**

- artifact: `plans/checkpoints/bold-cove-8557.red-green-proof.md`
- file: `plans/checkpoints/acceptance-runs/bold-cove-8557-acceptance-001/manifest.json:20`

### [BLOCKING] finding-002 - verification_evidence_missing / evidence

**Scope:** `goal-001`
**Claim:** Verification that the real extension producer reaches and persists once through a real temporary KM listener is absent.

**Observed**
The supplied task contract requires a Discord-shaped event through the real extension producer to persist once and duplicate replay to leave one record, but the supplied artifacts provide no listener response, persisted-record count, or duplicate-replay result.

**Why this matters**
The checkpoint's completion assertion and the learning's testing guidance do not demonstrate the externally owned listener behavior that defines acceptance of the live intake repair.

**Required action**
Supply the bounded real-listener verification artifact showing the producer request outcome and one persisted record after replaying the same provider event ID.

**Evidence**

- file: `plans/tasks/2026-08-04_fix-openclaw-deliberation-live-intake-request-failure.md`
- artifact: `learnings/test-failures/bold-cove-8557-real-listener-proof-uses-fork-producer.md`

## Context

- Original task: `bold-cove-8557`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Treat this as an evidence-only follow-up. Production-code changes are forbidden by default. You must inspect the parent implementation and evidence first, then supply only the missing acceptance evidence. Escalate only if that inspection lets you document a real implementation defect; in that case, make only the minimal fix with tests.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-08-04_bold-cove-8557_fix-openclaw-deliberation-live-intake-request-failure.md` for full context. Focus only on the unmet goals listed above.

## Recent learnings from previous attempt

### node-fetch-closed-header-contracts.md

```
---
title: "Uzavřené HTTP kontrakty vyžadují zachycení generovaných hlaviček"
date: 2026-08-04
category: runtime-errors
component: backend
tags: [openclaw, deliberation, http, node-fetch, contract-testing]
file_type: rules
---

# Closed HTTP contracts require client-generated header capture

When a listener validates a closed header allowlist, inspecting only application headers is insufficient. Node's global `fetch` added `accept-language: *` after the caller supplied its headers, while the pinned KM transport contract allowed `sec-fetch-mode` and other generated headers but not `Accept-Langu
```

## Implementation session log excerpt (last 50 lines)

```
ics and safe runtime logging.
- Added real temporary-listener duplicate persistence coverage and producer CLI.
- Documented probe usage in `docs/plugins/reference/deliberation.md:72`.
- Preserved `.483Z` timestamps, fail-closed behavior, CAS conflicts, and disabled sender.

Verification:
- Deliberation tests: 71 passed.
- Extension tsgo: passed.
- Scoped production lint and formatting: passed.
- Docs MDX and `git diff --check`: passed.
- Autoreview: clean, no actionable findings.
- RED/GREEN proof: `plans/checkpoints/bold-cove-8557.red-green-proof.md`.
- Learning saved: `learnings/runtime-errors/node-fetch-closed-header-contracts.md`.

A broader lint preparation remains blocked by an unrelated pre-existing Slack boundary type error.

https://docs.openclaw.ai/plugins/reference/deliberation

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
