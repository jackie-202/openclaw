---
title: "Acceptance retries need inspectable parent diffs"
date: 2026-07-24
category: tooling
component: ci-cd
tags: [acceptance, evidence, diff, tdd]
file_type: rules
---

# Acceptance retries need inspectable parent diffs

When acceptance rejects a completed task because its task-scoped diff omitted implementation files, test totals and checkpoint claims cannot repair the gap. The retry must expose the preserved source and focused-test hunks themselves.

For evidence-only retries where the implementation predates the retry task:

1. Inventory the exact preserved paths and exclude unrelated worktree changes.
2. Generate a bounded raw diff artifact against the recorded base commit.
3. Validate that artifact against the current worktree and record a checksum.
4. Link the genuine historical RED rather than fabricating a new failure.
5. Capture fresh GREEN under the retry task ID.
6. Map each acceptance requirement to visible hunks in an evidence summary.

This matters because automatically collected retry diffs may include only files changed during the retry. Without an explicit parent-diff artifact, unchanged preserved implementation remains invisible to semantic acceptance even though it is present in the worktree and its tests pass.
