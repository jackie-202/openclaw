---
title: "Scope reviews in dirty worktrees"
date: 2026-08-03
category: tooling
component: tooling
tags: [autoreview, dirty-worktree, review-scope, concurrent-changes]
---

A repository-wide autoreview reported high-priority findings from unrelated pre-existing KM transport-contract changes and initially classified the patch as incorrect. Rerunning the reviewer with an explicit file and behavior scope produced a clean review of the actual task. In shared or dirty worktrees, retain the broad review as evidence but run a second narrowly scoped review when unrelated changes obscure the target patch; never modify or dismiss concurrent changes without first separating their ownership and scope.
