---
title: "Acceptance evidence must include preserved untracked implementation"
date: 2026-07-28
category: tooling
component: ci-cd
tags: [acceptance, evidence, git, untracked-files, external-contracts]
file_type: rules
---

# Acceptance evidence must include preserved untracked implementation

An acceptance reviewer can correctly report a feature as missing even when the current worktree contains it if the supplied task-scoped diff omits untracked files. Before completion, inspect both `git status --short` and the actual acceptance payload; plain `git diff` does not include a new plugin tree, new tests, docs, or checkpoints.

For a repaired task, preserve valid prior work but explicitly inventory every new file in the checkpoint and ensure the task evidence collector receives those files. Do not treat a completion narrative or passing-test summary as a substitute for source material.

Contract hashes have a separate limit: hashes stored beside self-authored fixtures prove integrity only. They do not prove that an external authority accepted the protocol. External KM integration must retain owner-identifiable provenance and complete request, response, conflict, lease, CAS, and recovery semantics before implementation claims interoperability.
