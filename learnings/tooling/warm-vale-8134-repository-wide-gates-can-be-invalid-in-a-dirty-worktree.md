---
title: "Repository-wide gates can be invalid in a dirty worktree"
date: 2026-08-21
category: tooling
component: ci-cd
tags: [dirty-worktree, changed-files, scoped-verification, failure-attribution]
---

Extensive unrelated changes caused `changed:lanes` to classify unknown files fail-safe into every lane, making the broad changed gate unrelated to the task's actual surface. Verification remained useful by separating focused tests, formatting, and review of task-owned hunks from repository-wide failures. In shared dirty worktrees, record both scoped evidence and the exact external blocker; do not attribute broad-gate failures to the current change without ownership evidence.
