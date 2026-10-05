---
title: "Untracked canonical plans need direct content verification"
date: 2026-10-01
category: tooling
component: tooling
tags: [compound-plan, git, verification]
file_type: rules
---

When plan-path.py --touch creates a new untracked plan, git diff --check -- <plan> produces no output even if the plan has content: git diff does not include untracked files. Verify the plan via a direct file read and, if needed, whitespace-check its contents with a formatter or after intentional staging; do not call an empty git diff proof of the new plan. This matters in shared dirty worktrees where staging unrelated user files is not acceptable.
