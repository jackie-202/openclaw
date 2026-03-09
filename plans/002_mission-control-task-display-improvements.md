# Plan 002: Mission Control — 3 task display improvements

Smart task names, last-changed timestamps, and task definition file rendering in Mission Control dashboard.

_Status: DRAFT_
_Vytvořeno: 2026-03-07_

---

## Progress

- [x] Fáze 0: Config + Init
- [x] Fáze 1: Research
- [x] Fáze 2: Knowledge
- [x] Fáze 3: Synthesis

## Problem

The Mission Control dashboard (~/Projects/mission-control/) has three UX issues:

1. **Task names are unhelpful** — raw `task` field often starts with "Use the compound-plan skill..." or "Implement the plan at..." making all cards look the same
2. **No recency signal** — no "last changed" timestamp on task cards, so user can't see which tasks were recently active
3. **No task definition file** — detail panel shows the plan markdown but not the original task definition file (`taskFile` field)

### Goals:

1. Derive smart human-readable labels from task records (taskFile filename > cleaned task text)
2. Show relative "last changed" timestamp on each card
3. Add new API endpoint + UI section to render taskFile markdown in detail panel

## Analysis

### Kontext z codebase

**Project structure** (~/Projects/mission-control/):

```
server.js        — Node.js HTTP server (vanilla, no framework), serves static + 2 API endpoints
public/
  index.html     — Single-page dashboard with detail view overlay
  app.js         — All frontend logic: fetch, render, detail view, timers (~551 LOC)
  style.css      — Dark terminal theme with phase-based coloring (~717 LOC)
package.json     — Zero runtime deps, just `node server.js`
plans/           — Plan markdown files
plans/tasks/     — Task definition markdown files
```

**Data source**: `~/.openclaw/workspace/km-system/state/opencode-tasks.json`

- Top-level: `{ tasks: [...], lastUpdated: "..." }`
- 22 tasks in current data

**Task record fields** (relevant):

- `id`, `task` (raw text, first line of task definition)
- `taskFile` — absolute path to task definition .md file (e.g. `/Users/michal/Projects/mission-control/plans/tasks/2026-03-07_impl-task-lifecycle-phases.md`)
- `planFile` — path to plan .md file (may use `~/` prefix)
- `status`, `phase` (done/failed/planning/planned/implementing/defined)
- Timestamps: `startedAt`, `definedAt`, `planningStartedAt`, `plannedAt`, `implementingStartedAt`, `finishedAt`
- Also: `sessionId`, `planSessionId`, `implSessionId`, `branch`, `result`, `errorMessage`, `deployResult`, `lastMonitorCheck`

**Existing API endpoints** (server.js):

1. `GET /api/tasks` — returns full tasks JSON (no params)
2. `GET /api/plan?file=<path>` — reads markdown file, path must be under `~/Projects/` (security check against `PROJECTS_DIR`)
   - Supports `~/` prefix expansion
   - Returns raw markdown as `text/markdown`

**Key frontend patterns** (app.js):

- `buildTaskCard(task)` — creates active task card HTML (line 164-192)
  - Currently shows `task.task` in `.task-desc` element
  - Shows short ID, phase badge, branch, plan file
- `renderHistory(tasks)` — creates history rows (line 209-248)
  - Shows `task.task` in `.hist-desc`
- `renderDetail(taskId)` — renders detail panel (line 289-332)
  - Shows lifecycle headers, all fields, calls `renderPlan()`
- `renderPlan(planFile, planEl)` — fetches + renders markdown via marked+DOMPurify (line 334-361)
  - Reusable pattern for rendering markdown from a file path
- `formatRelativeTime(isoString)` — already exists, returns "2m ago", "1h ago", "yesterday", etc. (line 486-500)
- `esc(str)` — HTML escape helper
- `getTaskPhase(task)` — derives phase from task record
- DOM: detail panel has 3 `section.detail-panel` elements: TASK LIFECYCLE, FULL DETAILS, PLAN/MARKDOWN

**taskFile path patterns observed**:

- Absolute paths: `/Users/michal/Projects/mission-control/plans/tasks/2026-03-07_impl-task-lifecycle-phases.md`
- Also: `/Users/michal/Projects/openclaw-fork/plans/tasks/2026-03-07_...`
- Unlike `planFile`, taskFile does NOT use `~/` prefix (always absolute)

**taskFile filename patterns**:

- `2026-03-07_impl-task-lifecycle-phases.md` → "impl task lifecycle phases"
- `2026-03-07_use-the-compound-plan-skill-to-create-a-detailed-implementat.md` → truncated slug
- `2026-03-07_test-single-task-registration.md` → "test single task registration"
- `2026-03-07_task-phases-schema.md` → "task phases schema"

**Security model for file serving**:

- `/api/plan` restricts to `PROJECTS_DIR` = `~/Projects/`
- The new `/api/taskfile` needs wider allowlist because taskFile paths can be anywhere under `~/Projects/` (already covered) BUT could also be under `~/.openclaw/` in future
- Need to allow: `~/Projects/**` and `~/.openclaw/**`

### Relevantní dokumentace

No PlantUML diagrams or formal docs exist for this project. The README.md is minimal. The codebase is self-documenting — small enough to read entirely.

### Knowledge base

**From development-workflow.md:**

- Jackie orchestrates, opencode implements — this plan follows that pattern
- "Always Plan first, then Build" — this IS the plan phase

**Project-specific patterns observed:**

- Vanilla JS, no build step, no framework — changes are direct edits to HTML/CSS/JS
- Security: file-serving endpoints check against an allowlist of directories
- `taskFile` uses absolute paths (not `~/`), `planFile` may use `~/` prefix — new endpoint must handle both
- Existing `renderPlan()` function is the reusable pattern for markdown rendering
- `formatRelativeTime()` already handles relative timestamps — reuse for "last changed"
- Task cards use `.task-desc` for the raw task text — will need to compute derived label

## Solutions

All three improvements are independent features that touch the same files but don't conflict. Implement them in order (1→2→3) since feature 3 is the most complex (new API endpoint + UI).

**Approach**: Pure frontend logic for features 1 and 2 (no server changes needed). Feature 3 requires a new server endpoint + frontend rendering.

### Feature 1: Smart task name — pure JS helper function

Add a `deriveTaskLabel(task)` function in `app.js` that:

1. If `task.taskFile` exists → extract filename, strip date prefix `YYYY-MM-DD_`, strip `.md`, replace `-` with spaces, capitalize first letter, truncate to ~60 chars
2. Else → clean the `task.task` field by stripping common prefixes (list below), capitalize first letter
3. Common prefixes to strip:
   - `"Use the compound-plan skill to create a detailed implementation plan for:"`
   - `"Use the compound-plan skill to create a detailed implementation plan for "`
   - `"Implement the plan at "`
   - `"Implement the plan in "`
   - `"Implement "`
   - `"Plan: "`

Use this label in `buildTaskCard()` for `.task-desc` text and in `renderHistory()` for `.hist-desc` text. Keep the raw `task.task` in the `title` attribute for hover.

### Feature 2: Last-changed timestamp — derive from existing timestamps

Add a `getLastChangedTime(task)` function that returns the most recent non-null ISO string from:
`finishedAt`, `implementingStartedAt`, `plannedAt`, `planningStartedAt`, `definedAt`, `startedAt`

Display in task cards as a new `.task-changed` element below branch/plan info, using the existing `formatRelativeTime()`. Set `title` attribute to the full ISO datetime.

For history rows, add to the existing row layout (though they already show `finishedAt` as relative time — this is mainly for active cards).

### Feature 3: Task definition file in detail panel — new endpoint + UI section

**Server**: Add `GET /api/taskfile?path=<absolute-path>` endpoint in `server.js`:

- Same pattern as `/api/plan` — read file, return markdown
- Security: allow paths under `PROJECTS_DIR` (`~/Projects/`) OR under `HOME/.openclaw/`
- Handle both absolute paths and `~/` prefix (same as `/api/plan`)
- Return `text/markdown; charset=utf-8`

**Frontend**: In `renderDetail()`, add a call to a new `renderTaskFile(taskFile, targetEl)` function (modeled on `renderPlan()`):

- Fetches from `/api/taskfile?path=<encoded-path>`
- Renders via marked + DOMPurify (same pipeline as plan)
- Shows under heading "TASK DEFINITION" (section title in `.detail-panel-title`)
- If `taskFile` is null/missing, skip the section entirely (hide or don't render)

**HTML**: Add a new `section.detail-panel` in `index.html` between "FULL DETAILS" and "PLAN / MARKDOWN" panels:

```html
<section class="detail-panel" id="detail-taskfile-panel" style="display:none">
  <div class="detail-panel-title">📋 TASK DEFINITION</div>
  <div id="detail-taskfile" class="detail-plan-content"></div>
</section>
```

## Implementation

### Pre-implementation checklist

- [ ] Verify `~/Projects/mission-control/` has a clean git state
- [ ] Verify the dev server starts with `npm start` in mission-control

### Step 1: Add `deriveTaskLabel(task)` function (app.js)

Insert after the `getTaskStartTime()` function (around line 72), before the FETCH section:

```javascript
// ── SMART LABEL ────────────────────────────────────────────────────────

const TASK_PREFIXES_TO_STRIP = [
  "Use the compound-plan skill to create a detailed implementation plan for:",
  "Use the compound-plan skill to create a detailed implementation plan for ",
  "Implement the plan at ",
  "Implement the plan in ",
  "Implement ",
  "Plan: ",
];

/**
 * Derive a short human-readable label from a task record.
 * Priority: taskFile filename > cleaned task text.
 */
function deriveTaskLabel(task) {
  // 1. Try taskFile filename
  if (task.taskFile) {
    const filename = task.taskFile.split("/").pop().replace(/\.md$/i, "");
    // Strip YYYY-MM-DD_ date prefix
    const withoutDate = filename.replace(/^\d{4}-\d{2}-\d{2}_/, "");
    // Slug-decode: replace hyphens with spaces
    let label = withoutDate.replace(/-/g, " ").trim();
    // Capitalize first letter
    if (label) label = label.charAt(0).toUpperCase() + label.slice(1);
    // Truncate
    if (label.length > 60) label = label.substring(0, 57) + "...";
    if (label) return label;
  }

  // 2. Fall back to cleaned task text
  let text = (task.task || "").trim();
  for (const prefix of TASK_PREFIXES_TO_STRIP) {
    if (text.startsWith(prefix)) {
      text = text.slice(prefix.length).trim();
      break;
    }
  }
  // Strip leading newlines, take first line
  text = text.split("\n")[0].trim();
  // Capitalize first letter
  if (text) text = text.charAt(0).toUpperCase() + text.slice(1);
  // Truncate
  if (text.length > 60) text = text.substring(0, 57) + "...";
  return text || task.task || "Untitled task";
}
```

### Step 2: Use `deriveTaskLabel()` in card rendering (app.js)

**In `buildTaskCard()` (line ~182):**
Change:

```javascript
<div class="task-desc" title="${esc(task.task)}">
  ${esc(task.task)}
</div>
```

To:

```javascript
<div class="task-desc" title="${esc(task.task)}">
  ${esc(deriveTaskLabel(task))}
</div>
```

**In the update path in `renderActive()` (line ~154):**
Change:

```javascript
if (desc) desc.textContent = task.task;
```

To:

```javascript
if (desc) desc.textContent = deriveTaskLabel(task);
```

**In `renderHistory()` (line ~241):**
Change:

```javascript
row.innerHTML = `
  <div class="hist-status phase-${phase}">${icon}</div>
  <div class="hist-desc"${title}>${esc(task.task)} ${phaseBadge}${plan}</div>
```

To:

```javascript
row.innerHTML = `
  <div class="hist-status phase-${phase}">${icon}</div>
  <div class="hist-desc"${title}>${esc(deriveTaskLabel(task))} ${phaseBadge}${plan}</div>
```

### Step 3: Add `getLastChangedTime(task)` function (app.js)

Insert right after `deriveTaskLabel()`:

```javascript
/**
 * Get the most recent timestamp from a task record.
 * Returns an ISO string or null.
 */
function getLastChangedTime(task) {
  const candidates = [
    task.finishedAt,
    task.implementingStartedAt,
    task.plannedAt,
    task.planningStartedAt,
    task.definedAt,
    task.startedAt,
  ].filter(Boolean);
  if (candidates.length === 0) return null;
  // Find the most recent
  return candidates.reduce((latest, ts) =>
    new Date(ts).getTime() > new Date(latest).getTime() ? ts : latest,
  );
}
```

### Step 4: Show last-changed on active task cards (app.js + style.css)

**In `buildTaskCard()`, add after the `${plan}` line inside `.task-body`:**

```javascript
const lastChanged = getLastChangedTime(task);
const lastChangedHtml = lastChanged
  ? `<div class="task-changed" title="${esc(lastChanged)}">${formatRelativeTime(lastChanged)}</div>`
  : "";
```

Then include `${lastChangedHtml}` in the card innerHTML after `${plan}`.

**In `renderHistory()`, add to each row** — the history rows already show relative time in `.hist-time`, but derive it from `finishedAt`. Change to use `getLastChangedTime()` for more accuracy:

Change:

```javascript
const relTime = task.finishedAt ? formatRelativeTime(task.finishedAt) : "—";
```

To:

```javascript
const lastChanged = getLastChangedTime(task);
const relTime = lastChanged ? formatRelativeTime(lastChanged) : "—";
```

**Add CSS (style.css), after `.task-plan` styles (~line 282):**

```css
.task-changed {
  font-size: 10px;
  color: var(--text-muted);
  margin-top: 2px;
}
```

### Step 5: Add `/api/taskfile` endpoint (server.js)

**Add an `ALLOWED_ROOTS` array** near top of file (after `PROJECTS_DIR` definition, line ~9):

```javascript
const OPENCLAW_DIR = path.join(process.env.HOME || "", ".openclaw");
const ALLOWED_ROOTS = [PROJECTS_DIR, OPENCLAW_DIR];
```

**Add a helper function** `isAllowedPath(resolvedPath)`:

```javascript
function isAllowedPath(resolvedPath) {
  return ALLOWED_ROOTS.some((root) => {
    const absRoot = path.resolve(root);
    return resolvedPath === absRoot || resolvedPath.startsWith(`${absRoot}${path.sep}`);
  });
}
```

**Add the new endpoint** in `server.js`, after the `/api/plan` handler (after line 80):

```javascript
if (url.pathname === "/api/taskfile") {
  const pathParam = url.searchParams.get("path");
  if (!pathParam) {
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end('Missing "path" query parameter');
  }

  const expandedPath = pathParam.startsWith("~/")
    ? path.join(process.env.HOME || "", pathParam.slice(2))
    : pathParam;
  const resolvedPath = path.resolve(expandedPath);

  if (!isAllowedPath(resolvedPath)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end("Forbidden");
  }

  return fs.readFile(resolvedPath, "utf8", (err, markdown) => {
    if (err) {
      if (err.code === "ENOENT") {
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        return res.end("Task file not found");
      }
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("Internal Server Error");
    }
    res.writeHead(200, {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "no-cache",
      "Access-Control-Allow-Origin": "*",
    });
    return res.end(markdown);
  });
}
```

**Refactor the existing `/api/plan` handler** to also use `isAllowedPath()` instead of the inline check (optional but cleaner).

### Step 6: Add taskfile section in detail panel HTML (index.html)

**Insert a new section** between `detail-fields-panel` and `detail-plan-panel` (after line 67):

```html
<section class="detail-panel" id="detail-taskfile-panel" style="display:none">
  <div class="detail-panel-title">📋 TASK DEFINITION</div>
  <div id="detail-taskfile" class="detail-plan-content"></div>
</section>
```

### Step 7: Add `renderTaskFile()` and wire into `renderDetail()` (app.js)

**Add constant** at top of file:

```javascript
const TASKFILE_API_URL = "/api/taskfile";
```

**Add `renderTaskFile()` function** after `renderPlan()`:

```javascript
async function renderTaskFile(taskFile, taskFileEl, panelEl) {
  if (!taskFile) {
    panelEl.style.display = "none";
    return;
  }

  panelEl.style.display = "";
  taskFileEl.innerHTML = '<div class="detail-loading">Loading task definition...</div>';

  try {
    const res = await fetch(`${TASKFILE_API_URL}?path=${encodeURIComponent(taskFile)}`);
    if (!res.ok) {
      const message = await res.text();
      throw new Error(message || `HTTP ${res.status}`);
    }

    const markdown = await res.text();
    if (!markdown.trim()) {
      taskFileEl.innerHTML = '<div class="detail-empty">Task definition file is empty.</div>';
      return;
    }

    const parsed = window.marked ? window.marked.parse(markdown) : esc(markdown);
    const sanitized = window.DOMPurify ? window.DOMPurify.sanitize(parsed) : parsed;
    taskFileEl.innerHTML = `<div class="detail-markdown">${sanitized}</div>`;
  } catch (err) {
    taskFileEl.innerHTML = `<div class="detail-error">Failed to load task definition: ${esc(err.message)}</div>`;
  }
}
```

**In `renderDetail()`, add after the `renderPlan()` call (line ~331):**

```javascript
const taskFileEl = document.getElementById("detail-taskfile");
const taskFilePanelEl = document.getElementById("detail-taskfile-panel");
if (taskFileEl && taskFilePanelEl) {
  renderTaskFile(task.taskFile, taskFileEl, taskFilePanelEl);
}
```

## Files to Modify

| File                | Changes                                                                                                                                                                                                     |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `public/app.js`     | Add `deriveTaskLabel()`, `getLastChangedTime()`, `renderTaskFile()` functions; update `buildTaskCard()`, `renderActive()`, `renderHistory()`, `renderDetail()` to use them; add `TASKFILE_API_URL` constant |
| `public/style.css`  | Add `.task-changed` style (1 rule, ~4 lines)                                                                                                                                                                |
| `public/index.html` | Add `#detail-taskfile-panel` section in detail view (4 lines)                                                                                                                                               |
| `server.js`         | Add `OPENCLAW_DIR`, `ALLOWED_ROOTS`, `isAllowedPath()` helper; add `/api/taskfile` endpoint (~30 lines); optionally refactor `/api/plan` to use shared `isAllowedPath()`                                    |

## Testing

### Manual testing checklist

1. **Smart task labels**:
   - [ ] Start dev server: `cd ~/Projects/mission-control && npm start`
   - [ ] Open http://localhost:3000
   - [ ] Verify active task cards show derived labels, not raw task text
   - [ ] Verify history rows show derived labels
   - [ ] Hover over a card — tooltip shows the full raw task text
   - [ ] Check a task with `taskFile` — label should be filename-derived (e.g. "Impl task lifecycle phases")
   - [ ] Check a task without `taskFile` but with "Use the compound-plan..." prefix — label should be stripped

2. **Last-changed timestamps**:
   - [ ] Active task cards show a relative timestamp (e.g. "2h ago")
   - [ ] Hover shows full ISO datetime
   - [ ] History rows use `getLastChangedTime()` — should match most recent lifecycle event

3. **Task definition file in detail panel**:
   - [ ] Click a task with `taskFile` → detail panel shows "TASK DEFINITION" section above "PLAN / MARKDOWN"
   - [ ] Markdown renders correctly with same styling as plan section
   - [ ] Click a task WITHOUT `taskFile` → "TASK DEFINITION" section is hidden (not shown)
   - [ ] Test `/api/taskfile` directly: `curl 'http://localhost:3000/api/taskfile?path=/Users/michal/Projects/mission-control/plans/tasks/2026-03-07_impl-task-lifecycle-phases.md'` — should return markdown
   - [ ] Security: `curl 'http://localhost:3000/api/taskfile?path=/etc/passwd'` — should return 403 Forbidden
   - [ ] Security: `curl 'http://localhost:3000/api/taskfile?path=../../etc/passwd'` — should return 403 Forbidden

4. **Responsive**:
   - [ ] Resize to mobile width (<640px) — cards still readable, new elements don't break layout

## Dependencies

- No new npm packages needed (vanilla JS, no build step)
- Existing CDN dependencies unchanged: `marked`, `DOMPurify`
- The `/api/taskfile` endpoint requires the task data to contain `taskFile` fields — this is already populated by the opencode-monitor cron job
