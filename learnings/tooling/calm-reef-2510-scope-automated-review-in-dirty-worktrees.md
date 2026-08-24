---
title: "Scope automated review in dirty worktrees"
date: 2026-08-21
category: tooling
component: tooling
tags: [autoreview, dirty-worktree, review-scope, false-positive]
---

An unscoped automated review reported defects from unrelated worktree changes and initially evaluated the wire contract without its deployment constraints. Rerunning it with an explicit file list and contract assumptions isolated the task and exposed the real routing defect. For repositories with concurrent changes, provide exact implementation paths and relevant invariants to review tools, while still evaluating every finding against the code before dismissing it.
