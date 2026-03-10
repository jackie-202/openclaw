---
title: "Fork sync merge: audit-led conflict resolution"
date: 2026-03-11
category: tooling
component: tooling
tags: [git, merge, upstream-sync, conflict-resolution]
---

# Upstream merge with fork audit: practical guardrails

When syncing a long-lived fork with upstream, treat the fork audit as a conflict playbook instead of trying to reason ad-hoc in each conflicted hunk.

## What worked

- Resolve all merge conflicts first, but only apply fork-specific behavior in the files explicitly called out by the audit.
- In high-churn files, preserve upstream interface/flow refactors first, then re-apply small fork-only diagnostics (for example a debug log line) in the new structure.
- After conflict resolution, verify the exact contract points with quick pattern checks (expected fields, blocks, and schema parity) before running the full test suite.

## Why this matters

This keeps the fork close to upstream and avoids silent regressions like dropping upstream config fields (`compaction.model`) while still retaining intentional fork behavior (`groupGate`, group priming, debug traces).

## Extra note

Full `pnpm check` can fail on unrelated formatting drift in plan/learning docs; treat that separately from merge correctness, and do not “fix” plan files when the task forbids editing them.
