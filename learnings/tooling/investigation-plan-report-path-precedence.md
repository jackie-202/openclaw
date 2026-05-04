---
title: "Investigation plan report path precedence"
date: 2026-05-04
category: tooling
component: tooling
tags: [compound-plan, investigation, plans]
file_type: rules
---

# Investigation plans must separate report destination from task request paths

When a planning task includes investigation-specific rules, treat `plans/investigations/` as the canonical report destination even if the pasted task body also mentions an older `docs/investigations/...` deliverable path.

## Pattern

- Write the compound plan only to the `plan-path.py --touch` result under `plans/`.
- In the plan's final investigation step, explicitly write the report to `plans/investigations/<task-id>_<slug>.md`.
- Do not create or update `plans/tasks/` manually.
- Do not let legacy deliverable text redirect the report to `docs/investigations/` when the investigation-specific planning rules override it.

## Why

The task-state file and final investigation report are separate artifacts. Keeping the report under `plans/investigations/` makes follow-up monitor/review tooling find the canonical output.
