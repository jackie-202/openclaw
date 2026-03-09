# Plan 003: Mission Control — task history colors + detail panel UX improvements

Two UX improvements to the Mission Control dashboard:

1. Phase-aware color coding for completed/failed tasks in the history list
2. Detail panel deduplication with collapsible full attributes section

_Status: DRAFT_
_Vytvořeno: 2026-03-07_

---

## Progress

- [x] Fáze 0: Config + Init
- [x] Fáze 1: Research
- [x] Fáze 2: Knowledge
- [x] Fáze 3: Synthesis

## Problem

### 1. Task history — phase-aware color coding

The history list (completed/failed tasks) currently shows tasks in a uniform style. Need to add the same phase-based color coding that active cards use:

- Task that only completed **planning** (phase=planned or phase=done but no implSessionId) → blue/cyan tone
- Task that completed **implementation** (phase=done with implSessionId set) → green tone
- Task that **failed** at any phase → red tone (verify consistency)

Use existing CSS phase color tokens (`--phase-planned`, `--phase-done`, `--phase-failed`, etc.) and `.phase-badge` classes.

### 2. Detail panel — deduplicate and add collapsible full attributes

Current state: detail panel shows summary section with key attributes, then a full attributes section listing all the same fields again (duplication).

Goal:

- Compact **header section** with essentials: task label, phase badge, status, started at, last changed, planFile link
- Replace full attributes with **collapsible `<details>` element** ("▶ Všechny atributy") containing ALL fields
- Collapsed by default
- No duplication between header and collapsible
- Native HTML `<details>/<summary>` — no JS needed

## Analysis [DONE]

### Kontext z codebase [DONE]

**Project structure** (`~/Projects/mission-control/`):

- `server.js` — Node HTTP server, read-only API (`/api/tasks`, `/api/plan`), static file serving
- `public/index.html` — SPA shell with three detail panels: `detail-header-panel`, `detail-fields-panel`, `detail-plan-panel`
- `public/app.js` — 622 lines, all rendering + polling logic, no build step (vanilla JS)
- `public/style.css` — 723 lines, dark theme with per-phase CSS custom properties and class-based coloring

**Phase color tokens already defined** (style.css:24-36):

```
--phase-defined:      var(--neutral)   (grey)
--phase-planning:     var(--cyan)      (cyan)
--phase-planned:      var(--blue)      (blue)
--phase-implementing: var(--amber)     (amber)
--phase-done:         var(--green)     (green)
--phase-failed:       var(--red)       (red)
```

**Phase badge classes** already exist (style.css:291-309):

- `.phase-badge.phase-defined`, `.phase-badge.phase-planning`, etc.
- Used on active task cards via `buildTaskCard()` in app.js

**History row rendering** (app.js:280-319 `renderHistory()`):

- Already adds `phase-${phase}` class to `.history-row` and `.hist-status`
- Phase badge is already rendered inline: `<span class="phase-badge phase-${phase}">${phase}</span>`
- Phase icon already used: `getPhaseIcon(phase)` returns `✓`, `✗`, etc.

**History row CSS** (style.css:345-359):

- `.hist-status.phase-*` classes exist for text color per phase
- `.history-row.phase-failed` has red-dim background
- `.history-row.phase-done` is transparent — **no color differentiation for "done-plan-only" vs "done-impl"**

**Key finding — the color gap**: The current code applies `phase-done` (green) to ALL done tasks. The user wants done-plan-only tasks (no `implSessionId`) to get blue/cyan, not green. This requires a **sub-phase distinction** beyond what `getTaskPhase()` returns.

**Detail panel rendering** (app.js:360-403 `renderDetail()`):

- Header panel (`#detail-header`): renders 7 rows (id, phase, task, startedAt, finishedAt, branch, duration) via `renderHeaderRow()`/`renderHeaderRowHtml()`
- Fields panel (`#detail-fields`): iterates ALL `Object.entries(task)` and renders every key-value — this **duplicates** everything in the header
- Plan panel (`#detail-plan`): loads and renders markdown — this is separate and fine

**HTML structure** (index.html:53-73):

- `detail-header-panel` with title "TASK LIFECYCLE"
- `detail-fields-panel` with title "FULL DETAILS"
- `detail-plan-panel` with title "PLAN / MARKDOWN"

**Task data patterns** (from live `opencode-tasks.json`):

- Phase distribution: done=13, failed=8, implementing=1, planning=1
- Done tasks with `implSessionId` set → completed full implementation
- Done tasks with only `planSessionId` (no `implSessionId`) → completed only planning
- Failed tasks may have `planSessionId` only or both session IDs
- All newer tasks have explicit `phase` field; legacy fallback via `getTaskPhase()` still needed

### Relevantní dokumentace [DONE]

- Plan 002 (`plans/002-task-lifecycle-phases.md`) defined the phase lifecycle model and dashboard phase-awareness. This plan extends that work with refined visual treatment.
- No PlantUML diagrams or additional architecture docs exist in the project.

### Knowledge base [DONE]

- No project-specific learnings directory found.
- Applied rules from Plan 002 context: state migration must be idempotent, dashboard must compute fallbacks for old records.
- CSS variables and `.phase-badge` classes are the canonical way to apply phase colors.

## Solutions

### Change 1: History row — phase-aware color coding with plan-only distinction

**Approach**: Introduce a "visual phase" concept for history rows that distinguishes "done-plan-only" from "done-impl". This is a **display-only** classification, not a data model change.

Add a helper function `getHistoryColorPhase(task)` that returns:

- `'planned'` (blue) — if `phase=done` and no `implSessionId` (planning-only completion)
- `'done'` (green) — if `phase=done` and `implSessionId` is set (full implementation)
- `'failed'` (red) — if `phase=failed`
- Fall through to `getTaskPhase(task)` for any edge cases

Apply this visual phase to:

1. History row class: `history-row phase-${colorPhase}` (already partially done)
2. History row left-border or background tint (new CSS)
3. Phase badge already rendered — its text stays `phase` but its class uses `colorPhase`

**CSS additions needed**:

- `.history-row.phase-planned` — blue-dim background, blue border accent
- `.history-row.phase-done` — subtle green-dim background (currently transparent)
- `.history-row.phase-failed` — already has red-dim background (verify still applies)

### Change 2: Detail panel — compact header + collapsible attributes

**Approach**:

1. Redesign the header panel to show only essential fields with better formatting:
   - Task label (derived from `deriveTaskLabel()`)
   - Phase badge (large, colored)
   - Status (secondary)
   - Started at / finished at
   - Duration
   - Plan file link (clickable if present)
2. Replace the "FULL DETAILS" fields panel content with a `<details>/<summary>` element:
   - Summary text: "▶ Všechny atributy"
   - Collapsed by default
   - Inside: the full `Object.entries(task)` grid (same as current)
3. HTML change: the `detail-fields-panel` structure stays, but the inner content generated by `renderDetail()` wraps fields in `<details>`

## Implementation

### Pre-implementation checklist

- [ ] Verify that `.phase-badge.phase-planned` class renders with blue color (it does — style.css:306)
- [ ] Verify that `phase-done` tasks without `implSessionId` exist in live data (confirmed: some legacy tasks have no `implSessionId`)
- [ ] Confirm `<details>/<summary>` renders correctly in target browsers (standard HTML5, no polyfill needed)

### Step 1: Add `getHistoryColorPhase()` helper (app.js)

After the existing `getTaskPhase()` function (~line 42), add:

```javascript
/**
 * Derive a visual color phase for history rows.
 * Distinguishes "done with plan only" (blue) from "done with implementation" (green).
 */
function getHistoryColorPhase(task) {
  const phase = getTaskPhase(task);
  if (phase === "failed") return "failed";
  if (phase === "done") {
    // If no implementation session, task only completed planning → show as blue/planned
    if (!task.implSessionId) return "planned";
    return "done";
  }
  return phase;
}
```

### Step 2: Update `renderHistory()` to use color phase (app.js)

In `renderHistory()` (line ~293-318), change the history row construction:

**Before:**

```javascript
const phase = getTaskPhase(task);
row.className = `history-row phase-${phase}`;
// ... icon, badge use `phase`
```

**After:**

```javascript
const phase = getTaskPhase(task);
const colorPhase = getHistoryColorPhase(task);
row.className = `history-row phase-${colorPhase}`;
```

Keep the phase badge text showing the actual `phase` (not `colorPhase`), so the badge still says "done" — but its CSS class uses `colorPhase` for coloring:

```javascript
const phaseBadge = `<span class="phase-badge phase-${colorPhase}">${phase}</span>`;
```

And the status icon column:

```javascript
<div class="hist-status phase-${colorPhase}">${icon}</div>
```

### Step 3: Add history row color styles (style.css)

Add/update these rules near the existing history-row phase section (around line 345-359):

```css
/* History row — plan-only completed (blue tint) */
.history-row.phase-planned {
  background: var(--phase-planned-dim);
  border-color: rgba(77, 142, 255, 0.15);
}

/* History row — fully implemented done (subtle green tint) */
.history-row.phase-done {
  background: var(--phase-done-dim);
  border-color: rgba(0, 255, 136, 0.1);
}

/* History row — failed (already exists, verify) */
.history-row.phase-failed {
  background: var(--phase-failed-dim);
  border-color: rgba(255, 51, 102, 0.15);
}
```

Note: The `.history-row.phase-done` currently says `background: transparent`. Change it to the subtle green-dim for consistency.

### Step 4: Redesign detail header rendering (app.js `renderDetail()`)

Replace the current `headerEl.innerHTML = [...]` block with a compact header showing only essentials:

```javascript
// Compact header: label, phase badge, status, timestamps, planFile
const label = deriveTaskLabel(task);
const lastChanged = getLastChangedTime(task);

headerEl.innerHTML = [
  renderHeaderRowHtml("Task", `<strong>${esc(label)}</strong>`),
  renderHeaderRowHtml("Phase", phaseHtml),
  renderHeaderRow("Started", startTime || "—"),
  renderHeaderRow("Last changed", lastChanged ? formatRelativeTime(lastChanged) : "—"),
  renderHeaderRow("Duration", durationMs == null ? "—" : formatDuration(durationMs)),
  task.planFile
    ? renderHeaderRowHtml(
        "Plan file",
        `<a href="#" style="color:var(--yellow)" title="${esc(task.planFile)}">${esc(task.planFile.split("/").pop())}</a>`,
      )
    : "",
]
  .filter(Boolean)
  .join("");
```

Remove: `id`, `task` (raw full text), `finishedAt`, `branch` from the compact header (they're in the collapsible).

### Step 5: Wrap detail fields in `<details>` element (app.js `renderDetail()`)

Replace the current `fieldsEl.innerHTML = Object.entries(task)...` with:

```javascript
const fieldsHtml = Object.entries(task)
  .map(
    ([key, value]) => `
    <div class="detail-label">${esc(key)}</div>
    <div class="detail-value detail-field-value">${renderDetailFieldValue(value)}</div>
  `,
  )
  .join("");

fieldsEl.innerHTML = `
  <details class="detail-collapsible">
    <summary class="detail-collapsible-summary">▶ Všechny atributy</summary>
    <div class="detail-fields-grid">
      ${fieldsHtml}
    </div>
  </details>
`;
```

### Step 6: Update HTML structure (index.html)

Change the `detail-fields-panel` to remove the inner grid div (since it moves inside `<details>`):

**Before:**

```html
<section class="detail-panel" id="detail-fields-panel">
  <div class="detail-panel-title">FULL DETAILS</div>
  <div id="detail-fields" class="detail-fields-grid"></div>
</section>
```

**After:**

```html
<section class="detail-panel" id="detail-fields-panel">
  <div id="detail-fields"></div>
</section>
```

Remove the panel title "FULL DETAILS" — it's replaced by the `<summary>` text. Remove `detail-fields-grid` class from the outer div — the grid is now inside the `<details>`.

### Step 7: Add collapsible styles (style.css)

```css
/* ── COLLAPSIBLE DETAILS ── */
.detail-collapsible {
  padding: 0;
}

.detail-collapsible-summary {
  padding: 10px 14px;
  cursor: pointer;
  color: var(--cyan);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2px;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border);
  list-style: none;
  user-select: none;
}

.detail-collapsible-summary::-webkit-details-marker {
  display: none;
}

.detail-collapsible[open] .detail-collapsible-summary {
  border-bottom: 1px solid var(--border);
}

.detail-collapsible .detail-fields-grid {
  padding: 12px 14px;
}
```

## Files to Modify

| Soubor              | Změna                                                                                                                                                                                                          |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `public/app.js`     | Add `getHistoryColorPhase()` helper; update `renderHistory()` to use color phase for row/badge/icon classes; redesign `renderDetail()` header to compact essentials; wrap detail fields in `<details>` element |
| `public/style.css`  | Add `.history-row.phase-planned` blue-dim background; change `.history-row.phase-done` from transparent to green-dim; add `.detail-collapsible` and `.detail-collapsible-summary` styles                       |
| `public/index.html` | Simplify `detail-fields-panel` markup — remove panel title and `detail-fields-grid` class from outer div                                                                                                       |
| `server.js`         | No changes needed                                                                                                                                                                                              |

## Testing

1. **History row colors — visual verification**
   - Load dashboard with mixed task data (done-with-impl, done-plan-only, failed)
   - Done tasks with `implSessionId` → green-dim background row
   - Done tasks without `implSessionId` → blue-dim background row
   - Failed tasks → red-dim background row
   - Phase badge text still shows actual phase ("done", "failed") but colored per visual phase

2. **Detail panel — compact header**
   - Click any task (active or history) → detail panel opens
   - Header shows only: task label (bold), phase badge, started, last changed, duration, plan file link
   - No duplicated raw task text or redundant IDs in header

3. **Detail panel — collapsible attributes**
   - Below header, "▶ Všechny atributy" is visible and collapsed
   - Click to expand → shows all task fields in grid layout
   - Click again → collapses
   - All original field data is present and correctly formatted (strings, objects as JSON, nulls)

4. **Responsive check**
   - On mobile viewport (< 640px), collapsible and header still render correctly
   - Grid adapts per existing responsive rules

5. **Legacy data compatibility**
   - Tasks without `phase` field still render correctly via `getTaskPhase()` fallback
   - Tasks without `implSessionId` field treated as plan-only

## Dependencies

- No new npm dependencies
- No build step changes
- Uses only native HTML `<details>/<summary>` (supported in all modern browsers)
- Relies on existing CSS custom properties from Plan 002 implementation
