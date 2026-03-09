Use the compound-plan skill to create a detailed implementation plan for:

**Fix opencode-monitor.py — correct phase assignment when a task finishes**

Project: ~/Projects/openclaw-fork
Plans output dir: ~/Projects/openclaw-fork/plans/
External dirs with access: ~/.openclaw/workspace/**, ~/.openclaw/cron/**

## Problem

`~/.openclaw/workspace/km-system/scripts/opencode-monitor.py` currently marks orphaned tasks as `phase=done, status=done` regardless of which phase they were in. This is wrong.

## Correct lifecycle logic

A task goes through these phases in order:

- `planning` → `planned` → `implementing` → `done`
- At any phase it can go to `failed`

The `status` field reflects whether the **current phase** is complete:

- `status=done` means the current phase finished successfully
- `status=running` means the current phase is active
- `status=failed` means something went wrong

### When monitor detects orphaned task (no process, age > 5min):

| Current phase                                         | Correct transition               |
| ----------------------------------------------------- | -------------------------------- |
| `planning` (status=running)                           | → `phase=planned`, `status=done` |
| `implementing` (status=running)                       | → `phase=done`, `status=done`    |
| `planning` or `planned` (status=done) but phase wrong | fix phase only                   |
| `implementing` (status=done)                          | → `phase=done`, `status=done`    |
| `failed` with wrong phase                             | fix phase to `failed`            |

Key: `phase=planned` + `status=done` = planning finished, waiting for implementation.

### Phase/status mismatch fixes (always apply, even without orphan detection):

- `status=done` + `phase=implementing` → `phase=done`
- `status=failed` + `phase=implementing` → `phase=failed`
- `status=done` + `phase=planning` → `phase=planned`
- `status=failed` + `phase=planning` → `phase=failed`

### Active task detection (do NOT mark as orphaned):

A task is "active" (still potentially running) only if:

- `status=running` AND `phase` is `planning` or `implementing`

A task with `phase=planned` and `status=done` is NOT active — it's waiting for implementation, leave it alone.

## What to change

Update `~/.openclaw/workspace/km-system/scripts/opencode-monitor.py`:

1. Fix the orphan → done transition to set `phase=planned` when `current_phase == "planning"`
2. Fix the orphan → done transition to set `phase=done` when `current_phase == "implementing"`
3. Fix the mismatch-correction logic to include `planning→planned` correction
4. Update the active-task detection to only consider `status=running` tasks with phase `planning` or `implementing`
5. The `needs_deploy` list should only include tasks that transitioned to `phase=done` (full implementation done), not `phase=planned`
