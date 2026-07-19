---
title: "Classify legacy references before deleting them"
date: 2026-07-19
category: patterns
component: tooling
tags: [code-search, compatibility, migration, scope-control]
---

A repository-wide search found many remaining `modelByChannel` references after the runtime-path change. Most belonged to upstream-owned schema, migration, doctor, update, pricing, and compatibility code rather than the fork-specific behavior being removed.

The safe approach was to classify each production reference by ownership and purpose, then verify that no references remained in `src/auto-reply/reply/` while retaining legitimate compatibility surfaces elsewhere. Focused tests, a full build, formatting checks, and autoreview confirmed the narrower change.

When removing deprecated behavior from a fork, do not treat search hits as an automatic deletion list. Define the forbidden execution path, preserve independent compatibility consumers, and use a final scoped search to prove that only the intended path stopped reading the legacy setting.
