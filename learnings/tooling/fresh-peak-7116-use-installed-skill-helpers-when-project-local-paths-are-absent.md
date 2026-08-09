---
title: "Use installed skill helpers when project-local paths are absent"
date: 2026-08-07
category: tooling
component: tooling
tags: [skills, portability, save-learning]
---

A project-local `.claude/skills/save-learning/add-frontmatter.py` path was unavailable. The equivalent installed helper at `~/.config/opencode/skills/save-learning/add-frontmatter.py` successfully generated the learning artifact.

When a repository-local skill helper is missing, use the installed skill implementation rather than treating the documentation step as blocked. Keep the fallback scoped to tooling artifacts; it should not be used to bypass missing production contracts.
