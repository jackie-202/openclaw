---
title: "Repository lint wrappers can fail before scoped linting"
date: 2026-08-09
category: tooling
component: tooling
tags: [lint, oxlint, scoped-verification]
---

The repository lint wrapper failed while preparing unrelated Slack package-boundary declarations, before linting the changed Deliberation test. When a wrapper's prerequisite is unrelated, run the underlying linter directly against the target file and report both results separately. This preserves scoped evidence without misrepresenting the repository-wide wrapper as passing; also distinguish findings on unchanged lines from regressions introduced by the task.
