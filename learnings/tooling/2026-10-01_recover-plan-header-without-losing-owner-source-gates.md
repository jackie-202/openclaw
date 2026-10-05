---
title: "Recover a plan artifact without replacing its implementation research"
date: 2026-10-01
category: tooling
component: tooling
tags: [compound-plan, orphan-recovery, plan-header]
file_type: checklist
---

When an orphaned planning task reports `plan_artifact_invalid: status=invalid_header`, rerun `compound-plan/scripts/plan-path.py` with the original task ID, project, title and `--touch`. Read the returned existing artifact before editing. Preserve its research and source gates; repair its first line to `# Plan YYYY-MM-DD: Title`, then read the artifact again to confirm the header and path. Do not move the plan into `plans/tasks/` or overwrite the task description.
