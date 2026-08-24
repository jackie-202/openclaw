---
title: Ship and verify OpenClaw Deliberation doctor migration package
---

# Ship and verify OpenClaw Deliberation doctor migration package

## Objective

Turn the existing doctor migration implementation into tracked, built, installed-package behavior and reconcile the singleton smoke with the real five-hook Deliberation contract.

Work only in `/Users/michal/Projects/openclaw-fork`. Do not edit KM. Use the concrete package gaps from `plans/investigations/warm-vale-4978_audit-warm-cove-4137-remediation-completeness-and-rollout-readiness.md`; do not reimplement migration semantics from scratch when the audited orphan sidecar is correct.

## Deliverable

1. Put the doctor contract API/normalizer/tests into reachable tracked source history and build inventory.
2. Ensure emitted package artifacts contain the required sidecar and that installed CLI doctor loads it.
3. Prove legacy config writeback is canonical, bounded, and idempotent; malformed or ambiguous configuration fails closed.
4. Update singleton/build smoke expectations to the actual five-hook contract. Do not reduce runtime hooks to satisfy a stale four-hook test.
5. Keep package behavior aligned with the accepted contract mirror from the preceding task.

## Executable acceptance

Materialize real named leaf:

- `OR-22 doctor-package-writeback-built-five-hook-runtime`

It must cover source registration, emitted package inventory, installed-package execution, writeback/idempotence, canonical startup acceptance, and five-hook singleton behavior.

Run at minimum:

- focused doctor/config tests;
- `pnpm build`;
- an emitted-file/build-entry probe;
- `test/scripts/deliberation-doctor-package.e2e.test.ts` through its canonical runner;
- `pnpm test:build:singleton`;
- scoped lint/typecheck/format checks for touched files.

Do not claim package proof from a source build alone. The installed/package E2E must execute emitted artifacts from an isolated package context.

## Completion evidence

Final note must list tracked source and emitted package files, named OR-22 result, exact commands/results, canonical writeback/idempotence evidence, and five-hook runtime evidence.

No KM edits, deployment, linking into the live installation, Gateway restart, live config mutation, production spool access, provider send, or pilot activation.
