# [acceptance-fix] Fix Deliberation live intake canonical UTC timestamps: goal-001: A live-shaped event timestamp at an exact second produces canonical `.

Auto-created by the monitor because the original task `quick-peak-3638` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-001: A live-shaped event timestamp at an exact second produces canonical `...ssZ` for both occurred/received timestamps where applicable.
- goal-002: Non-zero fractional timestamps follow the canonical wire format.
- goal-004: Tests fail against the old `Date.toISOString()` behavior and pass with the fix.

### [BLOCKING] finding-001 - required_implementation_missing / correctness

**Scope:** `goal-001`, `goal-002`
**Claim:** The required Deliberation intake timestamp normalization implementation is not present in the supplied implementation material.

**Observed**
The caller-supplied task-scoped diff contains unrelated architecture-review, trajectory-pointer, and temporary-script additions, but no change to extensions/deliberation/src/intake.ts or other supplied code that formats occurredAt and receivedAt; the plan and checkpoint only assert that such a formatter was intended or completed.

**Why this matters**
Without supplied implementation code applying canonical formatting to both intake timestamps, exact-second omission of .000 and preservation of non-zero fractions cannot be established as delivered behavior.

**Required action**
Supply the implementation diff showing an intake-construction formatter that removes only terminal .000Z and applies it to occurredAt and receivedAt while preserving non-zero fractional digits.

**Evidence**

- artifact: `caller-supplied task-scoped diff`
- plan: `plans/2026-08-04_quick-peak-3638_fix-deliberation-live-intake-canonical-utc-timestamps.md`

### [BLOCKING] finding-002 - required_tdd_proof_missing / evidence

**Scope:** `goal-004`
**Claim:** The caller-required TDD proof is incomplete because no GREEN phase is supplied.

**Observed**
The supplied quick-peak-3638 RED/GREEN proof shows a RED Phase with exit code 1 and failing expectations against Date.toISOString() output, but includes no GREEN phase command, outcome, or passing evidence; the canonical Test Gate status is not run and supplies no substitute evidence.

**Why this matters**
With tddRequired true, RED evidence alone does not demonstrate that the same focused regression passes with the fix, so goal-004 lacks the mandatory RED/GREEN provenance.

**Required action**
Provide the complete run-scoped TDD proof containing both the genuine RED result against the old behavior and the GREEN result after the timestamp normalization implementation.

**Evidence**

- artifact: `plans/checkpoints/quick-peak-3638.red-green-proof.md`
- test-gate: `canonical status: not run`

## Context

- Original task: `quick-peak-3638`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Use the concrete goals and findings above to repair the untrustworthy task outcome. Make the minimum implementation and test changes needed, and verify the repaired behavior.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-08-04_quick-peak-3638_fix-deliberation-live-intake-canonical-utc-timestamps.md` for full context. Focus only on the unmet goals listed above.

## Previous attempt: acceptance context

**Already done (do NOT redo):**

- goal-003: Existing routing, duplicate handling, and fail-closed behavior remain unchanged.

## Recent learnings from previous attempt

### quick-peak-3638-test-canonical-timestamps-at-request-boundary.md

```
---
title: "Test canonical timestamps at the serialized request boundary"
date: 2026-08-04
category: test-failures
component: backend
tags: [deliberation, timestamps, wire-contract, tdd, request-boundary]
file_type: rules
---

# Test canonical timestamps at the serialized request boundary

When an external API accepts only a canonical UTC representation, a handler test with a mocked client can preserve the wrong wire value because the mock accepts every string. For Deliberation intake, `Date.toISOString()` always emits `.000Z`, while the KM canonical form requires exact seconds to end in `Z` a
```

## Implementation session log excerpt (last 50 lines)

```
ain unchanged.
- Both `occurredAt` and `receivedAt` use the formatter.
- `extensions/deliberation/src/hooks.test.ts:105` verifies serialized exact-second and `.120Z` requests through the real KM client path.
- Routing, duplicate handling, and fail-closed behavior remain unchanged.
- RED/GREEN evidence saved in `plans/checkpoints/quick-peak-3638.red-green-proof.md`.
- Learning saved in `learnings/test-failures/quick-peak-3638-test-canonical-timestamps-at-request-boundary.md`.

Verification:

- `pnpm test extensions/deliberation/src/hooks.test.ts extensions/deliberation/src/km-client.test.ts -- --reporter=verbose`: 31 passed.
- `node scripts/run-tsgo.mjs -p extensions/deliberation/tsconfig.json`: passed.
- `git diff --check`: passed.
- Scoped Codex autoreview: clean, no actionable findings.

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
