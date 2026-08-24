---
title: "Bound review bundles before invoking external reviewers"
date: 2026-08-22
category: tooling
component: tooling
tags: [autoreview, prompt-size, bundles, scoping]
---

An autoreview invocation failed before execution because its generated input exceeded the 1,048,576-character limit. Large dirty worktrees and accumulated task artifacts can make local review bundles unusable. Scope reviews to the relevant paths or commit range and provide bounded evidence files rather than sending the entire workspace context.
