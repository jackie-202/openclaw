# Plan file auto-linking — implementation

Implement the plan at ~/Projects/openclaw-fork/plans/007_plan-file-auto-linking.md

Follow the plan exactly. Summary of what needs to be done:

1. **start-task.sh** — add `projectDir` field to the task record (both plan and implement phases)
2. **opencode-monitor.py** — after save_state, call `link-plan.py --all`; also set `plannedAt` on planning→planned transition
3. **link-plan.py** (NEW script) — plan file linker with:
   - Primary: log scraping (`/tmp/opencode-<planSessionId>.log`, find last `Write plans/NNN_*.md`)
   - Fallback: timestamp-based scan of `<projectDir>/plans/*.md` (not tasks/ subdir), if exactly 1 match in time window
   - Derive `projectDir` from `taskFile` if not stored in record (2 levels up from `/plans/tasks/`)
   - Usage: `link-plan.py <task_id>` or `link-plan.py --all`
   - Atomic state writes via os.replace()
   - ANSI stripping for log parsing
4. **Backfill** — after creating link-plan.py, run `python3 link-plan.py --all` to fix any existing tasks with planFile=null

Project: ~/Projects/openclaw-fork
