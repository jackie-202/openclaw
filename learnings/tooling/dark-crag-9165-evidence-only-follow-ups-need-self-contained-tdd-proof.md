---
title: "Evidence-only follow-ups need self-contained TDD proof"
date: 2026-08-09
category: tooling
component: tooling
tags: [tdd, acceptance, evidence, checkpoints]
---

A follow-up that verifies an already-completed test-only change may have no honest way to reproduce RED without reverting valid work. Preserve integrity by creating a run-scoped proof artifact that explicitly cites and quotes the genuine historical RED from the parent task, then append fresh GREEN output from the current run. Do not fabricate a new failure merely to satisfy the artifact format.
