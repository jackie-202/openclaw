---
title: "Remove fork features against both their parent and current upstream"
date: 2026-07-19
category: architecture
component: tooling
tags: [fork-removal, git-history, upstream-parity, tdd]
file_type: rules
---

# Remove fork features against both their parent and current upstream

When a fork-only feature cannot be cleanly reverted because later commits touched the same module, use three references with distinct roles:

1. `git show <feature-commit>` is the authoritative deletion ledger.
2. `git show <feature-commit>^:<path>` recovers the exact pre-feature composition that later edits must be rebased onto.
3. `git diff upstream/main -- <path>` proves the removed seam is upstream-equivalent, but must not be used as a whole-file replacement when upstream has independently redesigned the subsystem.

Inspect `git log <feature-commit>..HEAD -- <paths>` before editing. Preserve later unrelated changes explicitly, then classify every remaining upstream diff in the final note. For example, a later diagnostic-union fix can remain while a batched writer is removed, and an upstream SQLite migration can explain why the fork's restored JSONL window implementation is intentionally not byte-identical.

For deletion TDD, first remove feature-only test setup that masks the old behavior. An existing upstream-owned assertion can then become RED against the still-present feature and GREEN after production removal, avoiding a new test that only asserts symbol absence.
