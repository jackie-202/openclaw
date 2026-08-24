---
title: "Acceptance: run the exact requested suite afresh"
date: 2026-08-19
category: tooling
component: ci-cd
tags: [acceptance, vitest, evidence, dirty-worktree]
file_type: rules
---

# Preserve Exact Acceptance Gates

When an acceptance follow-up requests a concrete suite command, run that command verbatim even if earlier session logs report the same result. The fresh result is the canonical evidence for the current task.

For a test-only repair in a dirty worktree, inspect the diff and leave unrelated production changes untouched. Record the scoped assertion and the exact test totals so reviewers can distinguish fresh verification from inherited worktree state.
