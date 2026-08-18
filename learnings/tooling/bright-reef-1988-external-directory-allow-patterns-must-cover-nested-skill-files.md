---
title: "External-directory allow patterns must cover nested skill files"
date: 2026-08-17
category: tooling
component: tooling
tags: [permissions, external-directory, skills, glob-patterns]
---

Reads of nested files such as `validate-implementation/project/rules.md` were denied even though the permission list allowed `validate-implementation/*`. A single-level wildcard may not authorize deeper descendants before the catch-all deny applies. Skills that load nested resources need an explicitly recursive allow pattern or separate allows for their subdirectories. Verify actual nested reads when testing permission rules rather than assuming access to the skill root covers its complete resource tree.