---
title: "Acceptance follow-ups need task-scoped implementation provenance"
date: 2026-08-04
category: tooling
component: tooling
tags: [acceptance, tdd, provenance, dirty-worktree]
file_type: rules
---

# Acceptance follow-ups need task-scoped implementation provenance

When an acceptance follow-up inherits correct uncommitted production code, do not revert it to manufacture another RED. Link the parent task's genuine pre-fix RED, run fresh GREEN verification with the identical command, and create a follow-up evidence file containing the narrow production diff and exact test outcomes.

For dirty worktrees, explicitly separate inseparable earlier hunks from the repaired behavior. A passing test log alone does not prove that acceptance received the implementation; include the formatter, every required call site, and the request-boundary test rows in the task-scoped evidence.

The TDD capture helper may reject a follow-up proof because its RED was created by another task ID. In that legitimate evidence-only case, preserve the immutable parent proof reference and record fresh command, exit code, test count, and relevant passing test names under the follow-up's `## GREEN Phase` rather than fabricating new RED behavior.
