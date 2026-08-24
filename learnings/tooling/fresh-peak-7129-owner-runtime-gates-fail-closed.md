---
title: "Keep convergence gates separate from supporting test success"
date: 2026-08-23
category: tooling
component: ci-cd
tags: [deliberation, rollout, provenance, integration-tests, packaging]
file_type: checklist
---

# Keep convergence gates separate from supporting test success

Cross-repository rollout gates must not promote helper, mock, or registered-plugin tests into owner-runtime evidence. For Deliberation, local channel and plugin tests can prove routing and silence behavior, but only the approved KM listener with isolated SQLite state can prove singular records, restart-safe unknown delivery, and durable retry authorization.

Before adding matrix coverage, inspect predecessor checkpoints and require a readable immutable owner checkout. An unset owner root, an untracked package artifact, or a provenance mismatch is a setup blocker, not valid behavioral RED. The readiness report should map every scenario anyway, identify the supporting local test, mark the missing owner boundary explicitly, and conclude `NOT READY` rather than filling the gap with simulations.

A successful build is also insufficient package evidence when build inventory is derived from tracked files. Verify the expected built artifact exists before running or claiming installed-package proof.

In a heavily dirty sequential-batch worktree, broad changed-lane and autoreview tools may include unrelated predecessor artifacts. Record the exact infrastructure or bundle-size blocker and use a bounded read-only review for task-owned files, without treating unrelated findings as current-task defects.
