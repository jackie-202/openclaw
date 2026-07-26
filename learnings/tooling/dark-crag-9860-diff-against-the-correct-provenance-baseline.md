---
title: "Diff against the correct provenance baseline"
date: 2026-07-25
category: tooling
component: tooling
tags: [git-diff, baseline, acceptance-evidence, noise]
---

Diffing selected files against `upstream/main` produced thousands of unrelated changed lines because the working branch had substantial divergence and formatting/history differences. Such output is unsuitable as scoped acceptance evidence even when the requested implementation is small. Use the task's recorded parent/source diff or another provenance-aware baseline; verify the baseline before interpreting diff size.