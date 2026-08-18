---
title: "Acceptance evidence must include preserved untracked implementations"
date: 2026-08-17
category: tooling
component: tooling
tags: [acceptance, untracked-files, tdd, autoreview]
file_type: rules
---

# Acceptance evidence must include preserved untracked implementations

An acceptance retry can fail even when focused tests pass if the implementation file remains untracked and the task-scoped evidence contains only checkpoints or test output. Passing output proves execution, but reviewers still need the concrete assertions to verify the claimed semantics.

For preserved work, inspect `git status --short` after GREEN and explicitly confirm the required implementation file appears in the task deliverables. Keep the complete file in scope, map each acceptance fact to concrete assertions, and use historical RED provenance rather than manufacturing a new failure against existing code.

In a heavily dirty checkout, bound autoreview with a small commit carrier, the task checkpoint as a dataset, and a prompt naming only the current-worktree files the reviewer must inspect. This avoids bundle limits without substituting checkpoint prose for source review.
