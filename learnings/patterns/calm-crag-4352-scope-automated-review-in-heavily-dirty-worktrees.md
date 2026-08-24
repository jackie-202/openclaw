---
title: "Scope automated review in heavily dirty worktrees"
date: 2026-08-21
category: patterns
component: tooling
tags: [autoreview, dirty-worktree, review-scope, evidence]
---

The worktree contained many unrelated modified and untracked files, making an unrestricted local review noisy and potentially misleading. The automated review prompt explicitly limited evaluation to the two task-owned evidence files and instructed the reviewer to ignore unrelated changes; the scoped review found no actionable issues.

In shared or dirty worktrees, name the exact owned files and intended behavior in automated-review prompts. Pair this with scoped diff checks so conclusions describe the task rather than ambient concurrent work.
