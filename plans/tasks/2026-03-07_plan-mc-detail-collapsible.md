Use the compound-plan skill to create a detailed implementation plan for:

**Mission Control — detail panel cleanup + collapsible sections**

Project: ~/Projects/openclaw-fork
Plans output dir: ~/Projects/openclaw-fork/plans/
External dirs with access: ~/.openclaw/workspace/**, ~/Projects/mission-control/**

## Changes needed in ~/Projects/mission-control/

### 1. Remove "duration" and "plan file link" from compact header

The compact detail header currently shows a few key fields. Remove:
- **duration** — remove from the compact header (it can stay in the collapsible "Všechny atributy" section)
- **planFile link** — remove from the compact header (the plan is already rendered below, the link is redundant)

Keep in compact header: task label, phase badge, status, started at, last changed.

### 2. Make "📋 Zadání" section collapsible

The task definition section (taskFile markdown) should be wrapped in a `<details>/<summary>` element:
- Default state: **collapsed**
- Summary text: `📋 Zadání`
- Content: the rendered markdown (existing renderTaskFile output)

### 3. Make "📄 Plán" section collapsible

The plan section (planFile markdown) should also be wrapped in `<details>/<summary>`:
- Default state: **collapsed**
- Summary text: `📄 Plán`
- Content: the rendered markdown (existing renderPlan output)

Both sections should use consistent styling — same `<details>` look as the "Všechny atributy" collapsible already in the panel.
