# Implement code review phase in task lifecycle

Implement the plan from `/Users/michal/Projects/openclaw-fork/plans/010_add-review-phase-task-lifecycle.md`.

This task spans TWO repos that must be changed together:

## 1. km-system scripts (`/Users/michal/.openclaw/workspace/km-system/scripts/`)
- `start-task.sh` — add phases: review, skip-review, approve, reject (with state transitions and review prompt)
- `opencode-monitor.py` — recognize review phase as active, resolve review→reviewed on completion
- `link-plan.py` — link reviewFile from `plans/review/<taskId>.md`

## 2. Mission Control (`/Users/michal/Projects/mission-control/`)
- `server.js` — add POST endpoints: /api/tasks/review, /api/tasks/skip-review, /api/tasks/approve, /api/tasks/reject
- `public/app.js` — add review/reviewed phases to UI, action buttons (Review, Skip Review, Approve, Reject), phase badges
- `public/style.css` — add phase colors for review (amber) and reviewed (teal)

Follow the plan exactly. All file paths above are absolute — use them directly.

Project: /Users/michal/Projects/openclaw-fork
Plans output dir: /Users/michal/Projects/openclaw-fork/plans/
