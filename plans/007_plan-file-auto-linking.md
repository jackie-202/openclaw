# Plan 007: Plan File Auto-Linking After Planning Phase Completes

Robustly link the correct plan file to each task after the planning session finishes, using log-scraping as the primary method and timestamp-based scanning as fallback. Works with parallel sessions, requires changes to `start-task.sh`, `opencode-monitor.py`, and a new `link-plan.py` helper.

*Status: DRAFT*
*Created: 2026-03-08*

## Problem

When the opencode monitor detects that a planning session finished (process gone, phase=planning → planned), it sets `planFile: null` and writes `result: "completed (detected by monitor)"`. The `planFile` field is never populated, so the dashboard shows no linked plan even though opencode did create one.

The current workaround — manually scanning `plans/` for the newest file — is NOT acceptable because multiple planning sessions may run in parallel, so the newest plan file may belong to a different task.

### Requirements
- Must work with parallel planning sessions
- Must work when monitor detects orphaned tasks without per-session knowledge
- Must work when task-state record already has phase=planned and status=done

## Analysis [DONE]

### Context from codebase [DONE]

**State file structure** (`~/.openclaw/workspace/km-system/state/opencode-tasks.json`):
- Each task has: `id`, `task`, `taskFile`, `phase`, `status`, `planSessionId`, `implSessionId`, `planFile`, `pid`, `planningStartedAt`, `finishedAt`, `result`, etc.
- `planFile` is initialized as `null` in `start-task.sh:197`.
- Tasks with `planFile` populated were ALL set manually (via `task-state.py set-plan` or direct JSON edits).

**Monitor** (`opencode-monitor.py`):
- Lines 192-215: When a process is gone + old enough → sets `status=done`, resolves phase (`planning→planned`), sets `finishedAt`, sets `result="completed (detected by monitor)"`.
- **Never touches `planFile`** — this is the root cause.
- Has access to: task's `planSessionId`, `planningStartedAt`, `finishedAt`, `pid`, `taskFile`.
- Does NOT know the project directory or plans directory.

**start-task.sh**:
- Lines 146-206: Creates task record with `planFile: null`.
- Knows `PROJECT_DIR` at launch time but does NOT store it in the task record.
- Generates `SESSION_ID` (e.g., "bold-mist-3919"), stores it as `planSessionId`.
- Log goes to `/tmp/opencode-<SESSION_ID>.log`.

**task-state.py**:
- Already has a `set-plan` command (line 64-76) that matches by session ID or task ID.
- Currently unused in any automated flow.

**Plan naming by compound-plan skill**:
- Format: `NNN_kebab-case-name.md` (e.g., `006_upstream-sync-branch-strategy.md`)
- Number is determined at skill init: `ls plans/*.md | sort -V | tail -1` + 1.
- Name is derived from the task description by the skill.
- The plan file is created early (Phase 0 of compound-plan) as a WIP, then finalized.

**Opencode logs** (`/tmp/opencode-<sessionId>.log`):
- Contain Write tool output like `← Write plans/006_upstream-sync-branch-strategy.md`.
- The plan file path appears in the log as the Write tool target.
- Log files persist after the session ends.

**Project directory problem**:
- The task record does NOT store `projectDir`. The monitor doesn't know which `plans/` dir to scan.
- `taskFile` contains the full path (e.g., `/Users/michal/Projects/openclaw-fork/plans/tasks/...`), from which `projectDir` can be derived.

**Parallel session analysis** (from real state data):
- Tasks `quick-mist-4786` (openclaw-fork) and `quick-mist-5763` (mission-control) ran in parallel with `planFile: null` — exactly the problem scenario.
- Task `bold-mist-3919` is currently running (this very session).
- Historical tasks: `dark-fork-2858` through `quick-peak-8250` had `planFile` set — but these were set manually AFTER the fact, not by the monitor.

### Relevant documentation [DONE]

- No PlantUML diagrams exist for this subsystem.
- The km-system scripts are self-documenting (docstrings in each file).
- The compound-plan skill workflow docs confirm the plan file is created early in Phase 0 and finalized in Phase 3.

### Knowledge base [DONE]

No project-specific learnings directory exists for openclaw-fork.
Applied general patterns from existing code:
- **Atomic state writes**: `opencode-monitor.py` uses `os.replace()` for atomic writes — any new logic should follow this.
- **Session ID as key**: All scripts use `sessionId` / task `id` as the primary lookup key.
- **taskFile path convention**: Full absolute paths stored in `taskFile` field.

## Solutions

### Approach evaluation

| # | Approach | Parallel-safe? | Reliability | Complexity | Verdict |
|---|----------|---------------|-------------|------------|---------|
| 1 | Predict plan filename in start-task.sh | No | Low — opencode picks number + name | Low | **Rejected** — filename unpredictable |
| 2 | Timestamp-based scan of plans/ | Mostly | Medium — needs projectDir, time windows can overlap with parallel sessions if they finish in same minute | Medium | **Fallback** — good secondary strategy |
| 3 | Sidecar file (`.planlink`) | Yes | High — explicit link | Medium | **Not chosen** — requires compound-plan skill changes across all projects; skill is a shared config |
| 4 | Log scraping (`/tmp/opencode-<sessionId>.log`) | Yes | High — log contains exact Write path, scoped per session | Low | **Primary** — session-scoped, no skill changes |
| 5 | Embed task ID in plan filename | Yes | High — exact match | High | **Not chosen** — invasive change to compound-plan skill and all existing naming conventions |

### Chosen solution: Log scraping (primary) + Timestamp scan (fallback)

**Primary: Log scraping** — Parse `/tmp/opencode-<planSessionId>.log` for the last `Write plans/NNN_*.md` entry. This is:
- **Session-scoped**: Each session has its own log file, so parallel sessions cannot interfere.
- **Zero changes to opencode or compound-plan skill**: The log already contains the Write tool output.
- **High reliability**: The plan file is written at least twice during compound-plan (Phase 0 create, Phase 3 finalize), so the pattern is consistently present.

**Fallback: Timestamp-based scan** — If the log file is missing or unreadable, scan the project's `plans/` directory for `.md` files created between `planningStartedAt` and `finishedAt + 60s`. Filter out the `tasks/` subdirectory. If exactly one match, use it. If multiple matches, skip (don't guess).

### Why not the other approaches

- **Approach 1 (predict filename)**: The plan number is determined by `ls plans/*.md | sort -V | tail -1` at runtime inside opencode. With parallel sessions, two plans could race for the same number. Even without races, the kebab-case name is derived from the task description by the LLM, making it unpredictable.
- **Approach 3 (sidecar)**: Would require modifying the compound-plan skill's Phase 3 to write a sidecar file. The skill is shared across projects and agent sessions — touching it means coordination overhead. Log scraping gets the same result without skill changes.
- **Approach 5 (task ID in filename)**: Changes the plan naming convention (`NNN_taskid_name.md`), breaks existing sorting/display, and requires changes to the compound-plan skill. Overkill given log scraping works.

## Implementation

### Pre-implementation checklist

- [ ] Verify that `/tmp/opencode-*.log` files persist after session ends (confirmed: they do)
- [ ] Verify the Write pattern is consistent across sessions (confirmed: `← Write plans/NNN_*.md`)
- [ ] Ensure `projectDir` can be derived from existing task fields

### Step 1: Store `projectDir` in start-task.sh

**Where**: `~/.openclaw/workspace/km-system/scripts/start-task.sh`

Add `"projectDir": PROJECT_DIR` to the task record created in the Python block (line 183 area for plan phase). This gives the monitor and linker the directory context they need.

```python
# In the plan phase Python block, add to the new task dict:
"projectDir": project_dir,     # NEW — absolute path to project
```

Also add a 6th positional arg to the Python block to receive `PROJECT_DIR`.

For the implement phase Python block (line 210 area), add `projectDir` if not already set:
```python
if not t.get("projectDir"):
    t["projectDir"] = project_dir
```

### Step 2: Create `link-plan.py` helper script

**New file**: `~/.openclaw/workspace/km-system/scripts/link-plan.py`

Purpose: Given a task record, attempt to find and link the plan file.

```
Usage:
  link-plan.py <task_id>           # link plan for a specific task
  link-plan.py --all               # link plans for all tasks with planFile=null & phase=planned
```

Logic:
1. Load state file
2. For each target task (with `planFile == null` and `phase` in `["planned", "done"]` and `planSessionId` set):
   a. **Try log scraping first**: Read `/tmp/opencode-<planSessionId>.log`, extract last line matching `Write plans/.*\.md`. Resolve to absolute path using `projectDir` from task record.
   b. **Verify file exists**: If the extracted path exists on disk, set `planFile`.
   c. **Fallback to timestamp scan**: If log missing/unreadable/no match, scan `<projectDir>/plans/*.md` (not `tasks/`) for files with mtime between `planningStartedAt` and `finishedAt + 60s`. If exactly 1 match, use it.
   d. **Write state** if planFile was found.
3. Output JSON summary of linked/skipped/failed tasks.

Key implementation details:
- Log pattern to match: `Write plans/` (the `←` prefix is ANSI-decorated, so match on `Write plans/` after stripping ANSI)
- Use `os.path.getmtime()` for timestamp comparison
- Atomic state write via `os.replace()` (same pattern as monitor)
- Parse ANSI escape codes with a simple regex: `re.sub(r'\x1b\[[0-9;]*m', '', line)`

### Step 3: Call `link-plan.py` from the monitor

**Where**: `~/.openclaw/workspace/km-system/scripts/opencode-monitor.py`

After the monitor marks a planning task as done/planned (the orphaned process block, lines 196-215), call the plan-linking logic. Two implementation options:

**Option A (import)**: Import `link_plan` as a module and call it directly. This is cleaner but requires making link-plan importable.

**Option B (subprocess)**: After `save_state(data)`, run `subprocess.run(["python3", link_plan_path, "--all"])`. Simpler, keeps scripts decoupled.

**Recommended: Option B** — keeps scripts independent, the monitor just calls link-plan after writing state. Add this after line 220 (`save_state(data)`):

```python
if changes_made and not dry_run:
    save_state(data)
    # Attempt to link plan files for newly-completed planning tasks
    try:
        link_plan = os.path.join(os.path.dirname(__file__), "link-plan.py")
        subprocess.run(["python3", link_plan, "--all"],
                       capture_output=True, timeout=10)
    except Exception:
        pass  # best-effort; don't block monitor output
```

### Step 4: Backfill existing tasks with null planFile

Run `link-plan.py --all` once after deployment to fix existing tasks. This will attempt to link:
- `quick-mist-4786` (openclaw-fork, session log at `/tmp/opencode-quick-mist-4786.log`)
- `quick-mist-5763` (mission-control, session log at `/tmp/opencode-quick-mist-5763.log`)

For backfill, since these tasks don't have `projectDir` stored yet, the script should fall back to deriving it from `taskFile`:
```python
project_dir = task.get("projectDir")
if not project_dir and task.get("taskFile"):
    # taskFile is like /Users/.../Projects/openclaw-fork/plans/tasks/2026-03-08_foo.md
    # projectDir is 2 levels up from plans/tasks/
    tf = task["taskFile"]
    if "/plans/tasks/" in tf:
        project_dir = tf.split("/plans/tasks/")[0]
```

### Step 5: Also set `plannedAt` in the monitor

Currently the monitor sets `finishedAt` but not `plannedAt` when transitioning `planning → planned`. Add this to the orphaned task block:

```python
if new_phase == "planned":
    task["plannedAt"] = task.get("plannedAt") or now_iso()
```

## Files to Modify

| File | Change |
|------|--------|
| `~/.openclaw/workspace/km-system/scripts/start-task.sh` | Add `projectDir` to task record (both plan and implement phases) |
| `~/.openclaw/workspace/km-system/scripts/opencode-monitor.py` | Call `link-plan.py --all` after state write; set `plannedAt` on planning→planned transition |
| `~/.openclaw/workspace/km-system/scripts/link-plan.py` | **NEW** — plan file linker with log-scraping + timestamp fallback |
| `~/.openclaw/workspace/km-system/scripts/task-state.py` | No changes needed (existing `set-plan` command remains for manual use) |

## Testing

### Manual verification
1. Run `link-plan.py --all` on current state — should attempt to link `quick-mist-4786` and `quick-mist-5763`
2. Verify by checking `opencode-tasks.json` that `planFile` is populated for both
3. Start a new planning session via `start-task.sh --phase plan`, verify `projectDir` is stored
4. After session completes, run monitor, verify `planFile` is auto-linked

### Parallel session test
1. Start two planning sessions simultaneously (one in openclaw-fork, one in mission-control)
2. Wait for both to complete
3. Run monitor or `link-plan.py --all`
4. Verify each task gets the correct plan file (not cross-linked)

### Edge cases to verify
- Log file missing (`/tmp/` cleared): should fall back to timestamp scan
- Log file has no Write lines (session crashed early): should fall back to timestamp scan
- Multiple plan files in timestamp window (parallel sessions in same project): should skip (not guess)
- Task has no `projectDir` and no `taskFile`: should skip gracefully

## Dependencies

### Prerequisites
- Python 3 available (already in use by all km-system scripts)
- `/tmp/opencode-*.log` files persist (confirmed: they do, cleaned only on reboot)
- `taskFile` field reliably contains the canonical path under `<projectDir>/plans/tasks/`

### No external dependencies
- No new packages needed
- No changes to opencode binary or compound-plan skill
- No changes to mission-control dashboard (it already reads `planFile` from state)

---
*Created: 2026-03-08*
*Status: DRAFT*
