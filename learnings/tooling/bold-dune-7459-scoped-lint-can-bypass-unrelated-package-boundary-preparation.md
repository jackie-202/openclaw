---
title: "Scoped lint can bypass unrelated package-boundary preparation"
date: 2026-08-17
category: tooling
component: tooling
tags: [oxlint, type-declarations, extension-boundaries, verification]
---

The oxlint wrapper failed before linting touched files because its package-boundary preparation typechecked Slack test artifacts containing an unrelated missing SDK export. After a successful full build established current artifacts, `OPENCLAW_OXLINT_SKIP_PREPARE=1` allowed a focused lint run over the changed files. Use this only as a documented scoped-verification workaround; preserve the original preparation failure as a separate blocker rather than claiming the complete lint pipeline passed.