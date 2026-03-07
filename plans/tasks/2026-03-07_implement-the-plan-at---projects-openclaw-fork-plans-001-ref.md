Implement the plan at ~/Projects/openclaw-fork/plans/001_refactor-opencode-monitor-cron-to-python.md

Summary of what to do:
1. CREATE ~/.openclaw/workspace/km-system/scripts/opencode-monitor.py — standalone Python 3 script:
   - Loads state file: ~/.openclaw/workspace/km-system/state/opencode-tasks.json
   - Fixes phase/status mismatches (status=done + phase=implementing → phase=done, etc.)
   - Finds active tasks (status=running/planning or phase=implementing/planning/planned and not done/failed)
   - Checks process liveness via ps -p <pid>
   - Marks orphaned tasks (no process + age > 5min) as done
   - Atomic writes via os.replace
   - Outputs JSON: {"active_count": N, "fixed": [...], "needs_deploy": [...], "nothing_to_do": bool}
   - Supports --dry-run flag
   - Make it executable (chmod +x)

2. MODIFY ~/.openclaw/cron/jobs.json — find the "opencode-monitor" job and replace its payload.message with a short prompt:
   Run: python3 ~/.openclaw/workspace/km-system/scripts/opencode-monitor.py
   Parse the JSON output.
   If nothing_to_do is true → reply NO_REPLY.
   If needs_deploy is non-empty → run bash /Users/michal/.openclaw/workspace/km-system/scripts/deploy-fork.sh all 2>&1 and include result in summary.
   If fixed is non-empty → return a short human-readable summary of what was fixed.
   Do NOT call any messaging tools yourself.

Follow the patterns from ~/.openclaw/workspace/km-system/scripts/task-state.py and supervisor-check.py for load/save and output style.
