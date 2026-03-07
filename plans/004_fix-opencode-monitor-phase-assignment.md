# Plan 004: Fix opencode-monitor.py — correct phase assignment when a task finishes

Fix the phase transition logic in `opencode-monitor.py` so that orphaned tasks get the correct phase based on their current phase, not a blanket `phase=done`.

*Status: DRAFT*
*Vytvořeno: 2026-03-07*

---

## Progress

- [x] Fáze 0: Config + Init
- [x] Fáze 1: Research
- [x] Fáze 2: Knowledge
- [x] Fáze 3: Synthesis

## Problem

`~/.openclaw/workspace/km-system/scripts/opencode-monitor.py` currently marks orphaned tasks as `phase=done, status=done` regardless of which phase they were in. This is wrong because a task in the `planning` phase should transition to `phase=planned` (not `done`), since implementation hasn't happened yet.

### Correct lifecycle

```
planning → planned → implementing → done
   ↓          ↓          ↓           
 failed     failed      failed       
```

- `status=done` means the **current phase** finished successfully
- `status=running` means the current phase is active
- `status=failed` means something went wrong

### When monitor detects orphaned task (no process, age > 5min):

| Current phase | Correct transition |
|---|---|
| `planning` (status=running) | → `phase=planned`, `status=done` |
| `implementing` (status=running) | → `phase=done`, `status=done` |

### Phase/status mismatch fixes (always apply, even without orphan detection):
- `status=done` + `phase=implementing` → `phase=done`
- `status=failed` + `phase=implementing` → `phase=failed`
- `status=done` + `phase=planning` → `phase=planned`
- `status=failed` + `phase=planning` → `phase=failed`

### Active task detection:
A task is "active" only if: `status=running` AND `phase` is `planning` or `implementing`.
A task with `phase=planned` and `status=done` is NOT active — it's waiting for implementation.

## Analysis

### Kontext z codebase

**Primary file to modify:** `~/.openclaw/workspace/km-system/scripts/opencode-monitor.py` (229 lines)

**Key functions with bugs:**

1. **`is_phase_status_mismatch()` (lines 99-107)** — Only checks for `phase != "done"` when `status == "done"` and `phase != "failed"` when `status == "failed"`. Missing: when `status=done` and `phase=planning`, the correct fix is `phase=planned` (not `phase=done`). The function itself is OK as a detector (it correctly identifies mismatches), but the *fixer* logic uses `new_phase = old_status` which is wrong for the planning→planned case.

2. **Phase/status mismatch fix block (lines 154-168)** — Sets `new_phase = old_status` (line 158), which means `status=done` → `phase=done`. This is wrong for `phase=planning` where it should become `phase=planned`.

3. **`is_active_task()` (lines 110-127)** — Returns `True` for `status in ("running", "planning")` (line 120). The value `"planning"` is not a valid status — it's a phase value. Also returns `True` for `phase in ("implementing", "planning", "planned")` with non-terminal status (line 124), which is too broad — `phase=planned, status=done` should NOT be active.

4. **Orphan transition block (lines 186-208)** — Unconditionally sets `task["status"] = "done"` and `task["phase"] = "done"` (lines 190-191). Should set `phase=planned` when `current_phase == "planning"`.

5. **`needs_deploy` list (lines 197-198)** — Triggers deploy for `old_phase == "implementing"` OR `old_status == "running"`. The `old_status == "running"` condition is too broad — a planning task with `status=running` that becomes orphaned shouldn't trigger deploy.

**Related files:**
- `~/.openclaw/workspace/km-system/scripts/task-state.py` — task state reader/writer (no phase logic bugs, but shows field structure)
- `~/.openclaw/workspace/km-system/scripts/start-task.sh` — task launcher, defines the phases: `planning` (phase=planning, status=running) → `implementing` (phase=implementing, status=running)
- `~/.openclaw/workspace/km-system/state/opencode-tasks.json` — live state file with 22 tasks
- `~/.openclaw/cron/jobs.json` — cron job `opencode-monitor` runs every 2 minutes

**Evidence of the bug in production:** Tasks `dark-fork-2858`, `bright-reef-3991`, `dark-mist-6027` all have `result: "completed (detected by monitor)"` — these were orphaned and blanket-marked `phase=done`.

### Knowledge base

No formal learnings directory for this project. The knowledge is embedded in the codebase:

- **start-task.sh** defines the canonical state transitions:
  - `--phase plan` → sets `phase=planning, status=running`
  - `--phase implement` → sets `phase=implementing, status=running`
- **task-state.py** `update` command only sets `status` (done/failed) + `finishedAt`, does NOT update `phase` — this is by design, the monitor is supposed to handle phase correction.
- **Cron job** runs every 2 minutes, calls the script, and triggers `deploy-fork.sh all` when `needs_deploy` is non-empty.

## Solution

Single solution — fix the five bugs in `opencode-monitor.py`. No architectural changes needed; the overall structure is sound, only the transition logic is wrong.

### Approach: Phase-aware transition map

Replace the blanket `phase = status` logic with a phase-aware mapping:

```python
def resolve_phase(current_phase, terminal_status):
    """Given the current phase and a terminal status, return the correct new phase."""
    if terminal_status == "failed":
        return "failed"
    # status == "done": advance phase to its completion state
    if current_phase == "planning":
        return "planned"
    if current_phase == "implementing":
        return "done"
    # Already terminal or unknown — keep as-is
    return terminal_status  # fallback: "done"
```

This single function handles both:
- Mismatch correction (when status is already terminal but phase hasn't caught up)
- Orphan resolution (when we need to set both status and phase)

## Implementation

### Pre-implementation checklist
- [ ] Read current `opencode-monitor.py` to confirm line numbers haven't shifted
- [ ] Verify no other script depends on the blanket `phase=done` behavior

### Step 1: Add `resolve_phase()` helper function

Add after the `is_process_running()` function (after line 85):

```python
def resolve_phase(current_phase, terminal_status):
    """Given the current phase and a terminal status, return the correct new phase.
    
    - planning + done → planned (planning finished, waiting for implementation)
    - implementing + done → done (full lifecycle complete)
    - any phase + failed → failed
    """
    if terminal_status == "failed":
        return "failed"
    # status == "done": advance to phase completion state
    if current_phase == "planning":
        return "planned"
    if current_phase == "implementing":
        return "done"
    # Fallback for unknown phases
    return terminal_status
```

### Step 2: Fix `is_phase_status_mismatch()` (lines 99-107)

The detector function needs to also consider `phase=planning` with `status=done` as a mismatch (currently it checks `phase != "done"` which is true for `planning`, so it does detect it — but the fix applied in the caller is wrong). **The detector is actually correct**; the bug is in the fixer. No change needed here.

However, we should also detect `phase=planned` with `status=done` as **not a mismatch** — that's a valid resting state. Currently the function would check `status=="done"` and `phase != "done"` → returns True, which is wrong for `phase=planned`. Fix:

```python
def is_phase_status_mismatch(task):
    """Status is terminal but phase hasn't been updated to match."""
    status = task.get("status", "")
    phase = task.get("phase", "")
    if status == "done" and phase not in ("done", "planned"):
        return True
    if status == "failed" and phase != "failed":
        return True
    return False
```

### Step 3: Fix the mismatch fixer block (lines 154-168)

Replace `new_phase = old_status` with the `resolve_phase()` call:

```python
        # --- Fix phase/status mismatches (regardless of active status) ---
        if is_phase_status_mismatch(task):
            old_phase = task.get("phase", "")
            old_status = task.get("status", "")
            new_phase = resolve_phase(old_phase, old_status)
            task["phase"] = new_phase
            fixed.append({
                "id": task_id,
                "task": task_name,
                "reason": "phase_status_mismatch",
                "old_phase": old_phase,
                "new_phase": new_phase,
                "status": old_status,
            })
            continue
```

The only change is line `new_phase = resolve_phase(old_phase, old_status)` instead of `new_phase = old_status`.

### Step 4: Fix `is_active_task()` (lines 110-127)

Replace with stricter logic — active means `status=running` AND phase is `planning` or `implementing`:

```python
def is_active_task(task):
    """Task needs monitoring (actively running, not yet terminal)."""
    status = task.get("status", "")
    phase = task.get("phase", "")
    # Active = currently running in an active phase
    return status == "running" and phase in ("planning", "implementing")
```

This is much simpler and correct. It excludes:
- `phase=planned, status=done` (waiting for implementation — not active)
- `phase=done/failed` (terminal)
- `status=planning` (not a valid status, was a bug in the old code)

### Step 5: Fix the orphan transition block (lines 186-208)

Replace the blanket `phase=done` with phase-aware logic:

```python
        # --- Orphaned task: process gone + old enough ---
        old_phase = task.get("phase", "")
        old_status = task.get("status", "")

        new_phase = resolve_phase(old_phase, "done")
        task["status"] = "done"
        task["phase"] = new_phase
        task["finishedAt"] = task.get("finishedAt") or now_iso()
        if not task.get("result"):
            task["result"] = "completed (detected by monitor)"

        # Only trigger deploy for tasks that completed FULL implementation
        if new_phase == "done" and old_phase == "implementing":
            needs_deploy.append(task_id)

        fixed.append({
            "id": task_id,
            "task": task_name,
            "reason": "orphaned_process",
            "old_phase": old_phase,
            "new_phase": new_phase,
            "old_status": old_status,
            "new_status": "done",
        })
```

Key changes:
- `new_phase = resolve_phase(old_phase, "done")` instead of hardcoded `"done"`
- Deploy only when `new_phase == "done"` (full implementation done), not for planning→planned transitions
- Report includes `new_phase` which may be `"planned"` or `"done"`

### Step 6: Update `is_terminal()` to recognize `planned` as a resting state

The current `is_terminal()` only considers `phase == status` (both `done` or both `failed`). A task with `phase=planned, status=done` is not terminal in the lifecycle sense (it still needs implementation), but it IS in a stable resting state. We should NOT change `is_terminal()` because it's used correctly — these planned tasks should still be picked up by the "active task" check and left alone (the new `is_active_task()` already handles this).

**No change needed** to `is_terminal()`.

## Files to Modify

| File | Change |
|------|--------|
| `~/.openclaw/workspace/km-system/scripts/opencode-monitor.py` | All 5 fixes described above |

## Testing

### Manual test procedure

1. **Dry-run with current state:**
   ```bash
   python3 ~/.openclaw/workspace/km-system/scripts/opencode-monitor.py --dry-run
   ```
   Verify output JSON shows correct behavior for existing tasks.

2. **Create a test state file with known mismatches:**
   ```bash
   # Backup current state
   cp ~/.openclaw/workspace/km-system/state/opencode-tasks.json /tmp/opencode-tasks-backup.json
   ```
   
   Add test tasks to the state file:
   ```json
   {"id": "test-1", "task": "test planning orphan", "phase": "planning", "status": "running", "pid": 99999, "startedAt": "2026-03-01T00:00:00+00:00", "planningStartedAt": "2026-03-01T00:00:00+00:00"}
   {"id": "test-2", "task": "test implementing orphan", "phase": "implementing", "status": "running", "pid": 99998, "startedAt": "2026-03-01T00:00:00+00:00", "implementingStartedAt": "2026-03-01T00:00:00+00:00"}
   {"id": "test-3", "task": "test planning mismatch", "phase": "planning", "status": "done"}
   {"id": "test-4", "task": "test implementing mismatch", "phase": "implementing", "status": "done"}
   {"id": "test-5", "task": "test planned done (should be left alone)", "phase": "planned", "status": "done"}
   ```

3. **Expected results:**

   | Test task | Expected outcome |
   |-----------|-----------------|
   | test-1 (planning orphan, pid 99999 dead) | → `phase=planned, status=done`. NOT in `needs_deploy`. |
   | test-2 (implementing orphan, pid 99998 dead) | → `phase=done, status=done`. IN `needs_deploy`. |
   | test-3 (planning + done mismatch) | → `phase=planned` (mismatch fix). NOT in `needs_deploy`. |
   | test-4 (implementing + done mismatch) | → `phase=done` (mismatch fix). |
   | test-5 (planned + done) | No change (not a mismatch, not active). |

4. **Restore state after testing:**
   ```bash
   cp /tmp/opencode-tasks-backup.json ~/.openclaw/workspace/km-system/state/opencode-tasks.json
   ```

### Regression check

After applying the fix, the cron job continues running every 2 minutes. Monitor the next few runs:
```bash
# Watch the cron output
tail -f /tmp/opencode-monitor-*.log
```

Verify that:
- Currently running tasks (like `fresh-dune-8581` in planning) are NOT prematurely marked done
- Already-terminal tasks are not re-processed
- The `needs_deploy` list only fires for implementing→done transitions

## Dependencies

- No external dependencies or library changes
- No changes to other scripts (`task-state.py`, `start-task.sh`, `supervisor-check.py`)
- The cron job payload in `jobs.json` does NOT need changes (it already just runs the script and acts on the JSON output)
- The `deploy-fork.sh` script does NOT need changes (it receives task IDs from `needs_deploy` and deploys)

---
*Vytvořeno: 2026-03-07*
*Status: DRAFT*
