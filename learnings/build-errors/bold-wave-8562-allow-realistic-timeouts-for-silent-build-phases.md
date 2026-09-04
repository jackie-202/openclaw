---
title: "Allow realistic timeouts for silent build phases"
date: 2026-08-25
category: build-errors
component: tooling
tags: [timeouts, tsdown, build-verification, ci]
---

The first full build was terminated by the generic 120-second command timeout while `tsdown` emitted only periodic liveness messages. Process inspection showed that no build process remained, and rerunning with a larger timeout completed successfully; `tsdown` alone took roughly 78 seconds and the full build about 83 seconds. Long silent phases should expose liveness, but automation must also use a timeout derived from observed build duration. A timeout is not evidence of a compiler failure.
