---
title: "Checkpoint Markdown must satisfy repository lint"
date: 2026-08-02
category: tooling
component: ci-cd
tags: [markdownlint, checkpoints, documentation]
---

A generated checkpoint failed documentation lint because headings and lists lacked surrounding blank lines (`MD022` and `MD032`). Evidence and checkpoint artifacts are covered by the repository's Markdown rules even when they are not production documentation. Format these files with blank lines around every heading and list from the start, then run the canonical `pnpm lint:docs` command. Note that this command expands repository documentation globs and linted 667 files despite receiving two explicit paths.
