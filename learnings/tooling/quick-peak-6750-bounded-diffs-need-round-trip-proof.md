---
title: "Acceptance evidence must replay in both directions"
date: 2026-08-22
category: tooling
component: tooling
tags: [acceptance, evidence, diff, provenance, dirty-worktree]
file_type: rules
---

# Acceptance evidence must replay in both directions

When a repair is already present in a dirty worktree, test totals and checkpoint prose do not prove which implementation belongs to the task. Build a zero-context unified patch containing only the owner-local runtime and regression hunks, record its path inventory, statistics, and SHA-256, and keep unrelated shared-file changes out even when they are adjacent.

Reverse-apply validation alone proves only that the patch can be removed from the current tree. To establish a reproducible bounded baseline, copy every patch-owned file, reverse-apply the patch to those copies, forward-apply it again, and compare every resulting byte with the original current files. This catches omitted implementation hunks, stale patch metadata, and evidence that cannot reconstruct the claimed result.

Verification-only dependencies should be named explicitly. If a focused GREEN command includes a prerequisite test file whose implementation predates the repair, identify it as a prerequisite rather than silently omitting it or incorrectly claiming it as task-owned.
