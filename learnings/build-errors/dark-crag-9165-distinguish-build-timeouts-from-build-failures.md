---
title: "Distinguish build timeouts from build failures"
date: 2026-08-09
category: build-errors
component: tooling
tags: [timeouts, build, verification]
---

The full build exceeded the shell's 120-second timeout after reaching a late validation phase, but passed when rerun with a larger timeout and took about 157 seconds. A tool timeout is not evidence of a build defect. When logs show continued progress and no compiler failure, retry once with a timeout appropriate to the observed build duration before reporting failure.
