Use the compound-plan skill to create a detailed implementation plan for:

**Mission Control — task history colors + detail panel UX improvements**

Project: ~/Projects/openclaw-fork
Plans output dir: ~/Projects/openclaw-fork/plans/
External dirs with access: ~/.openclaw/workspace/**, ~/.openclaw/cron/**, ~/Projects/mission-control/**

## Changes needed in ~/Projects/mission-control/

### 1. Task history — phase-aware color coding

The history list (completed/failed tasks) currently shows tasks in a uniform style. Add the same phase-based color coding that active cards use, so at a glance you can tell:
- Task that only completed **planning** (phase=planned or phase=done but no implSessionId) → blue/cyan tone
- Task that completed **implementation** (phase=done with implSessionId set) → green tone  
- Task that **failed** at any phase → red tone (already may exist, just verify it applies consistently)

Use the existing CSS phase color tokens (`--phase-planned`, `--phase-done`, `--phase-failed`, etc.) and `.phase-badge` classes already in style.css. Apply them to history rows in the same way active cards get them.

### 2. Detail panel — deduplicate and add collapsible full attributes

Currently the detail panel shows:
- A summary section with a few key attributes
- Below it, a full attributes section listing **all** the same fields again (duplication)

Goal:
- Keep a compact **header section** with only the most important fields: task label, phase badge, status, started at, last changed, planFile link
- Replace the full attributes section with a **collapsible `<details>` element** ("▶ Všechny atributy") that contains ALL fields
- The `<details>` should be **collapsed by default** — user can click to expand
- No duplication between the compact header and the collapsible section (the collapsible shows everything, the header shows only the essentials)
- Use native HTML `<details>/<summary>` for the collapsible — no JS needed
