---
title: "Treat authority mismatches as precondition failures, not TDD RED"
date: 2026-08-23
category: patterns
component: tooling
tags: [immutable-inputs, tdd, preconditions, revision-gate]
---

Before implementation, verify every immutable authority condition independently: the approved repository revision, scoped worktree cleanliness, and expected artifact hashes. In this task, all four files were clean and their SHA-256 hashes matched, but the checkout revision differed from the approved revision. The process correctly stopped without creating RED evidence or modifying tests and production code. Reuse this distinction: a failed environmental or provenance gate is a blocker, not a legitimate failing test for the RED phase.
