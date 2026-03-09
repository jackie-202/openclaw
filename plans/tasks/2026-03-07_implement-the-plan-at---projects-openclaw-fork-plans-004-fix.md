Implement the plan at ~/Projects/openclaw-fork/plans/004_fix-opencode-monitor-phase-assignment.md

Summary of what to change in ~/.openclaw/workspace/km-system/scripts/opencode-monitor.py:

1. Fix orphan → final phase transition:
   - If orphaned task had phase=planning (status=running) → set phase=planned, status=done
   - If orphaned task had phase=implementing (status=running) → set phase=done, status=done

2. Fix mismatch-correction logic (always apply regardless of process state):
   - status=done + phase=planning → phase=planned
   - status=done + phase=implementing → phase=done
   - status=failed + phase=planning → phase=failed
   - status=failed + phase=implementing → phase=failed

3. Fix active-task detection:
   - A task is "active" ONLY if status=running AND phase is "planning" or "implementing"
   - phase=planned + status=done is NOT active (it's waiting for impl, leave it alone)
   - phase=done or phase=failed are never active

4. Fix needs_deploy list:
   - Only include tasks that transitioned to phase=done (full implementation completed)
   - Do NOT include tasks that transitioned to phase=planned (only planning done)

The script is at: ~/.openclaw/workspace/km-system/scripts/opencode-monitor.py
