---
title: "Plan-only investigations with no-git constraints"
date: 2026-06-10
category: tooling
component: tooling
tags: [compound-plan, investigation, no-git, report-path]
file_type: rules
---

# Plan-only investigations with no-git constraints

When a planning task requires an investigation report with exact branch/commit evidence but also forbids Git operations, do not add `git rev-parse` to the plan.

Use the plan to require non-mutating source metadata instead:

- read `.git/HEAD` and the referenced ref file if available;
- if metadata is unavailable, record the no-git constraint as the blocker;
- keep the report path helper as the final investigation step, not the plan path helper;
- keep code changes out of scope and list only `plans/investigations/<canonical-report>.md` as the future modified file.

This keeps investigation plans compliant with both evidence requirements and explicit no-git constraints.
