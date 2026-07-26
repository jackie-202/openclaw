# [acceptance-fix] [acceptance-fix] Slice 3: Remove transitional fallback, reject `model` in fork runtime profile: goal-001: Slice 3: Remov: goal-001: [acceptance-fix] Slice 3: Remove transitional fallback, reject `model`

Auto-created by the monitor because the original task `dark-crag-9860` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-001: [acceptance-fix] Slice 3: Remove transitional fallback, reject `model` in fork runtime profile: goal-001: Slice 3: Remov

### [BLOCKING] finding-001 - verification_evidence_missing / evidence

**Scope:** `goal-001`  
**Claim:** The required canonical repository verification gate still has no acceptance evidence.

**Observed**
The caller states that Test Gate has not run and no Test Gate evidence exists; the supplied checkpoint also leaves the canonical repository test/build gate incomplete.

**Why this matters**
The follow-up task exists specifically to supply a concrete caller-owned canonical gate result, and focused historical RED/GREEN evidence cannot substitute for that separate required gate.

**Required action**
Provide a concrete canonical Test Gate result covering the repository test/build gate through the caller-owned Test Gate workflow.

**Evidence**
- test-gate: `canonical:not-run`
- artifact: `plans/checkpoints/dark-crag-9860.checkpoint.md`

### [BLOCKING] finding-002 - required_artifact_missing / correctness

**Scope:** `goal-001`  
**Claim:** The required completed final task note was not supplied.

**Observed**
The supplied artifacts include only an initialized follow-up checkpoint, parent TDD proof, and learnings; no dark-crag-9860 final note records the three commit dispositions and actual before/after affected-surface diff-stat comparison.

**Why this matters**
The final note is an explicit deliverable of this acceptance repair and is needed to establish final implementation disposition and measured fork-delta results rather than planned or log-only claims.

**Required action**
Provide the completed final task note with dispositions for commits 9c09c25952, 435059f7d6, and 0529559822 and the actual before/after affected-surface diff-stat comparison.

**Evidence**
- file: `plans/tasks/2026-07-24_followup-slice-3-remove-transitional-fallback-reject-model-in-fork-ru.md:Requirements`
- plan: `plans/2026-07-24_dark-crag-9860_slice-3-remove-transitional-fallback-reject-model-in-fork.md:Implementation`
- artifact: `plans/checkpoints/dark-crag-9860.checkpoint.md`


## Context

- Original task: `dark-crag-9860`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Use the concrete goals and findings above to repair the untrustworthy task outcome. Make the minimum implementation and test changes needed, and verify the repaired behavior.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-07-24_dark-crag-9860_slice-3-remove-transitional-fallback-reject-model-in-fork.md` for full context. Focus only on the unmet goals listed above.

## Implementation session log excerpt (last 50 lines)

```
ypes.channels.ts                       |   35 +-
 src/config/zod-schema.channels-config.ts           |   25 +-
 src/gateway/model-pricing-cache.ts                 |  110 +-
 src/gateway/session-utils.test.ts                  | 1636 ++--
 11 files changed, 13560 insertions(+), 4950 deletions(-)
1063	2412	src/agents/agent-command.live-model-switch.test.ts
9310	8	src/auto-reply/reply/dispatch-from-config.test.ts
438	439	src/auto-reply/reply/get-reply.fast-path.test.ts
50	244	src/auto-reply/status.test.ts
93	63	src/channels/model-overrides.ts
35	567	src/config/config.plugin-validation.test.ts
1972	10	src/config/schema.help.ts
22	13	src/config/types.channels.ts
22	3	src/config/zod-schema.channels-config.ts
59	51	src/gateway/model-pricing-cache.ts
496	1140	src/gateway/session-utils.test.ts
[0m

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
