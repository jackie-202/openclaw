---
title: "Separate pinned revisions from retained worktree evidence"
date: 2026-08-09
category: tooling
component: tooling
tags: [compatibility-audit, git-history, plugins, inbound-claim]
file_type: rules
---

# Separate pinned revisions from retained worktree evidence

When planning a compatibility audit in a dirty or pre-ported worktree, build separate evidence columns for the historical fork revision, the pinned upstream revision, and retained worktree consumers.

Use Git object reads for the first two columns. Treat current worktree code only as consumer/adaptation evidence. A similarly named API or a richer payload does not establish equivalent routing semantics; compare invocation eligibility, ordering, terminal outcomes, error isolation, and fallback before choosing a verdict.

For `inbound_claim`, this distinction exposed the central audit question: the fork added a global broadcast, while pinned upstream explicitly limited dispatch to the plugin owning a core-managed conversation binding. Unbound consumers therefore require their own activation and adaptation row instead of being inferred compatible from the shared hook runner.
