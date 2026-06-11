---
title: "Workspace smoke runs can be blocked by external directory permission gates"
date: 2026-06-10
category: tooling
component: tooling
tags: [permissions, workspace-smoke, external-directory, dry-run, proof-blocker]
---

The required dry-run from `~/.openclaw/workspace` did not fail because of application behavior; it was blocked by the tool permission layer, which auto-rejected access to that external directory. That means acceptance evidence can be incomplete even when the implementation is correct.

Reuse this lesson by treating external-workspace execution as an environment/permission prerequisite. Before relying on smoke checks outside the current project root, confirm access is allowed or record the permission gate explicitly in the checkpoint as the blocking reason instead of chasing a nonexistent runtime bug.
