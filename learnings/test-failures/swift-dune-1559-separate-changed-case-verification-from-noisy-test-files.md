---
title: "Separate changed-case verification from noisy test files"
date: 2026-07-24
category: test-failures
component: tooling
tags: [vitest, test-scoping, regression, pre-existing-failures]
---

Running the complete focused file set exposed two unrelated failures in `dispatch-from-config.test.ts`, while the two cases changed by the task passed when selected by test name and the remaining focused suites passed independently. When a large shared test file contains unrelated failures, preserve the broad failure output, rerun the changed cases with an exact name filter, and run unaffected suites separately. This establishes task-specific confidence without incorrectly claiming the whole file is green or modifying unrelated behavior.