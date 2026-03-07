Implement the plan at ~/Projects/openclaw-fork/plans/002_mission-control-task-display-improvements.md

Summary of what to implement in ~/Projects/mission-control/:

1. app.js — deriveTaskLabel(): smart label from taskFile filename (strip date prefix, decode slug) or cleaned task text (strip "Use the compound-plan skill...", "Implement the plan at...", "Plan: ", "Implement " prefixes). Wire into buildTaskCard() and renderHistory().

2. app.js + style.css — getLastChangedTime(): pick most recent non-null timestamp from [finishedAt, implementingStartedAt, plannedAt, planningStartedAt, definedAt, startedAt]. Show as relative time (e.g. "2 min ago") on each task card with full datetime on hover. Add .task-changed CSS.

3. server.js — new GET /api/taskfile?path=<absolute-path> endpoint. Same pattern as /api/plan. Allow paths under ~/Projects/** and ~/.openclaw/**. Use shared isAllowedPath() helper (or create it if not present).

4. index.html — add #detail-taskfile-panel section above the existing plan section.

5. app.js — renderTaskFile() function + wire into renderDetail(). Reads via /api/taskfile, renders markdown via existing marked+DOMPurify pipeline. Shows under "📋 Zadání" heading. Hidden when taskFile is null.
