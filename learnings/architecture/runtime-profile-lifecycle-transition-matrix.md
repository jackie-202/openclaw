---
title: "Isolate runtime-profile lifecycle regressions with a transition matrix"
date: 2026-07-22
category: architecture
component: backend
tags: [openclaw, runtime-profile, sessions, queue, compaction, tdd]
file_type: rules
---

# Isolate runtime-profile lifecycle regressions with a transition matrix

When a commit adds several channel-profile fields to shared run construction, a commit boundary alone does not identify the causal field. Compare the same durable turn under no profile, model-only profile, and one added execution field at a time across existing, fresh, reset, queued, and overflow paths.

Require every accepted turn to reach one observable terminal state: completed, explicitly retried, or explicitly failed. Queue lifecycle completion callbacks alone are not proof that the turn executed, because reset cleanup can clear queued work while invoking completion bookkeeping.

Keep later contracts outside the rollback ledger. In this case stale auto-fallback invalidation and removal of legacy `channels.modelByChannel` plumbing landed after the suspected commit and must remain intact. If the unprofiled control fails identically, stop and correct the regression boundary instead of modifying runtime-profile propagation.
