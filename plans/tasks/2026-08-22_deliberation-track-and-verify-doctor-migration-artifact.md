---
title: RED-GREEN: ship and verify the doctor migration artifact
type: implementation
---

# RED-GREEN: ship and verify the doctor migration artifact

## Context

The rollout audit `warm-cove-4137` found that the `doctor --fix` migration implementation was not present in the tracked build artifact. The proposal requires a bounded migration from legacy `sources[]`/global `deliveryTarget` to one canonical `pipelines[]` authority with no ambiguous dual-authority window.

## Scope

Work in `openclaw-fork`. Repair tracked source/build ownership and migration verification only. Do not mutate Michal's live configuration and do not restart or deploy the Gateway.

## RED-GREEN requirement

First prove with a temporary config and the repository's actual build/package path that current `openclaw doctor --fix` cannot deliver the intended tracked migration or canonical startup. Capture authentic RED output.

Then ensure the migration source (including the intended doctor contract API ownership) is tracked, built, packaged, and invoked by the real CLI.

## Acceptance criteria

- A temporary legacy config migrates deterministically to canonical `pipelines[]`.
- Mixed legacy/new authority is rejected rather than guessed.
- Re-running `doctor --fix` is idempotent.
- Canonical startup/config validation succeeds on the migrated temporary config.
- Invalid duplicate routes and impossible thread inheritance remain rejected.
- Tests execute through the built/package CLI, not only imported source helpers.
- No live config is read or modified by tests.
- Build, focused doctor/config suites, packaging check, lint, and canonical Test Gate pass.
