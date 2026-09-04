# Plan 2026-08-26: Complete KM layout-independence TDD evidence

Capture the missing direct GREEN provenance for the parent task without repeating its implementation.

_Status: DRAFT_
_Created: 2026-08-26_

## Progress

- [x] Phase 0: Config + init
- [x] Phase 1: Research
- [x] Phase 2: Knowledge
- [x] Phase 3: Synthesis

## Analysis

### Parent implementation and evidence

- `plans/checkpoints/cool-reef-5098.red-green-proof.md` preserves the exact focused RED: exit 1 because `km-integration` remained in the gate, followed by the parent GREEN for the same command.
- `plans/checkpoints/acceptance-runs/cool-reef-5098-acceptance-001/result.json` rejects the caller-supplied evidence for missing direct GREEN provenance; no implementation defect is reported.
- `plans/checkpoints/cool-reef-5098.evidence.md` is not authoritative because both helper command lines are truncated and outcomes are unavailable.
- The worktree preserves the parent production/test changes. This follow-up must not modify or redo them.

### Relevant documentation

- The parent plan defines the focused command and expected transition; no product documentation change is needed for an evidence-only repair.

### Knowledge base

- `learnings/tooling/follow-up-proof-must-bind-historical-red-to-fresh-green.md`: link immutable parent RED and run the identical command for fresh task-scoped GREEN; do not recreate RED.
- `learnings/tooling/2026-08-26_clean-gates-separate-canonical-and-implementation-proof.md`: focused GREEN is distinct from a clean-checkout full-gate artifact; do not weaken clean preflight.
- Recall used local fallback because collection `openclaw-fork-learnings` was unavailable; the returned architecture files add no contrary requirement.

## Available Skills

- `task-evidence`: disclose truncated parent session evidence and use the complete parent proof instead.
- `tdd`: preserve RED/GREEN command identity; do not fabricate post-implementation RED.
- `save-learning`: record the planning insight as the final action.

## Approach

Keep the parent implementation and historical proof immutable. Create task-scoped evidence that binds the genuine parent RED to a fresh passing run of the identical command; escalate to code only if that command exposes a real regression.

## Execution Steps

1. Read `plans/checkpoints/cool-reef-5098.red-green-proof.md` immediately before capture and transcribe its RED timestamp, exact command, exit code, aggregate totals, and expected `km-integration` failure into the follow-up proof with a direct source link.
2. Create `plans/checkpoints/fresh-wave-5088.red-green-proof.md` with a historical RED section. Do not rerun RED or edit production/tests.
3. Run the identical focused command once: `pnpm test test/scripts/deliberation-full-gate.test.ts extensions/deliberation/src/km-client.test.ts -- --reporter=verbose`.
4. Record timestamp, exit code, complete runner output, file/test totals, and zero failures as fresh GREEN. If `skill:tdd` rejects imported RED metadata, record the refusal and direct command output instead of altering history.
5. If GREEN fails, inspect only the failing path. Document an environment/infrastructure failure as a proof gap; make a minimal code/test fix only for a demonstrated implementation regression, then rerun the same command.
6. Add `plans/checkpoints/fresh-wave-5088.acceptance-evidence.md` mapping `goal-001` / `finding-001` to the linked RED and fresh GREEN, and explicitly exclude `plans/checkpoints/cool-reef-5098.evidence.md` because its commands are truncated and outcomes unavailable.
7. Update `plans/checkpoints/fresh-wave-5088.checkpoint.md` only after verifying both phases, command identity, direct GREEN output, and that no production/test files changed.

## Files to Modify

| Path                                                       | Change                                                                         |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `plans/checkpoints/fresh-wave-5088.red-green-proof.md`     | Link complete historical RED provenance and capture direct fresh GREEN output. |
| `plans/checkpoints/fresh-wave-5088.acceptance-evidence.md` | Map both phases to `goal-001` and `finding-001`; disclose task-evidence gaps.  |
| `plans/checkpoints/fresh-wave-5088.checkpoint.md`          | Record completion and exact evidence artifacts.                                |

Production and test files remain unchanged unless the focused command proves a real regression.

## TDD

Implementace TDD cyklu dle skill:tdd, using imported historical RED because implementation already exists.

**Historical test files:** `test/scripts/deliberation-full-gate.test.ts`, `extensions/deliberation/src/km-client.test.ts`  
**Run command:** `pnpm test test/scripts/deliberation-full-gate.test.ts extensions/deliberation/src/km-client.test.ts -- --reporter=verbose`

| Phase          | Required evidence                                                                                                                  |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Historical RED | Link `plans/checkpoints/cool-reef-5098.red-green-proof.md`: exit 1; gate inventory test fails because `km-integration` is present. |
| Fresh GREEN    | Identical command exits 0 with both Vitest shards and all focused tests passing; preserve direct output in the follow-up proof.    |

No new skeleton or failing assertion is permitted: recreating RED after the preserved implementation would fabricate chronology.

## Dependencies

- Parent RED artifact must remain available and unchanged.
- Existing dependencies must be sufficient for the focused command; if missing, run `pnpm install` once and retry once per repository policy.
- No KM checkout, service, source path, clean full-gate run, or product documentation change is required for this finding.
