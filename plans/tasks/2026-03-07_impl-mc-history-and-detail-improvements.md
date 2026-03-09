Implement the plan at ~/Projects/openclaw-fork/plans/003_mission-control-history-colors-detail-panel-ux.md

Summary of what to implement in ~/Projects/mission-control/:

1. app.js + style.css — Phase-aware color coding for task HISTORY rows (same phase tokens already used for active cards):
   - Task completed only planning (phase=done, no implSessionId) → blue/cyan (--phase-planned)
   - Task completed implementation (phase=done, implSessionId set) → green (--phase-done)
   - Task failed at any phase → red (--phase-failed)
     Apply the existing .phase-badge and phase color CSS classes to history rows.

2. Detail panel deduplication + collapsible attributes:
   - Compact header: only show task label, phase badge, status, started at, last changed, planFile link
   - Remove the existing full-attributes section that duplicates everything
   - Add a <details><summary>▶ Všechny atributy</summary> block containing ALL fields (collapsed by default)
   - Native HTML <details>/<summary> — no JS needed
   - No duplication between the compact header and the collapsible section
