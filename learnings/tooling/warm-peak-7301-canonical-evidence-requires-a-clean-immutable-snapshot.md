---
title: "Canonical evidence requires a clean immutable snapshot"
date: 2026-08-24
category: tooling
component: ci-cd
tags: [canonical-gate, clean-checkout, evidence-integrity, dirty-worktree]
---

The canonical deliberation gate refused to run because the shared checkout contained extensive tracked and untracked changes. Bypassing the preflight or emitting a `clean: true` ledger against the dirty checkout would have created false evidence.

Reuse this pattern: canonical acceptance evidence should be generated only from a clean, immutable snapshot, preferably in an isolated checkout. If the implementation exists only as uncommitted shared-worktree state, stop after focused verification and obtain authorization to create a snapshot rather than weakening the gate or reconstructing its evidence.
