---
title: "Allow multi-minute timeouts for full tsdown builds"
date: 2026-08-25
category: build-errors
component: tooling
tags: [tsdown, timeouts, build, ci]
---

The first full build was terminated by the shell's 120-second timeout while `tsdown` was still running silently. A retry with a larger timeout completed successfully; observed `tsdown` durations ranged from about 94 to 175 seconds. Treat periodic 30-second no-output messages as progress diagnostics rather than a hang, and configure full-build verification with enough headroom before diagnosing a build failure.
