---
title: "Attribute shared-worktree hunks before acceptance repair"
date: 2026-08-31
category: tooling
component: ci-cd
tags: [acceptance, task-provenance, dirty-worktree, tdd, test-gate]
file_type: rules
---

# Attribute shared-worktree hunks before acceptance repair

When an acceptance monitor receives a broad dirty-worktree diff, it can attribute older behavior changes to a later task. A passing rerun does not repair that provenance failure.

Before changing code, identify prior ownership from dated plans, proofs, and final notes. Snapshot hashes for the disputed files before and after follow-up verification, keep those files unchanged, and record a bounded task evidence artifact that separates inherited hunks from the current repair.

For evidence-only TDD follow-ups, retain the genuine parent RED and run the identical command for fresh GREEN. Canonical Test Gate evidence still requires a provider-owned durable run reference; local success cannot replace it.
