---
title: "Remove unowned semantic hunks from acceptance candidates"
date: 2026-08-31
category: tooling
component: ci-cd
tags: [acceptance, provenance, documentation, dirty-worktree]
file_type: checklist
---

# Remove unowned semantic hunks from acceptance candidates

When an acceptance finding identifies an unrelated behavior rewrite in a shared dirty worktree, additional prose claiming that routing stayed unchanged does not repair the candidate. The disputed hunk itself must disappear from the task-scoped diff.

For documentation-only provenance repairs:

1. Compare the disputed paragraph with `HEAD` and the canonical public reference.
2. Restore only that paragraph, leaving concurrent runtime and documentation work untouched.
3. Inspect the resulting file diff and require the disputed hunk to be absent.
4. Run focused behavior tests to show the repair did not modify source-target, identity, replay, or delivery code.

Repository-wide lint can expose unrelated failures in untouched files. Record those separately and use the linter's no-globs mode to prove the repaired file itself is clean.
