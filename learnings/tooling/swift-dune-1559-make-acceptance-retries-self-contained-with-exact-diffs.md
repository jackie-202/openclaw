---
title: "Make acceptance retries self-contained with exact diffs"
date: 2026-07-24
category: tooling
component: ci-cd
tags: [acceptance, artifacts, diff, checksum]
---

The parent acceptance evidence omitted the actual source diff and lost command outcomes, making review difficult. The retry packaged the exact 13-path source-and-test diff and verified it using reverse-apply, path inventory, whitespace checks, line statistics, and a SHA-256 checksum. Reuse this approach when acceptance is performed against a dirty worktree or incomplete parent evidence: provide a bounded, inspectable artifact whose relationship to the current tree can be independently verified.