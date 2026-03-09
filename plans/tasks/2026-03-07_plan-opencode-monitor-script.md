Use the compound-plan skill to create a detailed implementation plan for:

**Refactor opencode-monitor cron job to use a Python script instead of a pure LLM prompt**

## Current State

The `opencode-monitor` cron job (in `~/.openclaw/cron/jobs.json`) runs every 2 minutes using a mini LLM (gpt-5-mini) with a long natural-language prompt. The LLM reads the task state file, checks for orphaned tasks (no opencode process running), and updates their status.

Problem: LLM behavior is inconsistent. The same logic should always work the same way. We want a Python script that does the deterministic part, and the LLM just runs the script + acts on structured output.

## Goal

Create a Python script `~/.openclaw/workspace/km-system/scripts/opencode-monitor.py` that:

1. Reads `~/.openclaw/workspace/km-system/state/opencode-tasks.json`
2. Finds all "active" tasks — where:
   - `status` is `running` or `planning`, OR
   - `phase` is `implementing`, `planning`, or `planned` (and status is not `done`/`failed`)
3. For each active task, checks if its opencode process is still running:
   - If `pid` is set: check `ps -p <pid>` (or scan `ps aux | grep opencode`)
   - If no process found AND task `startedAt` (or `planningStartedAt`/`implementingStartedAt`) is > 5 minutes ago → task is orphaned
4. For orphaned tasks:
   - If `status=done` or `status=failed` but `phase` doesn't match → fix phase to match status (e.g. `status=done, phase=implementing` → `phase=done`)
   - If `status=running/planning` and no process → mark `status=done, phase=done, finishedAt=<now>` (process completed normally)
   - If `status=failed` and `phase=implementing/planning` → fix `phase=failed`
5. Outputs a JSON summary:
   ```json
   {
     "active_count": 0,
     "fixed": [
       {
         "id": "...",
         "old_phase": "implementing",
         "new_phase": "done",
         "old_status": "done",
         "new_status": "done"
       }
     ],
     "needs_deploy": ["task-id-that-was-running-and-is-now-done"],
     "nothing_to_do": true
   }
   ```
6. Writes the updated state file if any changes were made

## Updated cron job prompt

After the script exists, update the `opencode-monitor` cron job payload message to:

1. Run: `python3 ~/.openclaw/workspace/km-system/scripts/opencode-monitor.py`
2. Parse the JSON output
3. If `nothing_to_do: true` → reply NO_REPLY
4. If `needs_deploy` is non-empty → run `bash /Users/michal/.openclaw/workspace/km-system/scripts/deploy-fork.sh all 2>&1`
5. If `fixed` is non-empty → return a short summary for delivery

## Constraints

- Script must be standalone Python 3, no external deps beyond stdlib
- Script must be idempotent (safe to run multiple times)
- Script should handle missing/corrupt state file gracefully (treat as no active tasks)
- The cron job prompt becomes much shorter and simpler — just "run script, parse JSON, act on it"

Project: ~/Projects/openclaw-fork
Plans output dir: ~/Projects/openclaw-fork/plans/
