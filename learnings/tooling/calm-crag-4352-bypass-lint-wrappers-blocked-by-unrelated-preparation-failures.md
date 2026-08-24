---
title: "Bypass lint wrappers blocked by unrelated preparation failures"
date: 2026-08-21
category: tooling
component: tooling
tags: [lint, dirty-worktree, oxlint, scoped-validation]
---

The repository lint wrapper failed before examining the target file because its extension-boundary preparation encountered unrelated `qa-channel` declaration and missing-export errors. Running the underlying type-aware Oxlint command directly against the task-owned contract test succeeded.

When a broad wrapper fails in prerequisite generation outside the task scope, verify whether it reached the target. Preserve and report the wrapper failure, then run the narrow underlying tool against the owned files. Do not misclassify unrelated preparation failures as defects in the changed surface.
