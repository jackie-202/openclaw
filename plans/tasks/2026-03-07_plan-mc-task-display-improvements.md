Use the compound-plan skill to create a detailed implementation plan for:

**Mission Control — 3 task display improvements**

Project: ~/Projects/openclaw-fork
Plans output dir: ~/Projects/openclaw-fork/plans/
External dirs with access: ~/.openclaw/workspace/**, ~/.openclaw/cron/**, ~/Projects/mission-control/**

## Changes needed in ~/Projects/mission-control/

### 1. Smart task name in task list

Currently each task card shows the raw `task` field (first line of task text), which often starts with "Use the compound-plan skill...", "Implement the plan at...", etc. — all looking the same.

Goal: derive a short human-readable label from the task record. Priority:
1. Use `taskFile` filename if available — strip date prefix (`YYYY-MM-DD_`) and slug-decode (replace `-` with spaces, trim to ~50 chars)
2. Fall back to the raw `task` field but strip common prefixes: "Use the compound-plan skill to create a detailed implementation plan for:", "Implement the plan at...", "Implement ", "Plan: "
3. Capitalize first letter

Show this derived label as the primary title on task cards in the list.

### 2. Last-changed timestamp on each task card

Show a "last changed" timestamp on each task card in the list. Derive it as:
- The most recent non-null timestamp among: `finishedAt`, `implementingStartedAt`, `plannedAt`, `planningStartedAt`, `definedAt`, `startedAt`
- Display as relative time (e.g. "2 min ago", "1 hour ago", "yesterday") with full datetime on hover (title attribute)

### 3. Task definition file shown on detail panel

The detail panel currently shows the plan file (markdown rendered). Add a second section **above** the plan: render the task definition file (`taskFile` field) the same way — read via a new API endpoint, render as markdown using the existing marked+DOMPurify pipeline.

- Add a new API endpoint GET `/api/taskfile?path=<absolute-path>` (same pattern as `/api/plan`)
- Show it in the detail panel under a heading "📋 Zadání" (above the existing "📄 Plán" section)
- If `taskFile` is null/missing, skip the section silently
- Same styling as plan section (existing `.plan-content` classes)
