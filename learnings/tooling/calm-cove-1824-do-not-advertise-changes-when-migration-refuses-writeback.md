---
title: "Do not advertise changes when migration refuses writeback"
date: 2026-08-22
category: tooling
component: tooling
tags: [doctor, migration, writeback, diagnostics]
---

The doctor migration could return a non-empty `changes` list while leaving mixed or malformed configuration unchanged. That made unsafe input appear automatically repairable. For refused migrations, return the original configuration with `changes: []` and report actionable diagnostics separately. A tool's change metadata must describe actual safe mutations, not suggested manual repairs.
