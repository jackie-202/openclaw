---
title: "Preserve upstream compatibility while removing fork-only composition"
date: 2026-07-19
category: architecture
component: backend
tags: [openclaw, fork, upstream-compatibility, config, model-selection]
file_type: rules
---

# Preserve upstream compatibility while removing fork-only composition

When a fork adds a new canonical config source by wrapping an upstream resolver, removing the old source from fork behavior does not imply deleting the upstream config key.

Before planning the deletion, inspect both `git log upstream/main -- <files>` and `git show upstream/main:<file>` for the schema, resolver, callers, tests, and docs. If upstream owns the old key, retain its schema and standalone resolver, then remove only the fork-added composition point.

For the OpenClaw channel runtime profile case, the bounded shape is:

- Keep upstream `channels.modelByChannel` schema, docs, doctor/update handling, and `resolveChannelModelOverride()` compatibility.
- Make fork-only `resolveChannelRuntimeProfile()` read only `channels.runtimeByChannel`.
- Keep fork execution callers on the runtime-profile API instead of filtering legacy values at every caller.
- Classify remaining grep matches in final proof rather than treating zero matches as the goal.

This preserves upstream behavior, shrinks fork delta, and makes the fork precedence explicit without duplicating channel target matching.
