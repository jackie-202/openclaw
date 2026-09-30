# Plan 2026-09-15: Finish completed OpenClaw fork dirty families goal-001

Close the missing acceptance gate with a complete, release-ready handoff for Jackie's two owner-separated commits. Do not change the already-completed product behavior unless inspection proves a defect.

## Analysis

### Codebase Context

- The worktree contains exactly 15 expected implementation/doc/config/test paths: 9 Deliberation paths and 6 cron paths, including `src/cron/service.test-harness.ts` to initialize `scheduledJobIds`.
- `extensions/deliberation/src/km-client.ts:1549` bounds invocation authorization by its configured timeout and lease; `extensions/deliberation/src/final-adapter.ts:137` awaits it before sending.
- `src/cron/service/state.ts:174` owns `scheduledJobIds`; `src/cron/service/timer.ts:807-839` uses it as the process-local complement to persisted `runningAtMs` admission.
- Historical genuine RED/GREEN evidence is in `plans/checkpoints/task-190873da-d25c-46f1-87c0-4782fde68765.red-green-proof.md` and `plans/checkpoints/task-b06ff88b-f3b3-4ac8-8df5-30fac618b881.red-green-proof.md`; parent completion recorded fresh GREEN results of 165 Deliberation and 54 cron tests.

### Documentation And Evidence

- `plans/tasks/2026-09-15_finish-completed-fork-dirty-families.md:72-82` requires exact results, semantic-review outcome, both paused-plan hashes, and separate commit manifests; it also reserves commit/staging operations for Jackie.
- `plans/checkpoints/task-19712102-154d-4ba6-9b98-024e2e0a502d.checkpoint.md:8-10` records passed focused checks and the current excluded-plan hash `2bb79324dd0de1994bb9f087e565ef3c94e1a7c3442e17758ed62743eff8fe59`, but no final handoff.
- `extensions/AGENTS.md:25-49` preserves Deliberation ownership within the plugin; `docs/AGENTS.md:5-17` governs the already-dirty documentation page.

### Knowledge Base

- `learnings/tooling/acceptance-handoffs-need-an-independent-record.md` requires a new-task handoff record rather than rewriting parent evidence, with literal commands/results, excluded-path hashes, and live reconciled manifests.
- `learnings/architecture/2026-07-28_residue-audits-require-activation-proof.md` requires decision-surface evidence rather than an inventory-only clean verdict.
- Knowledge recall used the local fallback because `openclaw-fork-learnings` was unavailable; contract-gate learnings were not applicable because this follow-up has no unresolved external contract.

## Available Skills

- `task-evidence` recovers parent command output if the checkpoint lacks a result detail.
- `openclaw-testing` selects and runs the narrow fresh GREEN checks.
- `autoreview` reviews the final evidence-only record.
- `save-learning` records the acceptance-handoff lesson as the final action.

## Implementation

1. Capture the excluded paused plan's SHA-256 and `git status --short` before verification without reading, staging, or editing it.
2. Inspect the current Deliberation authorization/send ordering and cron admission/cleanup paths with their focused tests. If there is no concrete defect, retain all 15 dirty implementation paths unchanged; otherwise document the defect and make only the smallest tested repair.
3. Run fresh GREEN verification serially and preserve literal command, exit code, test-file count, and test count for each:
   - `pnpm test extensions/deliberation/src/config.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/delivery-probe.test.ts extensions/deliberation/src/final-adapter.test.ts`
   - `pnpm test src/cron/service.rearm-timer-when-running.test.ts src/cron/service/timer.regression.test.ts src/cron/service/timer.test.ts`
   - `pnpm check:test-types`, recording the known unrelated hooks-test blocker only if it persists.
   - `pnpm lint:core` and `pnpm lint:extensions`.
   - `git diff --check` and `pnpm exec oxfmt --check` over all 15 manifest paths.
4. Recompute the paused-plan SHA-256, compare it to the pre-verification value, and reconcile the final `git status --short` with the two manifests. State any unrelated path as untouched rather than absorbing it.
5. Create `plans/checkpoints/task-dece0577-b3c9-4685-b6de-85a3ffde09e9.handoff.md` with historical RED links, every fresh command/result, explicit `no unresolved actionable semantic finding` or a path/line/impact/evidence finding, both hashes, and the two complete manifests below.
6. Make the handoff actionable for Jackie's host-owned completion: identify the two isolated file groups as the complete inputs for separate Deliberation and cron commits. This follow-up does not stage or commit because the governing task explicitly reserves those mutations for Jackie.
7. Run `autoreview` on the handoff diff. Run `save-learning` last and add its new learning path to the final handoff record.

## Commit Manifests

### Deliberation

- `CHANGELOG.agent.md`
- `docs/plugins/reference/deliberation.md`
- `extensions/deliberation/openclaw.plugin.json`
- `extensions/deliberation/src/config.ts`
- `extensions/deliberation/src/config.test.ts`
- `extensions/deliberation/src/km-client.ts`
- `extensions/deliberation/src/km-client.test.ts`
- `extensions/deliberation/src/final-adapter.test.ts`
- `extensions/deliberation/src/delivery-probe.test.ts`

### Cron

- `src/cron/service/state.ts`
- `src/cron/service/timer.ts`
- `src/cron/service/timer.test.ts`
- `src/cron/service/timer.regression.test.ts`
- `src/cron/service.rearm-timer-when-running.test.ts`
- `src/cron/service.test-harness.ts`

## Files To Modify

| File                                                                                                                   | Change                                      |
| ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `plans/checkpoints/task-dece0577-b3c9-4685-b6de-85a3ffde09e9.handoff.md`                                               | Add the missing auditable final handoff.    |
| `plans/2026-09-15_task-dece0577-b3c9-4685-b6de-85a3ffde09e9_finish-completed-openclaw-fork-dirty-families-goal-001.md` | Maintain this plan.                         |
| `learnings/<new-learning>.md`                                                                                          | Record the required final session learning. |

## TDD: skip

This follow-up is acceptance evidence, not a behavioral change. Reuse the parent genuine RED records and capture fresh GREEN results; do not fabricate a post-implementation RED.

## Dependencies

- Healthy local `pnpm`, Vitest, `tsgo`, OXLint, and `oxfmt`.
- Parent task/checkpoint/acceptance/learning artifacts and the paused `bold-brook-5925` plan remain byte-identical and out of scope.
- Jackie performs the two owner-separated commit operations only after this final record is accepted.

---

_Status: DRAFT_
