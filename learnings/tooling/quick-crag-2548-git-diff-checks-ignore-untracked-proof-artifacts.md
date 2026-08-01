---
title: "Git diff checks ignore untracked proof artifacts"
date: 2026-07-27
category: tooling
component: tooling
tags: [git, untracked-files, verification, artifacts]
---

The checkpoint and proof files were untracked, so scoped `git diff --check` and `git diff --numstat` produced no output. This does not validate their contents or demonstrate a clean diff; ordinary `git diff` ignores untracked files. When verification artifacts are newly created, inspect them directly or stage them in an appropriate isolated workflow before relying on diff-based checks.
