---
title: "Separate scoped verification from unrelated broad-gate failures"
date: 2026-08-01
category: tooling
component: ci-cd
tags: [lint, dirty-worktree, verification, autoreview]
---

The broad extension lint gate failed while preparing an unrelated Slack package boundary because of a missing `primeChannelOutboundSendMock` export. The changed Deliberation files still passed scoped lint, formatting, typechecks, tests, and the full build. In a dirty or multi-component worktree, preserve the broad failure as an explicit blocker but also run exact-file checks to establish whether the task patch is clean. Scope automated review to the exact changed files so pre-existing diffs are not misclassified as task findings.
