---
title: "Acceptance repairs need a persisted gate result"
date: 2026-07-13
category: tooling
component: ci-cd
tags: [acceptance, tdd, evidence, checkpoints]
file_type: rules
---

# Acceptance repairs need a persisted gate result

A valid RED/GREEN proof does not itself satisfy a task whose primary goal requires `acceptance-checks`. The acceptance CLI must run through `list`, `select`, `record`, and `finalize`, and its finalized state should be persisted beside the checkpoint so the result is independently inspectable.

For evidence-only follow-ups, select only checks that actually apply. Explain why architecture or security checks are skipped when no corresponding runtime surface changed, rather than manufacturing evidence for irrelevant checks.

When a previous implementation already exists, link its genuine historical RED and capture a fresh GREEN with the identical test command. Never rerun or fabricate RED merely to make the follow-up artifact self-contained.

If interactive command capture omits the test summary despite a successful exit, rerun the same command with output redirected to a workspace-approved temporary log and preserve the complete shard and pass counts in the proof.
