---
title: "Bound autoreview input for dirty worktrees"
date: 2026-08-17
category: tooling
component: tooling
tags: [autoreview, worktree, input-limit, scoped-review]
---

A local autoreview failed before producing a verdict because unrelated dirty-worktree content expanded the bundle beyond the engine's 1,048,576-character limit. The successful workaround used a small commit bundle as a carrier, attached the task checkpoint as a dataset, and explicitly instructed the reviewer to inspect only named current-worktree files with read-only tools. Reuse this bounded-review approach when a repository-wide local bundle is too large, and never treat an input-size failure as review evidence.