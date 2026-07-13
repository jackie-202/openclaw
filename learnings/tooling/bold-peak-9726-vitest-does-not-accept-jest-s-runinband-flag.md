---
title: "Vitest does not accept Jest's runInBand flag"
date: 2026-07-13
category: tooling
component: general
tags: [vitest, focused-tests, cli]
---

A focused test invocation failed before running tests because `--runInBand` is a Jest option and Vitest rejected it as unknown. Removing the flag and using Vitest's `-t` filter with the repository test wrapper produced the intended isolated run.

For this test stack, use `pnpm test <file> -- -t "<name>" --reporter=verbose`. Avoid carrying Jest-specific flags into Vitest commands.
