---
title: "Separate lint preparation failures from scoped lint results"
date: 2026-08-01
category: tooling
component: tooling
tags: [oxlint, scoped-lint, build-artifacts, verification]
---

The repository lint wrapper failed before linting the changed extension because preparation of an unrelated Slack package boundary artifact referenced a missing SDK export. Using the wrapper's supported `OPENCLAW_OXLINT_SKIP_PREPARE=1` mode allowed a narrow lint of the touched files while preserving the original failure as an unrelated verification limitation. Do not report the broad lint as passing; record both the preparation failure and the successful touched-file lint.
