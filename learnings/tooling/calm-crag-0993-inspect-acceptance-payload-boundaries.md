---
title: "Inspect the acceptance payload, not only source artifacts"
date: 2026-08-22
category: tooling
component: ci-cd
tags: [acceptance, evidence, tdd, dirty-worktree, provenance]
file_type: rules
---

# Inspect the acceptance payload, not only the source artifacts

An acceptance run can reject a completed change even when the current proof file contains both RED and GREEN. The reviewer judges the caller-supplied task material: if that payload truncates the proof before GREEN or omits preserved uncommitted implementation hunks, the full files in the worktree do not repair the evidence boundary.

For an acceptance retry, compare each finding with both the current artifact and the supplied acceptance result. Preserve the genuine parent RED, rerun the identical command for fresh follow-up GREEN, and include the complete task-owned source/test diff inline. Explicitly exclude unrelated dirty-worktree hunks, including unrelated changes in the same files; if no clean provenance baseline can isolate them, report the ownership blocker rather than broadening the claimed diff.
