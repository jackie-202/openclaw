# Remove fork-only trajectory batched writer and cron trajectory opt-out

## Context

Fork carries two unused fork-only commits we want gone before the next upstream sync (clean-upstream + cherry-pick would otherwise carry them forever):

- `47c4aff1db` feat(trajectory): batched file writer with persistent handle and debounced flushing
- `b0da725a11` feat(cron): trajectory opt-out field to agent turn payload

We do not use trajectory recording in production (no trajectory files in `~/.openclaw`, no config enabling it). A plain `git revert` of `47c4aff1db` conflicts in `src/trajectory/runtime.ts` because later commits touched the same code, so this must be a manual removal that restores upstream-equivalent behavior.

Goal: `src/trajectory/**`, `src/agents/queued-file-writer.*`, cron agentTurn payload, and embedded-agent-runner should match upstream/main behavior for these features (compare with `git diff upstream/main -- <paths>` where files exist upstream).

## Scope

- `src/trajectory/runtime.ts` + tests — remove batched-writer integration, restore per-event flush as upstream has it.
- `src/agents/queued-file-writer.ts` + tests — remove `createBatchedFileWriter` and the extracted helper additions from `47c4aff1db` (keep anything upstream owns).
- `src/cron/isolated-agent/**`, `src/agents/embedded-agent-runner/**`, cron payload types — remove the `trajectory` opt-out field and its propagation from `b0da725a11`.
- `docs/tools/trajectory.md` — remove batched-writer docs section.
- Fork-local plans/learnings artifacts from those tasks stay untouched (project artifacts, never delete).

## Requirements

1. Use `git show 47c4aff1db` and `git show b0da725a11` as the authoritative list of what was added; remove those additions while preserving any later unrelated changes to the same files.
2. Where a file exists upstream, final content of the touched seams should be behaviorally equivalent to `upstream/main` (verify with targeted `git diff upstream/main -- <file>` and explain any remaining intentional diff in the final note).
3. Env flag `OPENCLAW_TRAJECTORY_BATCH` must disappear entirely.
4. Cron `CronAgentTurnPayload.trajectory` field and all propagation removed; existing cron behavior otherwise unchanged.
5. Remove tests added by those two commits; do not weaken other tests.

## Verification

- Focused tests: trajectory runtime tests, queued-file-writer tests, cron isolated-agent tests pass.
- Full build passes.
- `git grep -n "createBatchedFileWriter\|OPENCLAW_TRAJECTORY_BATCH" src/` returns nothing.
- `git grep -n "trajectory" src/cron/` shows no opt-out field.

## Acceptance

Both feature additions fully removed, touched seams upstream-equivalent (or intentional diffs documented), build + focused tests green.
