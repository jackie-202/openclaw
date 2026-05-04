---
title: "Investigation plans should name both plan and report outputs"
date: 2026-05-04
category: tooling
component: tooling
tags: [compound-plan, investigations, planning]
file_type: rules
---

# Investigation plans should name both plan and report outputs

When a task is explicitly investigation-only, keep the compound-plan file under the canonical `plans/` path returned by `plan-path.py`, but make the investigation report path a separate required deliverable under `plans/investigations/`.

## Pattern

- Use `plan-path.py --task-id ... --title ... --touch` before writing the plan.
- Write only the plan to the returned `plans/...md` path.
- In the plan's steps, make the last action write `plans/investigations/<task-id>_<slug>.md`.
- Do not treat the investigation report as the plan file, and do not write either file under `plans/tasks/`.

## Why

This preserves task-state planning conventions while keeping final diagnostic evidence in the canonical investigations directory.
