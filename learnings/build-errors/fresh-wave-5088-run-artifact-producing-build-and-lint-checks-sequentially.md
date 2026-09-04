---
title: "Run artifact-producing build and lint checks sequentially"
date: 2026-08-26
category: build-errors
component: tooling
tags: [build, lint, generated-artifacts, timeout, race-condition]
---

The initial build exceeded the shell's 120-second timeout while generating postbuild artifacts. A lint run then failed on unrelated `qa-channel` declarations and missing generated plugin SDK types, indicating it observed incomplete build artifacts rather than a defect in the files under verification. Retrying `pnpm build` alone with a longer timeout completed in about 136 seconds, and the same focused lint command subsequently passed with no output. Give full builds sufficient timeout and run checks that consume generated declarations only after the build completes; otherwise transient artifact races can look like source-level lint failures.
