# Plan 005: Mission Control — detail panel cleanup + collapsible sections

Clean up the detail panel compact header (remove duration and planFile link) and wrap the Zadání and Plán sections in collapsible `<details>` elements matching the existing "Všechny atributy" collapsible style.

_Status: WIP_
_Vytvořeno: 2026-03-07_

---

## Progress

- [x] Fáze 0: Config + Init
- [x] Fáze 1: Research
- [x] Fáze 2: Knowledge
- [ ] Fáze 3: Synthesis

## Problem

Three changes to the Mission Control detail panel in `~/Projects/mission-control/`:

### 1. Remove "duration" and "plan file link" from compact header

The compact detail header currently shows: task label, phase, started at, last changed, **duration**, and **plan file link**. Remove the last two from the header. Duration is already available in the collapsible "Všechny atributy" section. The plan is rendered below the header, making the link redundant.

**Keep in compact header:** task label, phase badge, status, started at, last changed.

### 2. Make "📋 Zadání" section collapsible

Wrap the task definition section (taskFile markdown) in a `<details>/<summary>` element:

- Default state: **collapsed**
- Summary text: `📋 Zadání`
- Content: the rendered markdown (existing `renderTaskFile` output)

### 3. Make "📄 Plán" section collapsible

Wrap the plan section (planFile markdown) in a `<details>/<summary>` element:

- Default state: **collapsed**
- Summary text: `📄 Plán`
- Content: the rendered markdown (existing `renderPlan` output)

Both sections should use consistent styling — same `<details>` look as the "Všechny atributy" collapsible already in the panel.

## Analysis [DONE]

### Kontext z codebase

**Project structure:** `~/Projects/mission-control/` is a plain Node.js HTTP server (`server.js`) serving static files from `public/`. No build step, no framework — vanilla HTML/CSS/JS.

**Files involved:**

- `public/app.js` (688 lines) — all rendering logic
- `public/index.html` (92 lines) — HTML structure for the detail panel
- `public/style.css` (759 lines) — all styles including existing collapsible `.detail-collapsible` classes

**Current detail panel structure (index.html lines 53–78):**

```
detail-view
  detail-shell
    detail-topbar (← BACK button)
    detail-panel #detail-header-panel — "TASK LIFECYCLE" header grid
    detail-panel #detail-fields-panel — collapsible "Všechny atributy"
    detail-panel #detail-taskfile-panel — "📋 TASK DEFINITION" (hidden by default)
    detail-panel #detail-plan-panel — "PLAN / MARKDOWN"
```

**Current compact header rendering (`renderDetail` in app.js, lines 377–438):**

```javascript
headerEl.innerHTML = [
  renderHeaderRowHtml('Task', `<strong>${esc(label)}</strong>`),
  renderHeaderRowHtml('Phase', phaseHtml),
  renderHeaderRow('Started', startTime || '—'),
  renderHeaderRow('Last changed', lastChanged ? formatRelativeTime(lastChanged) : '—'),
  renderHeaderRow('Duration', durationMs == null ? '—' : formatDuration(durationMs)),       // ← REMOVE
  task.planFile                                                                              // ← REMOVE
    ? renderHeaderRowHtml('Plan file', `<a href="#" ...>${esc(...)}</a>`)
    : '',
].filter(Boolean).join('');
```

**Existing collapsible pattern (app.js lines 423–430):**
The "Všechny atributy" section already uses `<details class="detail-collapsible">` / `<summary class="detail-collapsible-summary">`. This exact pattern should be reused for the Zadání and Plán sections.

**Existing collapsible CSS (style.css lines 572–600):**

- `.detail-collapsible` — removes padding
- `.detail-collapsible-summary` — styled like a panel title with cyan color, 11px, 700 weight, 2px letter-spacing, `var(--bg-card)` background
- `.detail-collapsible[open] .detail-collapsible-summary` — bottom border
- Hides the native `<details>` marker via `::-webkit-details-marker`

**Task file rendering (`renderTaskFile`, app.js lines 470–498):**

- Fetches markdown from `/api/taskfile?path=...`
- Renders into `#detail-taskfile` element
- Panel visibility controlled via `panelEl.style.display`

**Plan rendering (`renderPlan`, app.js lines 441–468):**

- Fetches markdown from `/api/plan?file=...`
- Renders into `#detail-plan` element

### Knowledge base

No dedicated learnings directory in this repo. Patterns derived from codebase:

- **Native HTML `<details>/<summary>`** already in use — no JS needed for collapse/expand
- **CSS classes** `.detail-collapsible` and `.detail-collapsible-summary` are the established pattern
- **DOMPurify** is used for sanitizing rendered markdown — collapsible wrapper must be outside the sanitized content
- Plan 003 (predecessor) introduced the current collapsible "Všechny atributy" section and the compact header — this plan is a direct follow-up

## Solutions

### Approach: minimal HTML/CSS changes, reuse existing collapsible pattern

All three changes are straightforward edits to existing code. No new dependencies, no new components, no architectural changes.

1. **Header cleanup:** Remove 2 lines from the `headerEl.innerHTML` array in `renderDetail()`
2. **Zadání collapsible:** Change the HTML structure in `index.html` and adjust `renderTaskFile()` to inject content inside a `<details>` wrapper
3. **Plán collapsible:** Same pattern — change HTML structure and adjust `renderPlan()` to inject inside `<details>` wrapper

**Key decision:** Where to create the `<details>` wrapper — in `index.html` (static HTML) or in JS (dynamic)?

**Recommendation:** Create the `<details>/<summary>` structure in the **static HTML** (`index.html`) and have the JS functions inject only the content div inside the `<details>` element. This is consistent with how the existing panel titles work and keeps the JS simpler.

However, the existing "Všechny atributy" collapsible is created entirely in JS (`fieldsEl.innerHTML = ...`). For consistency within the JS code, it would be equally valid to build the `<details>` in JS.

**Chosen approach:** Build `<details>` wrappers in **static HTML** (index.html) because:

- The panel sections already exist in HTML with `detail-panel-title` divs
- We simply replace the static `detail-panel-title` div with a `<details>` wrapper
- The JS render functions only need to target the content container (already the case)
- Less JS churn

## Implementation

### Step 1: Remove duration and planFile link from compact header

**File:** `public/app.js`
**Location:** `renderDetail()` function, lines 405–414

**Change:** Remove lines for `Duration` and `Plan file` from the `headerEl.innerHTML` array.

**Before:**

```javascript
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

**After:**

```javascript
headerEl.innerHTML = [
  renderHeaderRowHtml("Task", `<strong>${esc(label)}</strong>`),
  renderHeaderRowHtml("Phase", phaseHtml),
  renderHeaderRow("Started", startTime || "—"),
  renderHeaderRow("Last changed", lastChanged ? formatRelativeTime(lastChanged) : "—"),
].join("");
```

Also clean up the now-unused variables `durationMs`, `startedAtMs`, `finishedAtMs` from the function (lines 393–396). These are only used for the duration display. However `startedAtMs` is used to compute `durationMs` which we're removing. The `startTime` variable itself is still used for the "Started" row, so keep that.

**Variables to remove (lines 394–396):**

```javascript
const startedAtMs = startTime ? new Date(startTime).getTime() : null;
const finishedAtMs = task.finishedAt ? new Date(task.finishedAt).getTime() : null;
const durationMs = startedAtMs ? (finishedAtMs || Date.now()) - startedAtMs : null;
```

### Step 2: Make "📋 Zadání" section collapsible

**File:** `public/index.html`
**Location:** Lines 68–71 (`#detail-taskfile-panel`)

**Before:**

```html
<section class="detail-panel" id="detail-taskfile-panel" style="display:none">
  <div class="detail-panel-title">📋 TASK DEFINITION</div>
  <div id="detail-taskfile" class="detail-plan-content"></div>
</section>
```

**After:**

```html
<section class="detail-panel" id="detail-taskfile-panel" style="display:none">
  <details class="detail-collapsible">
    <summary class="detail-collapsible-summary">📋 Zadání</summary>
    <div id="detail-taskfile" class="detail-plan-content"></div>
  </details>
</section>
```

No changes needed in `app.js` for `renderTaskFile()` — it already targets `#detail-taskfile` and sets `panelEl.style.display` for visibility. The content injection (`taskFileEl.innerHTML = ...`) still writes into the same `#detail-taskfile` div, now nested inside `<details>`.

### Step 3: Make "📄 Plán" section collapsible

**File:** `public/index.html`
**Location:** Lines 73–76 (`#detail-plan-panel`)

**Before:**

```html
<section class="detail-panel" id="detail-plan-panel">
  <div class="detail-panel-title">PLAN / MARKDOWN</div>
  <div id="detail-plan" class="detail-plan-content"></div>
</section>
```

**After:**

```html
<section class="detail-panel" id="detail-plan-panel">
  <details class="detail-collapsible">
    <summary class="detail-collapsible-summary">📄 Plán</summary>
    <div id="detail-plan" class="detail-plan-content"></div>
  </details>
</section>
```

No changes needed in `app.js` for `renderPlan()` — same reasoning as above.

### Step 4 (optional cleanup): Remove dead code in renderDetail

After removing the Duration and Plan file rows, these local variables in `renderDetail()` are unused:

- `startedAtMs` (line 394)
- `finishedAtMs` (line 395)
- `durationMs` (line 396)

Remove them for cleanliness.

## Files to Modify

| File                | Change                                                                                                                                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `public/app.js`     | Remove Duration and Plan file rows from `renderDetail()` header (lines 410–413). Remove unused variables `startedAtMs`, `finishedAtMs`, `durationMs` (lines 394–396).                                   |
| `public/index.html` | Wrap `#detail-taskfile-panel` content in `<details>/<summary>` with summary "📋 Zadání" (lines 68–71). Wrap `#detail-plan-panel` content in `<details>/<summary>` with summary "📄 Plán" (lines 73–76). |

**No CSS changes needed** — the existing `.detail-collapsible` and `.detail-collapsible-summary` classes already provide the correct styling.

**No server.js changes needed** — the API endpoints are unaffected.

## Testing

1. **Start the server:** `cd ~/Projects/mission-control && npm start`
2. **Open** `http://localhost:3000` in browser
3. **Click on any task** (active or history) to open detail view
4. **Verify compact header:**
   - Shows: Task label, Phase badge, Started, Last changed
   - Does NOT show: Duration, Plan file link
5. **Verify "📋 Zadání" section:**
   - Collapsed by default
   - Click summary text "📋 Zadání" to expand
   - Rendered markdown content appears
   - Only visible when task has a `taskFile`
6. **Verify "📄 Plán" section:**
   - Collapsed by default
   - Click summary text "📄 Plán" to expand
   - Rendered markdown content appears
7. **Verify "Všechny atributy" collapsible:**
   - Still works as before
   - Contains all fields including duration (computed from task data)
8. **Verify visual consistency:**
   - All three collapsible sections use the same styling (cyan text, bg-card background, same spacing)
9. **Mobile test:** Verify collapsible sections work on narrow viewport (< 640px)

## Dependencies

- None. All changes are frontend-only, using existing CSS classes and existing API endpoints.
- Requires a running instance with task data to test (or mock data in `opencode-tasks.json`).

---

_Vytvořeno: 2026-03-07_
_Status: DRAFT_
