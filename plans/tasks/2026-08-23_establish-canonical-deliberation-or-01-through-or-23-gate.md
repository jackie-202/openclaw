---
title: Establish canonical Deliberation OR-01 through OR-23 gate
---

# Establish canonical Deliberation OR-01 through OR-23 gate

Reference: `docs/proposals/proposal-20260820-203458-161e2c_per-source-deliberation-pipelines-with-source-default-delivery.md`, section `Corrective Completion Plan`. Implement only the executable Definition-of-Done slice.

## Goal

Create and run one caller-owned gate that proves every fixed Deliberation acceptance scenario `OR-01` through `OR-23`. This task follows successful owner convergence; it must compose real existing boundaries rather than hide product defects with synthetic evidence.

Work only in `/Users/michal/Projects/openclaw-fork`. KM is read-only at `/Users/michal/.openclaw/workspace/km-system`. Use artifact-hash authority from the preceding task; record moving KM HEAD only as provenance and never reject unrelated HEAD movement.

## Required gate

1. One canonical command emits exactly one result for each `OR-01` through `OR-23`.
2. Every row maps to executable test selectors and fresh immutable command evidence.
3. Missing, skipped, duplicated, contradictory, stale, aggregate-only, or synthetic rows fail closed.
4. Compose:
   - OR-01..OR-06: configured-source exclusive ownership and no prohibited side effects;
   - OR-07..OR-21: singular intake, immutable lifecycle, invocation/completion ambiguity and recovery behavior;
   - OR-22: doctor package/writeback/emitted artifact and five-hook runtime;
   - OR-23: integrity of all preceding leaves plus contract provenance, build/package E2E, focused suites, and scoped static checks.
5. Verify the four authoritative KM artifact hashes supplied by the previous task. Current KM HEAD is printed for traceability only.
6. Use random loopback port, temporary credentials and SQLite, no-live-path guard, and deterministic cleanup.
7. Readiness accounting may consume only this canonical result. It must not claim deployment, live provider authenticity, pilot traffic, or rollout approval.

## Acceptance

The canonical command must exit zero with **23/23 named leaves Green**.

Also prove the gate itself fails nonzero when fed a missing, duplicate, stale or malformed result. Preserve bounded output and a complete 23-row artifact.

Do not add new product semantics in this task. If a real existing requirement is still Red, report that precise blocker instead of weakening the assertion or creating a fake Green.

## Completion evidence

Final note must include:

- canonical command;
- current OpenClaw revision and non-blocking KM HEAD;
- accepted KM artifact hashes;
- complete OR-01..OR-23 result artifact;
- negative fail-closed gate characterization;
- build/package/provenance and focused test results.

No KM edits, deployment, live installation linking, Gateway restart, live configuration, production spool, provider send, or pilot activation.
