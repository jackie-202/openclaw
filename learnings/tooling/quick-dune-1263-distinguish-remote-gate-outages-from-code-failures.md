---
title: "Distinguish remote gate outages from code failures"
date: 2026-08-03
category: tooling
component: ci-cd
tags: [crabbox, blacksmith, remote-checks, infrastructure]
---

`pnpm check:changed` could not execute because the configured Blacksmith executable was absent. Automatic Crabbox fallback selected Azure, which lacked CLI credentials, while explicit AWS required broker authentication. These are infrastructure-startup failures, not test failures. Record each attempted provider and its exact blocker, then complete all available local evidence such as focused suites, formatting, build, and scoped review. Do not report the unavailable remote gate as passed or interpret its lack of results as a code defect.
