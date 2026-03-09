# Add code review phase to task lifecycle

## Problem

After implementation completes, there is no structured code review step before a task
is marked as done. This makes it easy to merge code that hasn't been reviewed.

## Goal

Add a `review` phase to the task lifecycle, sitting between `implementing` and `done`:

```
backlog → planning → planned → implementing → review → done
```

## Requirements

1. **New phase: `review`** — tasks can be transitioned to review after implementation
2. **`start-task.sh --phase review`** — command to move task to review phase
3. **Mission Control** — show tasks in `review` phase in the active section with a distinct
   badge (e.g. yellow "REVIEW" badge)
4. **Review checklist in plan** — When transitioning to review, opencode reads the plan
   and implementation, then writes a short review report: what was done, what was missed,
   any concerns
5. **Approve/reject buttons** — Mission Control UI: approve (→ done) or reject (→ implementing)
   a review task

## Files to change

- `km-system/scripts/start-task.sh` — add `--phase review` support
- `km-system/state/opencode-tasks.json` schema — add `review` to valid phases
- `public/app.js` — render `review` phase in active section
- `public/style.css` — `phase-review` badge style
- `server.js` — endpoint to approve/reject review
