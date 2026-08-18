---
title: Audit cron failure marker compatibility
type: investigation
---
# Audit cron failure marker compatibility

Compare fork commit `dc43c20df50c` with current upstream command runner and cron delivery behavior at base `4b85d834ed1586062f31bded2f358fc5192d1674`.

## Required analysis
Cover non-zero exits, signals/timeouts, stderr/stdout precedence, empty/mixed/oversized output, truncation, diagnostics, user-visible result, task state, retries and secret redaction. Inventory current fixtures/tests and identify gaps.

## Deliverable
Markdown report under `plans/` with the required failure matrix and exactly one proposal verdict plus confidence and evidence.

## Scope boundary
OpenClaw repository/proposal only. No code changes, test runs, live data, external repositories or Git lifecycle operations.
