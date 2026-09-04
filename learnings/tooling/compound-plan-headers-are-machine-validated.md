---
title: "Compound-plan headers are machine-validated"
date: 2026-08-24
category: tooling
component: tooling
tags: [compound-plan, planning, artifact-schema, orphan-recovery]
file_type: rules
---

# Compound-plan headers are machine-validated

A canonical filename is not enough for a valid compound-plan artifact. The first line must use the dated schema `# Plan YYYY-MM-DD: Title`; a plain `# Title` can leave an otherwise complete plan orphaned with `invalid_header`.

After writing a plan, validate all three artifact properties before handoff: the exact path returned by `plan-path.py`, direct placement under `plans/` rather than `plans/tasks/`, and the dated first-line header. Retrying should repair the existing canonical file instead of creating a second plan.
