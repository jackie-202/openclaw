---
title: "Scope automated review inputs before submission"
date: 2026-08-17
category: tooling
component: tooling
tags: [autoreview, input-limit, dirty-worktree, scoped-review]
---

The automated review failed before starting because its assembled input reached 1,334,284 characters, exceeding the 1,048,576-character limit. A scoped fallback review of the task-owned Deliberation paths completed cleanly. For large or dirty worktrees, construct the review bundle from explicit task paths and artifacts instead of relying on a worktree-wide collector; truncating output after bundle construction does not prevent request-size failures.