# Plan 2026-08-19: Repair deliberation suite acceptance evidence

Close the two remaining acceptance gaps without reopening the completed test assertion or modifying runtime code.

## Analysis

### Codebase Context

- `extensions/deliberation/scripts/intake-producer.test.ts:70` already contains the accepted test-only assertion: a Discord event without `threadId` omits `sourceThreadId`.
- `plans/checkpoints/swift-vale-3239.checkpoint.md:10` records a local 243-test pass, but `plans/checkpoints/acceptance-runs/swift-vale-3239-acceptance-001/result.json:14` rejects it as noncanonical.
- The acceptance manifest has empty `concurrentContext` (`plans/checkpoints/acceptance-runs/swift-vale-3239-acceptance-001/manifest.json:2`), while the worktree contains runtime edits in `extensions/deliberation/src/intake.ts`, `km-client.ts`, and `route-match.ts`; do not reset, edit, or claim those unassigned changes.

### Documentation And Knowledge

- `docs/reference/test.md:11` identifies `pnpm test <path-or-filter>` as local scoped proof; it does not make a local invocation a caller-owned Test Gate.
- `learnings/patterns/swift-vale-3239-keep-discord-message-and-thread-identities-separate-in-intake-fixtures.md:9` requires omission of `sourceThreadId` for Discord message-only fixtures.
- The historical manifest declares `tddRequired: false`; no genuine RED artifact was supplied, so do not fabricate one after the accepted assertion change.

## Available Skills

- `openclaw-testing`: choose safe diagnostic execution only if the canonical gate exposes a failure.
- `task-evidence`: extract parent command provenance for the evidence artifact.
- `acceptance`: validate the retry artifact against both findings when a fresh manifest is supplied.
- `save-learning`: create the required learning as the final execution action.

## Implementation

1. Keep `extensions/deliberation/scripts/intake-producer.test.ts` unchanged; do not alter `extensions/deliberation/src/**`, contracts, or unrelated test files.
2. Capture `git diff --name-only` and the exact current diff for the three runtime paths. Request a fresh caller/monitor retry manifest that either attributes each path to its concurrent task or excludes them from this task-scoped diff. If neither is supplied, record the ownership gap as blocked and stop; do not revert another task's work.
3. Submit the preserved test-only task through the caller-owned Test Gate. Require it to execute exactly `pnpm vitest run extensions/deliberation`, with an inspectable non-`not-run` run reference, exit code 0, timestamp, and complete suite summary.
4. If the canonical gate fails, inspect its output before changing anything. Make a minimal test-only correction only for a reproduced failure in the accepted assertion; otherwise report infrastructure or unrelated failures as blockers.
5. Write `plans/checkpoints/swift-crag-0793.evidence.md` with the inherited local checkpoint, exact fresh Test Gate reference/output, the runtime-path ownership disposition, and the parent acceptance result. Transcribe facts only; never relabel a local run as canonical.
6. Write `plans/checkpoints/swift-crag-0793.checkpoint.md` linking this plan, the evidence artifact, parent acceptance result, retry manifest/result, and task-scoped path disposition.
7. Run `acceptance` against the fresh retry manifest. It must report a passing canonical gate for goal-002 and either no runtime paths in scope or explicit concurrent ownership for all three paths before goal-003 can pass.
8. Run `git diff --check` on the new checkpoint/evidence artifacts. Invoke `save-learning` last, save at least one provenance or ownership learning, and make no edits afterward.

## Files to Modify

| File                                              | Change                                                            |
| ------------------------------------------------- | ----------------------------------------------------------------- |
| `plans/checkpoints/swift-crag-0793.evidence.md`   | Record exact canonical gate and runtime-path ownership evidence.  |
| `plans/checkpoints/swift-crag-0793.checkpoint.md` | Link the plan and all parent/fresh acceptance inputs.             |
| `learnings/**`                                    | Add the mandatory final-session learning through `save-learning`. |

No production or test file changes are planned.

## TDD: skip

This is an evidence and scope-attribution follow-up after a test-only change; the parent manifest explicitly did not require TDD, and a post-change RED would be fabricated.

## Verification

- The caller-owned Test Gate records exactly `pnpm vitest run extensions/deliberation`, exits 0, and is not `not-run`.
- The retry manifest or task-scoped diff excludes `extensions/deliberation/src/intake.ts`, `km-client.ts`, and `route-match.ts`, or assigns each exact path to a concurrent task.
- `acceptance` closes both findings from supplied artifacts.

## Dependencies

- A caller/monitor-owned Test Gate result and fresh retry manifest are required; local suite output cannot satisfy finding-001.
- The owner of the existing runtime edits must provide attribution or remove them from this task's scope; this task must not modify their files.

---

_Status: DRAFT_
