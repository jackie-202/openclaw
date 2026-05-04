---
title: "Acceptance retry plans must preserve review scope"
date: 2026-05-04
category: tooling
component: tooling
tags: [compound-plan, acceptance, retry, investigation]
file_type: rules
---

# Acceptance retry plans must preserve review scope

When creating a compound plan for an acceptance retry, read the original plan and current artifacts before drafting. The plan should target only unmet acceptance goals, preserve already-completed source tracing, and explicitly call out unrelated worktree changes that must be removed from the task diff.

## Pattern

- Run the canonical `plan-path.py --task-id ... --title ... --touch` command before writing the plan.
- Write only the plan to the returned `plans/` path.
- Name required report/checkpoint artifacts separately in implementation steps.
- If review feedback says evidence is missing, plan concrete evidence commands instead of repeating source-only analysis.
- If review feedback says the diff contains unrelated files, plan cleanup of only clearly unrelated untracked files and avoid touching user-owned changes.
