---
title: "Bind acceptance evidence to the actual task candidate"
date: 2026-08-31
category: tooling
component: ci-cd
tags: [acceptance, test-gate, provenance, dirty-worktree, plugin-sdk]
file_type: checklist
---

# Attribute shared-worktree hunks before acceptance repair

When an acceptance monitor receives a broad dirty-worktree diff, it can attribute older behavior changes to a later task. A passing rerun does not repair that provenance failure.

Before changing code, identify prior ownership from dated plans, proofs, and final notes. Snapshot hashes for the disputed files before and after follow-up verification, keep those files unchanged, and record a bounded task evidence artifact that separates inherited hunks from the current repair.

For evidence-only TDD follow-ups, retain the genuine parent RED and run the identical command for fresh GREEN. Canonical Test Gate evidence still requires a provider-owned durable run reference; local success cannot replace it.

# Bind acceptance evidence to the actual task candidate

In a shared dirty worktree, passing commands alone do not prove which changes they exercised. A task-scoped acceptance repair should record an immutable base revision, a deterministic digest over the exact owned source/test/contract files, and one complete invocation of every required command. Partial shards plus retries may be useful diagnostics, but rerun the original aggregate command with a realistic timeout before calling the gate green.

For an unchanged-behavior goal, pair runtime tests with a hunk-level ownership comparison. Restore unrelated documentation rewrites byte-for-byte from the baseline, identify exactly where the additive field enters the request, and show that routing, event identity, source/target authority, idempotency, and replay inputs were not modified by the task-owned hunks. This prevents concurrent changes elsewhere in the worktree from being incorrectly attributed to a narrow acceptance fix.

Generated Plugin SDK declarations can also make package-boundary typechecks look like source-contract failures. When extension tsconfig paths resolve through `dist/plugin-sdk/*.d.ts`, regenerate declarations explicitly before typechecking; a cached general build may leave stale declarations even when the source type is correct.
