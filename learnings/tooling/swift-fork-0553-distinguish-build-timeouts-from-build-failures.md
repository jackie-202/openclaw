---
title: "Distinguish build timeouts from build failures"
date: 2026-08-13
category: tooling
component: tooling
tags: [build, timeouts, verification, tsdown]
---

The full build was first terminated by the shell's 120-second timeout while `tsdown` was still running and had emitted no compiler error. Rerunning with a larger timeout completed successfully; `tsdown` alone took about 81 seconds. Treat tool termination as inconclusive when the build reports ongoing progress and no actual failure. Retry known long-running build gates with an appropriate timeout before diagnosing code.