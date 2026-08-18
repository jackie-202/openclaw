---
title: "Large dirty worktrees can exceed autoreview bundle limits"
date: 2026-08-17
category: tooling
component: tooling
tags: [autoreview, bundle-size, dirty-worktree, scoped-review]
---

Local autoreview attempted to include unrelated dirty-worktree material and exceeded its 1 MiB input limit before producing findings. The effective workaround was to review only the task's touched product and test files, then rerun after addressing findings. When using bundle-based review in a shared worktree, scope evidence to attributable files instead of deleting or altering concurrent changes.