# Plan 001: Refactor opencode-monitor cron job to Python script

Refactor the `opencode-monitor` cron job from a pure LLM prompt to a deterministic Python script that handles orphaned task detection and state cleanup, with the LLM only acting on structured JSON output.

_Status: DRAFT_
_Created: 2026-03-07_

---

## Progress

- [x] Phase 0: Config + Init
- [x] Phase 1: Research
- [x] Phase 2: Knowledge
- [x] Phase 3: Synthesis

## Problem

The `opencode-monitor` cron job runs every 2 minutes using gpt-5-mini with a long natural-language prompt (~30 lines). The LLM reads the task state file, checks for orphaned tasks (no opencode process running), and updates their status. LLM behavior is inconsistent — the same deterministic logic should always produce the same results.

**Goal:** A standalone Python script does all the deterministic work (process checking, state transitions, file writes) and outputs structured JSON. The cron job prompt becomes 5 lines: "run script, parse JSON, act on it."

## Analysis

### Codebase context

**Current cron job** (`~/.openclaw/cron/jobs.json`, job `opencode-monitor`):

- Schedule: every 120s (`everyMs: 120000`)
- Model: `copilot/gpt-5-mini` with 90s timeout
- Delivery: `announce` to WhatsApp `+420736490171`
- Prompt: ~30 lines of natural language describing the full detection logic
- Current issues: LLM sometimes misclassifies tasks, inconsistent phase/status fixing

**State file** (`~/.openclaw/workspace/km-system/state/opencode-tasks.json`):

- Structure: `{"tasks": [{...}, ...]}`
- Task fields: `id`, `sessionId`, `task`, `startedAt`, `status`, `phase`, `finishedAt`, `result`, `pid`, `planFile`, `taskFile`, `definedAt`, `implementingStartedAt`, `planningStartedAt`, `plannedAt`, `planSessionId`, `implSessionId`, `errorMessage`
- Status values observed: `running`, `done`, `failed`
- Phase values observed: `planning`, `implementing`, `done`, `failed`, `planned`
- Real data has 20+ tasks, most completed

**Real edge cases found in current state file:**
| Task ID | Status | Phase | Issue |
|---------|--------|-------|-------|
| `cool-opus-` | `failed` | `implementing` | Phase should be `failed` to match status |
| `opus-impl-4429` | `done` | `implementing` | Phase should be `done` to match status |
| `dark-fork-2858` | `running` | `planning` | Active task — needs process check (pid=4881) |

**Existing scripts (patterns to follow):**

- `task-state.py`: Shared load/save for the state file, `now_iso()` helper. **Reuse `load()`/`save()` pattern.**
- `supervisor-check.py`: Structured output pattern (ALL_CLEAR / NEEDS_ATTENTION). Good model for output design.
- `deploy-fork.sh`: OK/FAIL/SKIP structured output. Called by the cron job on task completion.
- `start-task.sh`: Creates task records, sets PIDs. Shows the full task lifecycle.

### Relevant documentation

- No formal docs for the task lifecycle. The schema is defined implicitly by `start-task.sh` and `task-state.py`.
- Task phases: `defined` → `planning` → `planned` → `implementing` → `done`/`failed`

### Knowledge base

**Patterns from existing scripts:**

- All Python scripts are stdlib-only (no external deps)
- State file path is hardcoded: `~/.openclaw/workspace/km-system/state/opencode-tasks.json`
- ISO timestamps use `datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S+00:00")`
- JSON indented with 2 spaces, `ensure_ascii=False`
- Graceful handling of missing/corrupt state file: return `{"tasks": []}`

**Cron job patterns:**

- "Script-first" jobs (autocommit, transcript-export) have the simplest LLM prompts
- LLM prompt for script-first: "Run this exact command and report ONLY the output"
- For jobs needing conditional logic post-script: keep prompt short, reference JSON output fields

## Solution

### Approach: Single Python script with JSON output

Create `~/.openclaw/workspace/km-system/scripts/opencode-monitor.py` that:

1. Loads the state file (graceful on missing/corrupt)
2. Identifies active tasks (deterministic criteria)
3. Checks each active task's process liveness via `ps -p <pid>`
4. Applies state transitions for orphaned tasks
5. Writes updated state file (only if changes made)
6. Outputs structured JSON to stdout

The cron job prompt becomes ~10 lines: run script, parse JSON, conditionally deploy or reply.

### Why not extend `task-state.py`?

`task-state.py` is a CLI helper for manual operations. The monitor script has different concerns (process checking, time thresholds, batch operations). Keeping them separate avoids coupling.

### Why not use `supervisor-check.py`?

Different scope — supervisor checks gateway health, journal, cron errors. The monitor focuses solely on task lifecycle. Could merge later if needed.

## Implementation

### Pre-implementation checklist

- [ ] Verify Python 3 is available at `/usr/bin/python3` or via `python3`
- [ ] Ensure `~/.openclaw/workspace/km-system/scripts/` directory exists
- [ ] Confirm state file schema matches what's documented above

### Step 1: Create `opencode-monitor.py`

**File:** `~/.openclaw/workspace/km-system/scripts/opencode-monitor.py`

```python
#!/usr/bin/env python3
"""
opencode-monitor.py — Deterministic monitor for opencode background tasks.

Reads the task state file, identifies active/orphaned tasks, fixes
phase/status inconsistencies, and outputs a structured JSON summary.

Designed to be called by a cron job LLM that only needs to:
1. Run this script
2. Parse JSON output
3. Trigger deploy if needed
4. Deliver summary if needed

Usage:
    python3 opencode-monitor.py              # normal run (reads + writes state)
    python3 opencode-monitor.py --dry-run    # check only, don't write changes
"""

import json
import os
import subprocess
import sys
from datetime import datetime, timezone, timedelta

STATE_FILE = os.path.expanduser(
    "~/.openclaw/workspace/km-system/state/opencode-tasks.json"
)
ORPHAN_THRESHOLD_MINUTES = 5
```

**Core functions:**

```python
def load_state():
    """Load state file, return empty structure on missing/corrupt."""
    try:
        with open(STATE_FILE) as f:
            data = json.load(f)
        if "tasks" not in data or not isinstance(data["tasks"], list):
            return {"tasks": []}
        return data
    except (FileNotFoundError, json.JSONDecodeError, OSError):
        return {"tasks": []}

def save_state(data):
    """Write state file atomically (write to tmp, rename)."""
    tmp = STATE_FILE + ".tmp"
    os.makedirs(os.path.dirname(STATE_FILE), exist_ok=True)
    with open(tmp, "w") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    os.replace(tmp, STATE_FILE)

def now_iso():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S+00:00")

def parse_iso(s):
    """Parse ISO timestamp string, return datetime or None."""
    if not s:
        return None
    try:
        # Handle +00:00 suffix
        s = s.replace("+00:00", "+0000").replace("Z", "+0000")
        for fmt in ("%Y-%m-%dT%H:%M:%S%z", "%Y-%m-%dT%H:%M:%S.%f%z"):
            try:
                return datetime.strptime(s, fmt)
            except ValueError:
                continue
        return None
    except Exception:
        return None

def is_process_running(pid):
    """Check if process with given PID is still running."""
    if not pid:
        return False
    try:
        result = subprocess.run(
            ["ps", "-p", str(pid)],
            capture_output=True, text=True, timeout=5
        )
        return result.returncode == 0
    except Exception:
        return False

def is_active_task(task):
    """Determine if a task is considered 'active' (needs monitoring)."""
    status = task.get("status", "")
    phase = task.get("phase", "")

    # Explicit active statuses
    if status in ("running", "planning"):
        return True

    # Phase indicates work in progress, but status hasn't been set to terminal
    if phase in ("implementing", "planning", "planned") and status not in ("done", "failed"):
        return True

    return False

def is_phase_status_mismatch(task):
    """Check if phase doesn't match terminal status (needs fixing)."""
    status = task.get("status", "")
    phase = task.get("phase", "")

    if status == "done" and phase not in ("done",):
        return True
    if status == "failed" and phase not in ("failed",):
        return True
    return False

def get_task_age_minutes(task):
    """Get minutes since the task started (using most relevant timestamp)."""
    now = datetime.now(timezone.utc)
    # Try timestamps in order of specificity
    for field in ("implementingStartedAt", "planningStartedAt", "startedAt", "definedAt"):
        ts = parse_iso(task.get(field))
        if ts:
            delta = now - ts
            return delta.total_seconds() / 60
    return 0
```

**Main logic:**

```python
def run_monitor(dry_run=False):
    data = load_state()
    tasks = data.get("tasks", [])

    fixed = []
    needs_deploy = []
    active_count = 0

    for task in tasks:
        task_id = task.get("id", "unknown")

        # --- Fix phase/status mismatches (regardless of active status) ---
        if is_phase_status_mismatch(task):
            old_phase = task.get("phase", "")
            old_status = task.get("status", "")
            new_phase = old_status  # phase should match terminal status
            task["phase"] = new_phase
            fixed.append({
                "id": task_id,
                "reason": "phase_status_mismatch",
                "old_phase": old_phase,
                "new_phase": new_phase,
                "old_status": old_status,
                "new_status": old_status,
            })
            continue

        # --- Check active tasks ---
        if not is_active_task(task):
            continue

        active_count += 1
        pid = task.get("pid")
        age_minutes = get_task_age_minutes(task)

        # Process still running — nothing to do
        if is_process_running(pid):
            continue

        # Process not running but task is young — give it time
        if age_minutes < ORPHAN_THRESHOLD_MINUTES:
            continue

        # --- Orphaned task: process gone, task old enough ---
        old_phase = task.get("phase", "")
        old_status = task.get("status", "")

        # Determine what happened
        if old_status in ("running", "planning"):
            # Process exited normally (no explicit failure)
            task["status"] = "done"
            task["phase"] = "done"
            task["finishedAt"] = task.get("finishedAt") or now_iso()
            if not task.get("result"):
                task["result"] = "completed (detected by monitor)"
            new_status = "done"
            new_phase = "done"

            # Only trigger deploy for tasks that were actively implementing
            if old_phase == "implementing" or old_status == "running":
                needs_deploy.append(task_id)
        else:
            # Shouldn't normally reach here (is_active_task filters),
            # but handle defensively
            new_status = old_status
            new_phase = old_status
            task["phase"] = new_phase

        fixed.append({
            "id": task_id,
            "reason": "orphaned_process",
            "old_phase": old_phase,
            "new_phase": new_phase,
            "old_status": old_status,
            "new_status": new_status,
        })
        active_count -= 1  # No longer active after fix

    # Write state file if any changes
    changes_made = len(fixed) > 0
    if changes_made and not dry_run:
        save_state(data)

    # Build output
    result = {
        "active_count": active_count,
        "fixed": fixed,
        "needs_deploy": needs_deploy,
        "nothing_to_do": len(fixed) == 0 and active_count == 0,
        "changes_written": changes_made and not dry_run,
        "dry_run": dry_run,
    }
    return result


if __name__ == "__main__":
    dry_run = "--dry-run" in sys.argv
    result = run_monitor(dry_run=dry_run)
    print(json.dumps(result, indent=2))
```

### Step 2: Update the cron job prompt

**Current prompt:** ~30 lines of natural language logic  
**New prompt:** ~12 lines, purely imperative

```
Check for completed opencode tasks.

1. Run: python3 ~/.openclaw/workspace/km-system/scripts/opencode-monitor.py
2. Parse the JSON output.
3. If "nothing_to_do" is true AND "fixed" is empty: reply NO_REPLY
4. If "needs_deploy" is non-empty: run `bash /Users/michal/.openclaw/workspace/km-system/scripts/deploy-fork.sh all 2>&1` and note FAIL lines.
5. If "fixed" is non-empty: return a short summary of changes (task name + old→new phase/status) and deploy result if applicable. This will be delivered automatically.
6. If only "active_count" > 0 and nothing was fixed: reply NO_REPLY (tasks still running, nothing to do).
```

### Step 3: Apply the cron job update

Edit `~/.openclaw/cron/jobs.json` — replace the `message` field of the `opencode-monitor` job (id: `d401fb17-b12e-42ad-943c-14638d907071`).

## Files to Create/Modify

| File                                                          | Action     | Description                                                            |
| ------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------- |
| `~/.openclaw/workspace/km-system/scripts/opencode-monitor.py` | **CREATE** | New Python script — deterministic task monitoring                      |
| `~/.openclaw/cron/jobs.json`                                  | **MODIFY** | Replace `opencode-monitor` job's `message` field with new short prompt |

## Testing

### Manual testing sequence

1. **Dry run (no state changes):**

   ```bash
   python3 ~/.openclaw/workspace/km-system/scripts/opencode-monitor.py --dry-run
   ```

   Verify JSON output includes the known mismatches (`cool-opus-`, `opus-impl-4429`).

2. **Verify mismatch detection:**
   - `cool-opus-`: `status=failed, phase=implementing` → should appear in `fixed` with `new_phase=failed`
   - `opus-impl-4429`: `status=done, phase=implementing` → should appear in `fixed` with `new_phase=done`

3. **Verify active task detection:**
   - `dark-fork-2858`: `status=running, phase=planning, pid=4881` → should be counted as active
   - If pid 4881 is not running and age > 5min → should appear in `fixed` and `needs_deploy`

4. **Live run (writes state):**

   ```bash
   python3 ~/.openclaw/workspace/km-system/scripts/opencode-monitor.py
   ```

   Verify state file is updated, mismatches are fixed.

5. **Idempotency test:**

   ```bash
   python3 ~/.openclaw/workspace/km-system/scripts/opencode-monitor.py
   python3 ~/.openclaw/workspace/km-system/scripts/opencode-monitor.py
   ```

   Second run should output `{"nothing_to_do": true, "fixed": [], ...}`.

6. **Missing state file test:**

   ```bash
   mv ~/.openclaw/workspace/km-system/state/opencode-tasks.json /tmp/backup.json
   python3 ~/.openclaw/workspace/km-system/scripts/opencode-monitor.py
   # Should output: {"nothing_to_do": true, "active_count": 0, "fixed": [], ...}
   mv /tmp/backup.json ~/.openclaw/workspace/km-system/state/opencode-tasks.json
   ```

7. **Cron job integration test:**
   After updating `jobs.json`, wait for next cron cycle (2min) and verify in cron logs that:
   - Script runs successfully
   - LLM correctly parses JSON output
   - NO_REPLY is returned when `nothing_to_do: true`
   - Deploy triggers when `needs_deploy` is non-empty

## Dependencies

- Python 3 (stdlib only) — already available and used by other km-system scripts
- `ps` command — standard macOS/Linux utility
- State file schema — stable, defined by `start-task.sh` / `task-state.py`
- `deploy-fork.sh` — existing script, no changes needed
- Cron system — functional (job already runs every 2 min)

## Risks and Mitigations

| Risk                                     | Impact                | Mitigation                                                |
| ---------------------------------------- | --------------------- | --------------------------------------------------------- |
| Script crashes mid-write → corrupt state | State lost            | Atomic write via `os.replace()` (write to `.tmp`, rename) |
| Process PID reuse (rare)                 | False "still running" | 5-minute age threshold makes this extremely unlikely      |
| State file locked by another writer      | Race condition        | Unlikely at 2min intervals; atomic write helps            |
| LLM fails to parse JSON                  | No action taken       | JSON is simple; fallback: LLM reports raw output          |

---

_Created: 2026-03-07_
_Status: DRAFT_
