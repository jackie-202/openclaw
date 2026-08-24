---
title: "Split focused tests by Vitest project"
date: 2026-08-21
category: tooling
component: ci-cd
tags: [vitest, test-routing, timeouts, monorepo]
---

A combined invocation containing extension and plugin tests was routed entirely through the plugin Vitest project and exceeded the 120-second shell timeout without intermediate test output. This was not a behavioral failure. Splitting the same files by repository test project produced reliable results: the extension shard completed quickly, while the plugin loader shard legitimately required about 94 seconds. Reuse project-aligned invocations in this repository, and give known slow plugin-runtime tests a timeout based on their observed duration.
