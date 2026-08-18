---
title: "Acceptance fixes must prove preserved implementation in task-scoped artifacts"
date: 2026-08-13
category: tooling
component: ci-cd
tags: [acceptance, tdd, evidence, checkpoints, deliberation]
file_type: checklist
---

# Acceptance fixes must prove preserved implementation in task-scoped artifacts

When an acceptance follow-up inherits correct production changes from a parent task, do not remove or rewrite those changes just to manufacture a fresh RED. Link the parent's genuine pre-implementation RED and run a fresh GREEN against the preserved worktree.

For lifecycle wiring, final evidence must identify both ownership layers:

- The plugin entrypoint is the production owner that constructs dependencies and registers exactly one service.
- The service helper owns scheduling, non-overlap, timer cleanup, and stop-time draining.

Record exact focused tests, broader owner-suite tests, typecheck, build, and diff gates in a task-scoped evidence file. A passing implementation can still fail acceptance when those artifacts only summarize results or omit the production entrypoint.

Repository test wrappers may wait behind the shared heavy-check lock. A lock-wait timeout is not a test failure; retry without killing the unrelated owner process and record the eventual executed test result.
