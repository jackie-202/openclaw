---
title: "Clean up child processes when readiness fails"
date: 2026-08-09
category: runtime-errors
component: tooling
tags: [child-process, cleanup, readiness, temp-directories]
---

A listener spawned successfully but could remain alive if readiness parsing failed or timed out. Removing its temporary root first left an orphan process holding SQLite handles against deleted state. Retain the child reference outside the startup `try`, and on every startup failure terminate and await the child before removing fixture files. Cleanup tests should cover both callback failures and pre-readiness failures.
