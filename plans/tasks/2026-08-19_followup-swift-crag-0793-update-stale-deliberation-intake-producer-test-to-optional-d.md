# [acceptance-fix] Update stale deliberation intake-producer test to optional Discord sourceThreadId semantics: goal-002: Full deliberation extension suite green.

Auto-created by the monitor because the original task `swift-vale-3239` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-002: Full deliberation extension suite green.
- goal-003: No production code modified.

### [BLOCKING] finding-001 - verification_evidence_missing / evidence

**Scope:** `goal-002`  
**Claim:** The required full deliberation suite result has no canonical Test Gate evidence.

**Observed**
The supplied material states Test Gate status is not run and no Test Gate evidence exists; the checkpoint is not canonical Test Gate evidence.

**Why this matters**
Goal-002 explicitly requires the suite green, while Acceptance may assess that goal only from supplied Test Gate evidence and must not execute or interpret suites.

**Required action**
Provide canonical Test Gate evidence for pnpm vitest run extensions/deliberation.

**Evidence**

- test-gate: `not-run`

### [BLOCKING] finding-002 - unknown / correctness

**Scope:** `goal-003`  
**Claim:** The task-scoped diff modifies production source despite the no-production-code goal.

**Observed**
The supplied diff changes extensions/deliberation/src/intake.ts, extensions/deliberation/src/km-client.ts, and extensions/deliberation/src/route-match.ts, in addition to their tests.

**Why this matters**
These are material runtime TypeScript changes, not incidental churn. No concurrent-context assignment was supplied that could establish other-task ownership, and the catalog has no more specific entry for this scope-contract violation.

**Required action**
Remove production-source changes from this task's scoped change set or supply a high-confidence concurrent assignment that attributes each exact production path.

**Evidence**

- file: `extensions/deliberation/src/intake.ts:99`
- file: `extensions/deliberation/src/km-client.ts:56`
- file: `extensions/deliberation/src/route-match.ts:107`

## Context

- Original task: `swift-vale-3239`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Use the concrete goals and findings above to repair the untrustworthy task outcome. Make the minimum implementation and test changes needed, and verify the repaired behavior.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-08-19_swift-vale-3239_update-stale-deliberation-intake-producer-test-to-optional.md` for full context. Focus only on the unmet goals listed above.

## Previous attempt: acceptance context

**Already done (do NOT redo):**

- goal-001: The single stale assertion is aligned with optional-by-absence Discord sourceThreadId semantics.

## Implementation session log excerpt (last 50 lines)

```
ucer-test-to-optional-d.md
[0m
The scoped suite is green at 243/243. The worktree contains unrelated deliberation changes and a pre-existing learning file; I will leave them untouched.
[0m% [0mPatch 1 file
[0m→ [0mRead learnings/test-failures/discord-intake-fixtures-separate-message-and-thread-identities.md
[0m% [0mPatch 1 file
[0m
[0m# [0mTodos
[✓] Inspect stale deliberation intake-producer test and surrounding semantics
[✓] Update only the stale test expectation
[✓] Run deliberation extension test suite
[✓] Save required learning
[0m
[0m→ [0mSkill "save-learning"
Updated `extensions/deliberation/scripts/intake-producer.test.ts` to assert absent `sourceThreadId` for the no-thread Discord fixture.

Verification: `pnpm vitest run extensions/deliberation` passed, 243/243 tests.

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
