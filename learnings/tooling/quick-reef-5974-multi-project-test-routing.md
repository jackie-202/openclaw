---
title: "Víceprojektové testovací příkazy mohou zahrnout nesouvisející testy"
date: 2026-07-24
category: tooling
component: ci-cd
tags: [openclaw, vitest, test-routing, tdd, verification]
file_type: rules
---

# Multi-project focused commands can include unrelated tests

OpenClaw's `pnpm test` wrapper routes file lists to project shards. A command containing files from several projects may execute the full selected project file rather than only the newly added test case, so unrelated pre-existing failures can block a red-green evidence command even when every changed-path assertion passes in isolation.

For cross-project changes:

1. Keep the red-green command explicit and inspect which project shards the wrapper actually starts.
2. Rerun each changed test file, or the exact new test with `-t`, to distinguish task regressions from unrelated failures in the same large file.
3. Record unrelated full-file failures separately instead of changing their assertions as part of the feature.
4. Use the same original command for the required GREEN evidence, and retain the individual focused runs as changed-path proof.

This is especially relevant for large auto-reply suites, where one targeted model-routing test can share a file with independent channel-hook tests.
