---
title: "Bound pagination independently of output size"
date: 2026-08-16
category: patterns
component: backend
tags: [pagination, resource-bounds, slack, fail-closed]
---

Count and byte limits on collected messages did not bound provider traversal because pages could contain only duplicates, filtered rows, or otherwise unusable evidence. Even repeated-cursor detection was insufficient because a provider could return infinitely many distinct cursors.

For paginated external APIs, enforce an independent finite page or cursor budget during traversal. When any traversal, count, or byte budget is exhausted, stop immediately and return an explicitly incomplete result such as `complete: false`.