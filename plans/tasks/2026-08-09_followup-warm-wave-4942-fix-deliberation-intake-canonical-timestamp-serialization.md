# [acceptance-fix] Fix Deliberation intake canonical timestamp serialization: [BLOCKING] finding-001 - required_tdd_proof_missing / evidence

Auto-created by the monitor because the original task `bright-cove-8682` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

### [BLOCKING] finding-001 - required_tdd_proof_missing / evidence

**Scope:** cross-cutting  
**Claim:** The caller-declared mandatory TDD proof must contain a valid RED state before GREEN.

**Observed**
The supplied proof's RED phase reports that the newly written focused test passed with 27/27 tests and explicitly states that no genuine RED was produced; its GREEN phase reports the same passing result with no intervening production implementation.

**Why this matters**
With tddRequired set to true, a passing pre-edit probe labeled RED does not demonstrate the required failing-test-before-implementation cycle, so the supplied artifact is not valid RED/GREEN proof even though avoiding a manufactured production regression was appropriate.

**Required action**
Provide valid caller-accepted TDD provenance containing a genuine RED failure followed by GREEN, or have the caller explicitly change the run's TDD requirement when the behavior was already correct and only regression coverage was added.

**Evidence**

- artifact: `plans/checkpoints/bright-cove-8682.red-green-proof.md:5-13`
- artifact: `plans/checkpoints/bright-cove-8682.red-green-proof.md:22-28`
- file: `plans/checkpoints/acceptance-runs/bright-cove-8682-acceptance-001/manifest.json:32`
- plan: `plans/2026-08-09_bright-cove-8682_fix-deliberation-intake-canonical-timestamp-serialization.md:TDD`

## Context

- Original task: `bright-cove-8682`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Treat this as an evidence-only follow-up. Production-code changes are forbidden by default. You must inspect the parent implementation and evidence first, then supply only the missing acceptance evidence. Escalate only if that inspection lets you document a real implementation defect; in that case, make only the minimal fix with tests.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-08-09_bright-cove-8682_fix-deliberation-intake-canonical-timestamp-serialization.md` for full context. Focus only on the unmet goals listed above.

## Previous attempt: acceptance context

**Already done (do NOT redo):**

- goal-001: `new Date("2026-08-08T16:23:38.816Z")` serializes to `2026-08-08T16:23:38.816000Z`.
- goal-002: `new Date("2026-08-08T16:23:38.000Z")` serializes to `2026-08-08T16:23:38Z`.
- goal-003: Existing intake behavior and idempotency remain unchanged.
- goal-004: Tests prove the old nine-digit output cannot regress.

## Recent learnings from previous attempt

### validate-fractional-digit-count-before-timestamp-fixes.md

```
---
title: "Validate fractional digit counts before timestamp fixes"
date: 2026-08-09
category: test-failures
component: backend
tags: [deliberation, timestamps, wire-contract, tdd, reproduction]
file_type: rules
---

# Validate fractional digit counts before planning timestamp fixes

When a timestamp bug report describes both a malformed value and a canonical expected value, count the fractional digits and execute the current formatter before proposing a code change. JavaScript `Date#toISOString()` always emits three millisecond digits, so replacing terminal `Z` with `000Z` turns `.816Z` into
```

## Implementation session log excerpt (last 50 lines)

```
-timestamp-fixes.md"
✓ Learning saved to learnings/test-failures/validate-fractional-digit-count-before-timestamp-fixes.md
[0m
Implemented the regression coverage in `extensions/deliberation/src/hooks.test.ts:324`.

- Proves `.816Z` becomes `.816000Z`.
- Proves `.000Z` becomes whole-second `Z`.
- Rejects seven-or-more fractional digits.
- Production formatter was already correct, so `extensions/deliberation/src/intake.ts` was not changed.
- Focused tests: 27/27 passed.
- Deliberation tsgo gate passed.
- Idempotency test passed.
- Combined suite had two unrelated pre-existing KM reservation-schema failures.
- Autoreview: clean, no actionable findings.
- RED/GREEN evidence: `plans/checkpoints/bright-cove-8682.red-green-proof.md`.
- Mandatory learning saved under `learnings/test-failures/`.

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
