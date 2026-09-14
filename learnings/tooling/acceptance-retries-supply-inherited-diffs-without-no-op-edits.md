---
title: "Acceptance retry: inherited diffs without no-op source edits"
date: 2026-09-09
category: tooling
component: ci-cd
tags: [acceptance, provenance, task-lineage, tdd]
file_type: rules
---

# Acceptance retries should supply inherited diffs without no-op source edits

When acceptance rejects a follow-up because its task-scoped bundle omitted production changes inherited from a parent task, first audit the preserved worktree against the behavior contract. If runtime behavior is already correct, do not rewrite production code or create a semantically neutral edit merely to make owner files appear changed.

Instead, make the retry self-contained with exact, inspectable provenance: identify the parent/base, include the preserved owner diff through task-lineage tooling or a dedicated evidence artifact, inventory every file in the checkpoint, and pair the inherited genuine RED with fresh GREEN. Add production changes only when strengthened boundary assertions expose a real defect.

This distinction prevents evidence plumbing from causing unnecessary runtime churn while still answering an acceptance result that explicitly rejected narrative-only claims.
