---
title: "Repository lint wrappers can fail before target linting"
date: 2026-08-09
category: tooling
component: tooling
tags: [oxlint, typescript, package-boundaries, verification]
---

The repository lint wrapper failed while preparing extension package-boundary declarations because an unrelated Slack harness imported a missing SDK export. It never reached the changed Deliberation test. When a wrapper fails during prerequisite generation, distinguish that infrastructure blocker from findings in the target file and run the underlying scoped linter directly for additional evidence. Report both outcomes rather than treating the wrapper failure as a target-code failure or silently replacing the prescribed check.
