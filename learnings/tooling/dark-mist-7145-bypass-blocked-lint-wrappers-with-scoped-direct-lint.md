---
title: "Bypass blocked lint wrappers with scoped direct lint"
date: 2026-08-21
category: tooling
component: ci-cd
tags: [lint, dirty-worktree, oxlint, prerequisites]
---

The repository lint wrapper failed before inspecting the task files because prerequisite generation encountered an unrelated missing Slack SDK export. Running Oxlint directly on the owned files exposed three genuine local findings, which were corrected and rechecked. When a broad wrapper is blocked by an unrelated prerequisite, preserve the blocker as an explicit unresolved gate, then run the underlying formatter and linter directly on the task scope rather than treating the wrapper failure as evidence that the patch is invalid.
