---
title: "Compound-plan investigation tasks need two canonical path helpers"
date: 2026-06-10
category: tooling
component: tooling
tags: [compound-plan, investigation, planning, path-helpers]
file_type: rules
---

# Compound-plan investigation tasks need two canonical path helpers

When a task asks for a plan document and also defines a later investigation report, use the compound-plan path helper before writing the plan and include the investigation report path helper as an explicit final work step.

For this task the plan path had to come from:

```bash
python3 "$HOME/.config/opencode/skills/compound-plan/scripts/plan-path.py" --task-id quick-wave-8890 --project . --title 'Investigate OpenClaw post-upstream-sync runtime regression: promise-without-action and session delivery' --touch
```

The investigation plan then needed to preserve the runtime flow `reproduce -> trace -> diagnose -> write report` and name the report helper/fallback path rules inside the final report step instead of inventing an output filename during planning.

Use this pattern for future plan-only diagnostic tasks so the task state, plan file, and final investigation report remain separate artifacts under `plans/` and `plans/investigations/`.
