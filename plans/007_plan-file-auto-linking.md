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

## Solutions [TODO]

## Implementation [TODO]

## Files to Modify [TODO]

## Testing [TODO]

## Dependencies [TODO]
