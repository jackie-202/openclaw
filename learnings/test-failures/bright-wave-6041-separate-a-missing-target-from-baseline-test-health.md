---
title: "Separate a missing target from baseline test health"
date: 2026-07-27
category: test-failures
component: tooling
tags: [vitest, test-target, red-phase, baseline]
---

Running the planned plugin test path produced `explicit test target matched no test files` because implementation was intentionally blocked and the target did not exist. This is useful RED evidence, but it is not evidence that the existing hook infrastructure is broken.

Run focused tests for adjacent established seams separately. Here, three existing plugin hook test files and 19 tests passed, proving the baseline remained healthy. Record these outcomes distinctly: an absent target is the blocked feature's RED state, while passing neighboring tests only establish baseline health and must not be presented as GREEN for the missing feature.
