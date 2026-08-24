---
title: "Code review must distinguish task-owned hunks from adjacent edits"
date: 2026-08-21
category: tooling
component: general
tags: [code-review, dirty-worktree, change-ownership, autoreview]
---

Automated review initially flagged Discord thread behavior in a file touched by the task, but inspection showed that behavior was pre-existing unrelated work; the task only replaced source membership lookups. Rerunning review with an explicit hunk-level ownership boundary produced a clean result. In concurrent or dirty worktrees, review the actual task-owned diff rather than treating every modification in a touched file as part of the patch.
