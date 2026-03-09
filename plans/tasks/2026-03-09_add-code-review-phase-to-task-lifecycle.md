# Add code review phase to task lifecycle

## Problem

After implementation completes, there is no structured code review step before a task
is marked as done. This makes it easy to merge code that hasn't been reviewed.

## Goal

Add an optional `review` phase to the task lifecycle:

```
backlog → planning → planned → implementing → [review] → done
                                           ↘ (skip) ↗
```

Review is **optional** — a task can be completed by:
1. Running review (`--phase review`) → then approving → done
2. Skipping review entirely (`--phase skip-review`) → done directly

## How review works

When `--phase review` is invoked, `start-task.sh` launches opencode with a prompt that:
1. Instructs opencode to load and apply the `code-review` skill (from `~/Projects/openclaw-fork/skills/code-review/SKILL.md` or similar)
2. Passes the plan file path (from task's `planFile`) and the implementation session ID as context
3. Asks opencode to produce a structured review report: what was done, what was missed, any concerns, verdict (approve/reject)
4. Saves the review report to `plans/review/<taskId>.md`

This follows the same pattern as planning and implementation: a script call, a log file, a state transition.

## State machine changes

New phases to support:
- `review` — opencode review in progress
- `reviewed` — review complete, awaiting approval or rejection
- `done` — final state (reached by: approve after review, or skip-review after implementing)
- `implementing` — reached by reject (sends back from reviewed to implementing)

Transitions:
- `implementing → review` (via `--phase review`)
- `implementing → done` (via `--phase skip-review`)
- `review → reviewed` (opencode finishes, monitor detects)
- `reviewed → done` (approve, via Mission Control button or CLI)
- `reviewed → implementing` (reject, via Mission Control button or CLI)

## `start-task.sh` changes

Add two new phase flags:
- `--phase review --task-id <id>` — launch opencode review session, transition to `review`
- `--phase skip-review --task-id <id>` — no opencode launch, transition directly to `done`

Review prompt prefix (analogous to existing plan/implement prefixes):
- Load the `code-review` skill
- Read `planFile` from task record
- Produce structured review report, save as `plans/review/<taskId>.md`
- Stop — do NOT implement any changes

## Mission Control UI changes

1. **`review` phase badge** — yellow/amber "REVIEW" badge in active task list
2. **`reviewed` phase badge** — teal/blue "REVIEWED" badge
3. **Action buttons on `implementing` tasks:**
   - "Review" button → `POST /api/tasks/review`
   - "Skip Review" button → `POST /api/tasks/skip-review`
4. **Action buttons on `reviewed` tasks:**
   - "Approve ✓" button → `POST /api/tasks/approve` (transitions to `done`)
   - "Reject ✗" button → `POST /api/tasks/reject` (transitions back to `implementing`)
5. **Review report link** — if `reviewFile` exists on task, show link to open it

## New server.js endpoints

- `POST /api/tasks/review` — run `start-task.sh --phase review --task-id <id>`
- `POST /api/tasks/skip-review` — run `start-task.sh --phase skip-review --task-id <id>`
- `POST /api/tasks/approve` — run `start-task.sh --phase approve --task-id <id>`
- `POST /api/tasks/reject` — run `start-task.sh --phase reject --task-id <id>`

## Files to change

- `km-system/scripts/start-task.sh` — add `--phase review`, `skip-review`, `approve`, `reject`
- `km-system/state/opencode-tasks.json` — add `reviewFile`, `reviewSessionId` fields to schema
- `km-system/scripts/opencode-monitor.py` — detect `review` phase completion (orphaned process → `reviewed`)
- `km-system/scripts/link-plan.py` — also link `plans/review/<taskId>.md` as `reviewFile`
- `~/Projects/mission-control/server.js` — four new endpoints
- `~/Projects/mission-control/public/app.js` — render review badges + action buttons
- `~/Projects/mission-control/public/style.css` — `phase-review`, `phase-reviewed` styles

## Open Points for the Planner to Evaluate

Before designing the implementation, evaluate and recommend the best approach for:

### 1. Script architecture: one big script vs. many small ones

`start-task.sh` currently handles all phases (backlog, plan, implement, review, etc.)
in a single ~380-line bash script. As we add more phases, this becomes harder to maintain
and harder for an agent to reason about.

Options to evaluate:
- **A) Keep one script** — add review/approve/reject phases as more branches. Simple, but grows further.
- **B) One script per phase** — `task-plan.sh`, `task-implement.sh`, `task-review.sh`, etc. 
  Clean separation, but risks code duplication (state file R/W, opencode launch, PID tracking).
- **C) Python core + thin shell wrappers** — move all logic to a testable Python module
  (`task_runner.py` or `km_tasks/`) with shared code for state management, opencode launch,
  PID tracking. Each phase has a tiny wrapper (`task-plan.sh` → calls `python3 task_runner.py plan`).
  Pros: testable, no duplication, agent can call a single well-documented Python CLI.
  
**Recommendation required:** Which approach fits the project best given current complexity?
Consider: maintainability, agent usability (how easy is it to call from opencode?), testability.

### 2. Interface clarity for agents

The current `--phase` flag makes the script's interface wide. An agent calling `start-task.sh`
must know the right combination of flags for each phase transition. Is there a cleaner way
to expose this as a Python CLI with subcommands? e.g.:

```
python3 task_runner.py plan --task-id <id> <project_dir> <task_file>
python3 task_runner.py implement --task-id <id>
python3 task_runner.py review --task-id <id>
```

Evaluate whether this would reduce errors and improve agent reliability.

## Context

- Code-review skill expected path: `~/Projects/openclaw-fork/skills/code-review/` (may need to be created)
- State file: `/Users/michal/.openclaw/workspace/km-system/state/opencode-tasks.json`
- `start-task.sh`: `/Users/michal/.openclaw/workspace/km-system/scripts/start-task.sh`
- `opencode-monitor.py`: `/Users/michal/.openclaw/workspace/km-system/scripts/opencode-monitor.py`
- `link-plan.py`: `/Users/michal/.openclaw/workspace/km-system/scripts/link-plan.py`
- Mission Control server: `/Users/michal/Projects/mission-control/server.js`
- Mission Control frontend: `/Users/michal/Projects/mission-control/public/app.js`
- Reference: existing plan/implement phase in `start-task.sh` (lines ~328–360)
- Both `openclaw-fork` and `mission-control` repos need changes
