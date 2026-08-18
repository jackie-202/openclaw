---
title: Audit channel runtime and model authority compatibility
type: investigation
---
# Audit channel runtime and model authority compatibility

Analyze the final fork invariant represented by `9c09c259528`, `f7d039a3575`, `0529559822f1`, `435059f7d634`, and `0b4e3efe7331` against current upstream `modelByChannel` behavior at base `4b85d834ed1586062f31bded2f358fc5192d1674`.

## Required analysis
Cover persisted config, existing and fresh sessions, explicit override, channel default changes, stale-state repair, migrations, unavailable providers/models, status output, and why `runtimeByChannel` disappeared. Determine whether the current upstream contract preserves the final fork intent without reviving obsolete state.

## Deliverable
Markdown report under `plans/` with scenario table, migration assessment for the known rollback config shape using repository evidence only, and exactly one proposal verdict with confidence and citations.

## Scope boundary
Do not inspect actual live config; use schemas, migrations, fixtures and proposal evidence. No code edits, tests, external repos or Git lifecycle operations.
