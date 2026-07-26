---
title: "Distinguish command timeout from build failure"
date: 2026-07-24
category: build-errors
component: tooling
tags: [build, timeout, verification, ci]
---

The first `pnpm build` reached the UI phase but the shell killed it at the default 120-second timeout. This was not evidence of a build defect: a retry with a larger timeout completed successfully in 107.4 seconds. For known long builds, set a timeout with adequate margin and classify tool termination separately from compiler or bundler failure before investigating code.