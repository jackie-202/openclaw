---
title: "Source-checkout plugin tests can exceed generic timeouts"
date: 2026-08-24
category: test-failures
component: tooling
tags: [vitest, plugin-loader, timeout, source-checkout]
---

The source-checkout runtime test produced periodic liveness messages but was terminated by the shell's 120-second limit before reporting assertions. Retrying the unchanged test with a longer command timeout passed in about 94 seconds, with nearly 90 seconds spent in the tests. Treat this suite as inherently slow: liveness output without assertion failures is not evidence of a code regression, and the correct first response is one unchanged retry with a larger outer timeout rather than modifying production code.
