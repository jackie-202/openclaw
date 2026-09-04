---
title: "Loader tests may exceed generic command timeouts"
date: 2026-08-24
category: test-failures
component: tooling
tags: [vitest, timeouts, plugin-loader, verification]
---

The source-checkout plugin loader test emitted periodic no-output warnings and was terminated by the shell's 120-second limit, despite having no test assertion failure. Retrying the same command with a larger tool timeout passed in about 86 seconds. Distinguish harness termination from a failing test and allow a larger timeout for expensive loader-backed suites before diagnosing product code.
