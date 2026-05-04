---
title: "Diagnostic-only investigations can use lightweight verification when no runtime code changes"
date: 2026-05-04
category: tooling
component: tooling
tags: [verification, investigation, git-diff-check, tests]
---

For investigation tasks that only add reports, checkpoints, or learnings, `git diff --check` is often the right verification baseline. In this case the targeted test could not even start because a pre-existing heavy-check lock was held by another process, so the clean outcome was to record that as an external blocker rather than treating it as a failure of the investigation itself. Reuse this approach for source-free analysis tasks: run lightweight structural verification, note unrelated CI/test locks explicitly, and avoid claiming runtime validation that never actually ran.
