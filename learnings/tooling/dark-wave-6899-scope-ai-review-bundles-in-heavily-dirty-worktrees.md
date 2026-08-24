---
title: "Scope AI review bundles in heavily dirty worktrees"
date: 2026-08-23
category: tooling
component: tooling
tags: [autoreview, dirty-worktree, input-limit, scoped-review]
---

The normal dirty-worktree autoreview bundle exceeded the engine's 1 MiB input limit because unrelated concurrent changes were included. A scoped read-only review of only task-owned files provided a practical fallback. When automated review bundles become too large, constrain the evidence to an explicit path inventory rather than omitting review or treating an input-size failure as a code finding.
