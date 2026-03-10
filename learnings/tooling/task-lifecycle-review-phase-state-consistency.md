---
title: "Task lifecycle: review phase state consistency"
date: 2026-03-10
category: tooling
component: tooling
tags: [task-lifecycle, review-phase, monitor, mission-control]
---

# Review phase rollout across scripts and Mission Control

When adding a new intermediate phase (`review`) that ends in a non-terminal waiting state (`reviewed`), monitor phase/status reconciliation must explicitly preserve that waiting phase.

## What mattered
- `opencode-monitor.py` needed `review` in active-phase detection and session log lookup (`reviewSessionId`).
- Orphan completion mapping needed `review -> reviewed` so review runs do not auto-complete to `done`.
- `is_phase_status_mismatch()` must allow `status=done` with `phase=reviewed`; otherwise the next monitor pass collapses `reviewed` to `done` unintentionally.

## Implementation pattern
- Add all new lifecycle transitions in one place in `start-task.sh` with hard precondition checks by current phase.
- Keep launch phases explicit (`plan`, `implement`, `review`) and handle decision-only transitions (`skip-review`, `approve`, `reject`) without launching opencode.
- Persist review metadata (`reviewSessionId`, `reviewStartedAt`, `reviewFile`) in task records so the UI/API can stay stateless.

## UI/API lesson
- A single generic task-action button pattern in the frontend (`data-task-action`) scales better than phase-specific button handlers as lifecycle phases grow.
- API endpoints should enforce phase preconditions server-side even if frontend only renders valid actions.