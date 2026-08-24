---
title: "Reporter totals are not acceptance matrices"
date: 2026-08-23
category: test-failures
component: e2e
tags: [deliberation, owner-runtime, test-matrix, rollout-readiness]
file_type: rules
---

# Reporter totals are not acceptance matrices

The historical Deliberation owner-runtime result reported 23 tests, but the Node test runner counted 20 leaf behaviors and three aggregate parent tests. Treating `12/23` as a 23-scenario product matrix hid missing Slack routes, channel-owner failure paths, uncertainty recovery, migration, and rollback coverage.

For convergence gates, define stable leaf scenario IDs from the proposal and audit first. Map each ID to the executable boundary that owns the behavior: authenticated channel-owner tests for silence and rollback, the real owner listener plus isolated SQLite for durable lifecycle behavior, and the installed package CLI for doctor migration. Keep protocol negatives and isolation guards as supporting tests, but do not let aggregate suites inflate matrix completeness.

The readiness report should record exact test names/results for every leaf and maintain separate verdicts for repository implementation readiness and live activation approval.
