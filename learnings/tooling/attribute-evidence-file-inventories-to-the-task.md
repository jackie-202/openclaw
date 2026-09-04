---
title: "Attribute evidence file inventories to the task"
date: 2026-08-25
category: tooling
component: ci-cd
tags: [acceptance, evidence, provenance, dirty-worktree]
file_type: rules
---

# Attribute evidence file inventories to the task

In a dirty worktree with concurrent tasks, `git status` is not a valid source for a task's files-changed list. An acceptance final note must derive that list from the parent plan, task-owned diff hunks, tests, and lifecycle call chain, then list follow-up evidence artifacts separately.

Do not include every dirty path or omit shared files merely because they contain concurrent edits. If attribution cannot be established, record the provenance gap instead of presenting a guessed complete inventory.
