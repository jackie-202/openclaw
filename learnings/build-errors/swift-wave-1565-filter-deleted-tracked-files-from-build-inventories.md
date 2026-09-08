---
title: "Filter deleted tracked files from build inventories"
date: 2026-09-07
category: build-errors
component: tooling
tags: [git-ls-files, build-inventory, dirty-worktree, deletion-first]
---

`git ls-files` reports tracked paths even after their working-tree files have been deleted. During deletion-first refactoring, this caused build discovery to generate an entry for a nonexistent Deliberation sidecar, making the first GREEN run fail. Build inventory collectors should verify that each discovered source still exists before emitting entries. Reuse this generic filter for dirty or sparse checkouts rather than adding component-specific exclusions.
