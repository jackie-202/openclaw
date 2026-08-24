---
title: Close deliberation owner-runtime convergence gates before rollout
type: implementation
---

# Close deliberation owner-runtime convergence gates before rollout

## Context

The read-only rollout audit `warm-cove-4137` concluded NOT SAFE. After the preceding remediation slices land, this task closes integration coverage and quality gates. The audit reported only 12 of 23 required owner-runtime scenarios covered and three scoped lint failures.

## Dependency

Run after the exclusive-ownership, one-event/uncertain-delivery, and doctor-migration remediation tasks in the same sequential batch. Inspect their final artifacts rather than duplicating their implementation.

## Scope

Work in `openclaw-fork`. Add missing integration coverage, reconcile fixtures/contracts with the actual owner runtime, resolve in-scope lint findings, and produce rollout-readiness evidence. Do not change live configuration, activate Slack, deploy, or restart the Gateway.

## Requirements

- Enumerate the authoritative 23-scenario owner-runtime matrix from the proposal and `warm-cove-4137`; map every scenario to a concrete automated test and result.
- Cover Discord→source, Slack→source, Slack→Discord, explicit same-provider root/thread targets, root/child history, duplicate/stale/contradictory evidence, disabled/KM unavailable/intake failure, delivery unknown/receipt mismatch, migration, and rollback/fail-closed behavior.
- Ensure fixtures exercise the real owner/runtime boundaries rather than helper-only simulations.
- Resolve the three scoped lint findings without broad unrelated cleanup.
- Synchronize contract/provenance fixtures where required; no side may recompute pipeline ID or effective target late.
- Run the complete relevant deliberation/plugin integration suite, build, scoped lint/format, and canonical Test Gate.

## Acceptance criteria

- All 23 owner-runtime scenarios have passing, named automated evidence.
- No scoped lint errors remain.
- Full relevant tests and build pass.
- A rollout-readiness report explicitly distinguishes implementation readiness from live activation approval.
- Any remaining blocker produces `NOT READY` with exact evidence; do not self-certify live rollout.
