---
title: "Compare Slack timestamps as exact decimals"
date: 2026-08-16
category: patterns
component: shared
tags: [slack, timestamps, precision, validation]
---

Slack message and thread IDs are decimal timestamp strings whose exact identity and ordering matter. Generic numeric conversion risks precision loss and inconsistent validation across intake and history code.

Centralize syntax validation and exact decimal comparison in a shared helper. Reuse it for equality, ordering, cutoff checks, and malformed-input rejection rather than coercing timestamps to floating-point numbers.