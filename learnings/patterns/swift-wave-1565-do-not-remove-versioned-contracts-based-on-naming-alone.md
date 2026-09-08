---
title: "Do not remove versioned contracts based on naming alone"
date: 2026-09-07
category: patterns
component: backend
tags: [versioned-contracts, protocols, compatibility-removal, evidence]
---

A broad compatibility cleanup initially made the history-read v1/v2 snapshots look obsolete, but repository analysis showed that v2 was loaded by contract tests and both versions had separate runtime parsing branches and coverage. Compatibility removal should be bounded by references and behavior, not filenames containing `v1`, `v2`, or `legacy`. Retain versioned artifacts when they represent active protocol variants; delete them only after proving their runtime and test paths are retired.
