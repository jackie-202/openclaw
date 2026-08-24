---
title: "Plan evidence completion around the immutable checkout boundary"
date: 2026-08-24
category: tooling
component: ci-cd
tags: [acceptance, immutable-evidence, clean-checkout, planning]
file_type: rules
---

# Plan evidence completion around the immutable checkout boundary

When an acceptance implementation is complete but its canonical generator requires a clean checkout, the follow-up plan must separate three states: the dirty shared workspace, an explicitly authorized isolated snapshot commit, and the generated evidence copied back byte-for-byte.

Do not weaken clean preflight or rerun neighboring tests as a substitute. Require one canonical run in the isolated checkout, validate the artifact and notes there against their embedded root/revision, then compare SHA-256 values after transfer. Treat authorization for the local snapshot commit as an explicit dependency rather than quietly committing preserved user work.

If the canonical run exposes a real defect, repair only that defect with the genuine historical RED linked and fresh matching GREEN. Otherwise, make no production or test changes.
