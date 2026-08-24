---
title: "Bound autoreview when a dirty worktree exceeds the bundle limit"
date: 2026-08-23
category: tooling
component: tooling
tags: [autoreview, codex, dirty-worktree, review-bundles]
file_type: checklist
---

# Bound autoreview when a dirty worktree exceeds the review bundle limit

In a heavily shared OpenClaw checkout, `autoreview --mode local` can collect unrelated untracked task artifacts until the Codex request exceeds its input limit. A prompt that says to ignore unrelated files does not help because bundle construction happens before the reviewer sees the prompt.

For a narrow uncommitted repair, use `--mode branch --base HEAD` to keep the generated diff bundle empty, then explicitly instruct the read-only reviewer to inspect the current contents and current diff of the named task files. This preserves a real code review through repository tools without copying files, staging changes, creating a temporary commit, or including concurrent work.

Always confirm the helper reports a small bundle and that its summary names the intended behavior. This approach is appropriate only for tightly enumerated files; broader changes still require a representative branch or local diff bundle.
