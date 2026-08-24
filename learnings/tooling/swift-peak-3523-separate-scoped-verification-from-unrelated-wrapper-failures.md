---
title: "Separate scoped verification from unrelated wrapper failures"
date: 2026-08-21
category: tooling
component: ci-cd
tags: [lint, typecheck, verification, monorepo]
---

The broad extension lint wrapper failed before checking the task because Slack boundary declarations referenced a missing `primeChannelOutboundSendMock`; a later typecheck was independently blocked by missing MCP SDK modules. The changed files were still verified with the repository's configured formatter and direct scoped `oxlint`, focused tests, and a successful full build. In large monorepos, report prerequisite failures explicitly and use equivalent scoped checks for task evidence, but do not modify unrelated packages merely to make a broad wrapper run.
