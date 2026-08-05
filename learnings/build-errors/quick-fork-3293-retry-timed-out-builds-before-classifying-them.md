---
title: "Retry timed-out builds before classifying them"
date: 2026-08-02
category: build-errors
component: tooling
tags: [build, timeout, verification, retry]
---

The first `pnpm build` reached postbuild stages but was terminated by the shell's 120-second timeout, so it could not be recorded as passing. A retry with a longer timeout completed successfully in 122.7 seconds. Treat partial build output as inconclusive rather than success or a product failure; when the process is still making progress, retry with a timeout based on observed runtime.
