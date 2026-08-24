---
title: "Acceptance GREEN must reproduce the historical RED command"
date: 2026-08-21
category: tooling
component: tooling
tags: [tdd, acceptance, evidence, contract-tests]
---

For an evidence-only acceptance follow-up, a passing neighboring suite is not sufficient proof. The task preserved the genuine historical RED provenance and reran the exact original command, including the test path, cache-path environment variable, and worker setting. The unchanged command then passed all 9 contract tests.

Reuse this pattern by recording the historical RED command verbatim before validation and using that identical command for GREEN. If it passes, avoid unnecessary production changes; the missing deliverable may be evidence rather than code.
