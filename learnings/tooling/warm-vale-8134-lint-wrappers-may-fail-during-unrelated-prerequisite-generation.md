---
title: "Lint wrappers may fail during unrelated prerequisite generation"
date: 2026-08-21
category: tooling
component: ci-cd
tags: [oxlint, prerequisites, package-boundaries, failure-isolation]
---

Scoped oxlint invocations never reached the requested files because the wrapper first generated extension package-boundary artifacts and encountered an unrelated Slack type error: `primeChannelOutboundSendMock` was not exported. A command scoped by file arguments is not necessarily operationally isolated when its wrapper performs global preparation. Diagnose and report the failing prerequisite separately, then use focused tests, formatting, and diff checks as task-local evidence rather than claiming lint success.
