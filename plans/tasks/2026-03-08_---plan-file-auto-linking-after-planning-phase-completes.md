Use the compound-plan skill to create a plan for:

## Plan file auto-linking after planning phase completes

### Problem

When the opencode monitor detects that a planning session finished (process gone, phase=planning → planned), it sets `planFile: null` and writes `result: "completed (detected by monitor)"`. The `planFile` field is never populated, so the dashboard shows no linked plan even though opencode did create one.

The current workaround — manually scanning `plans/` for the newest file — is NOT acceptable. We run multiple planning sessions in parallel, so the newest plan file may belong to a different task.

### What we need

A robust way to link the correct plan file to each task after the planning session finishes.

The solution must work even when:

- Multiple tasks are planned in parallel
- The monitor runs and detects orphaned tasks without per-session knowledge
- The task-state record already has phase=planned and status=done when linking happens

### System context

- State file: `~/.openclaw/workspace/km-system/state/opencode-tasks.json`
- Task records have these fields: `id`, `task`, `taskFile`, `planSessionId`, `planFile` (null until linked)
- Plans are created by opencode and placed in `<project>/plans/NNN_*.md` (numbered, auto-named)
- The planning task text file is at `taskFile` — it contains the task description as input to opencode
- The monitor script: `~/.openclaw/workspace/km-system/scripts/opencode-monitor.py`
- The start-task script: `~/.openclaw/workspace/km-system/scripts/start-task.sh`
- Plans output dirs: `~/Projects/openclaw-fork/plans/` and `~/Projects/mission-control/plans/`

### Possible approaches to consider

1. **Write planFile in start-task.sh** — before launching opencode, can we predict the plan filename? Probably not reliably (numbered, opencode decides the name).

2. **Scan plans dir, correlate by timestamp** — after planning finishes, scan `plans/` for files created AFTER `planningStartedAt` and BEFORE `finishedAt`. This is more robust than "newest file" and works with parallel sessions.

3. **Have opencode write a sidecar file** — opencode writes a `.planlink` or similar file with the plan path at the end of the planning task. Monitor reads it. Requires changes to planning task templates.

4. **Log scraping** — parse the opencode log at `/tmp/opencode-<sessionId>.log` for any mention of the plan file path.

5. **Embed task ID in plan filename** — modify the compound-plan skill or task template to include the task ID in the plan filename so they can be matched exactly.

Evaluate these approaches and recommend the most reliable one that works with parallel sessions. The plan should also address where the fix belongs (start-task.sh, opencode-monitor.py, both, or a new helper script).

Project: ~/Projects/openclaw-fork
Plans output dir: ~/Projects/openclaw-fork/plans/
