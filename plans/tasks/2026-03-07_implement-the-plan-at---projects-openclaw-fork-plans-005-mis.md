Implement the plan at ~/Projects/openclaw-fork/plans/005_mission-control-detail-panel-cleanup-collapsible-sections.md

Summary of what to implement in ~/Projects/mission-control/:

1. Remove "duration" and "planFile link" from the compact detail header section.
   Keep: task label, phase badge, status, started at, last changed.

2. Wrap the task definition section (📋 Zadání / taskFile) in <details><summary>📋 Zadání</summary>...</details>
   Default: collapsed.

3. Wrap the plan section (📄 Plán / planFile) in <details><summary>📄 Plán</summary>...</details>
   Default: collapsed.

Both collapsible sections should use consistent styling with the existing "Všechny atributy" <details> element already in the panel.
