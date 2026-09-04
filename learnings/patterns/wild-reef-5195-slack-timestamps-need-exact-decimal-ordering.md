---
title: "Slack timestamps need exact decimal ordering"
date: 2026-08-31
category: patterns
component: backend
tags: [slack, timestamps, ordering, precision]
---

Slack message IDs are decimal timestamp strings. Lexical comparison and floating-point conversion can produce incorrect ordering or lose precision. Parse and compare the seconds and fractional components exactly, then use that comparator consistently for watermark bounds, chronology, and validation such as ensuring a thread root is not later than its child.
