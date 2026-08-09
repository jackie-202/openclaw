---
title: "Derive protected paths from the configured checkout"
date: 2026-08-09
category: patterns
component: e2e
tags: [portable-tests, canonical-paths, configuration, realpath]
---

The first harness hard-coded one developer's production spool path. That made the safety assertion non-portable and could test the wrong directory on another installation. Derive protected paths from the resolved cross-repository checkout or an owner-exported canonical constant, then compare resolved paths. Avoid embedding user-specific absolute paths in safety checks.
