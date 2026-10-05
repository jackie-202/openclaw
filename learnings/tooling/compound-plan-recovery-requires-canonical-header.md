---
title: "Compound-plan recovery requires the canonical Plan header"
date: 2026-09-30
category: tooling
component: tooling
tags: [compound-plan, planning, recovery, headers]
file_type: checklist
---

# Compound-plan artifact header is part of the recovery contract

When resuming a planning task after `plan_artifact_invalid: status=invalid_header`, do not discard the existing canonical plan or infer a new filename. Run `compound-plan/scripts/plan-path.py` with the original task ID, title, project and `--touch`, then inspect the returned file. In this task the existing draft began `# Export plugin-sdk ...`; changing its first line to `# Plan 2026-09-30: Export plugin-sdk ...` aligned it with the project's accepted plan format while preserving the prior research and implementation steps. Check the header and canonical path before handing off a recovered plan.
