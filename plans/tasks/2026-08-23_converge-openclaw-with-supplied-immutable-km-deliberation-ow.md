---
title: Converge OpenClaw with supplied immutable KM Deliberation owner bundle
---

# Converge OpenClaw with supplied immutable KM Deliberation owner bundle

## Objective

Complete the product and executable cross-repository convergence that `bright-cove-6185`, `dark-mist-2854`, and `bold-wave-0608` could not start because their immutable KM authority input was not supplied. This task supplies that authority explicitly; do not stop to ask the operator to rediscover it.

Work only in `/Users/michal/Projects/openclaw-fork`. You may read the KM authority checkout below and run its tests against isolated temporary state. Do not edit KM, its Git metadata, its live service, or production spool state.

## Supplied immutable KM authority bundle

The approved owner checkout is:

- repository root: `/Users/michal/.openclaw`
- KM root to pass to OpenClaw: `/Users/michal/.openclaw/workspace/km-system`
- exact Git revision: `79bbc5c0426bc7be901d5199da11b21213bfa008`
- contract SHA-256: `5c63424b32a8db8370a1212ff7eb3878695afbb5d0fec3721fbab326908de44b`
- fixtures SHA-256: `f26ca9afb804664cdcc03947262001d1d8441eab6d5ad9d92bb8533ae3c916b4`
- runtime wire SHA-256: `a0e42e4fe54eedab6f9955e77f439a4e69c9614a60560ca46532ce0de9dbb528`
- spool contracts SHA-256: `47587e405d3e6b7f433eb7d450bd02969546860ff0d6822ad7bea9ff2478a0ca`

These four paths are tracked and clean at that revision. Before implementation, verify them with `git -C /Users/michal/.openclaw rev-parse HEAD`, `git -C /Users/michal/.openclaw status --short -- <the four workspace/km-system paths>`, and `shasum -a 256`. Fail closed only if the exact revision/hash/path checks disagree.

The approved read permissions are limited to owner contract/runtime/test material under `/Users/michal/.openclaw/workspace/km-system/{contracts,lib,tests,docs}` plus task evidence needed to run the gate. Write permission remains only inside the OpenClaw task workspace. All listener and SQLite execution must use random loopback ports, temporary credentials, and temporary SQLite paths with cleanup.

## Deliverable

1. Regenerate/reconcile OpenClaw contract mirrors and provenance from the supplied owner contract and fixtures. Do not hand-invent a hybrid schema.
2. Make the intake producer and integration harness singular: one authenticated provider event creates one durable record; history is context only; no burst/debounce grouping authority remains.
3. Converge client and final adapter with KM lifecycle semantics:
   - reserve immutable admitted envelope without target override;
   - persist invocation before exactly one provider call;
   - only authoritative permission/rejection/rate-limit outcomes are definitive failures;
   - timeout/transport ambiguity becomes terminal invoked-unknown fencing;
   - no retry after invocation, including legacy `NOT_SENT` or `DELIVERY_UNKNOWN` without an authorized owner transition;
   - only never-invoked abandonment receives a fresh attempt identity;
   - validate historical attempts against immutable pipeline/source/target/envelope and receipt evidence.
4. Replace stale burst assertions in `extensions/deliberation/scripts/km-listener.cross-repo.ts` with named executable owner-runtime leaves. Preserve no-live-path guard and cleanup.
5. Resolve the three composed E2E failures documented by `wild-crag-3236` at the OpenClaw producer/adapter boundary without weakening KM assertions.

## Executable acceptance

Implement and run named leaves `OR-07` through `OR-21`, especially:

- `OR-13 invocation-marker-before-one-provider-call`
- `OR-14 sent-completion-exact-immutable-receipt`
- `OR-16 timeout-transport-remain-delivery-unknown`
- `OR-17 invoked-unknown-nonreservable-after-restart`
- `OR-18 never-invoked-abandonment-fresh-attempt-id`
- `OR-19 legacy-not-sent-unknown-never-authorize-retry`
- `OR-20 historical-attempt-drift-and-tamper-fail-closed`

Mandatory owner-backed command:

```bash
OPENCLAW_DELIBERATION_KM_ROOT=/Users/michal/.openclaw/workspace/km-system pnpm test:deliberation:km-integration
```

It must verify and print the supplied revision/hashes and be Green with named leaves. Also run focused OpenClaw Deliberation tests and the KM composed E2E using isolated state. Preserve a genuine historical RED from the earlier lineage and fresh post-change GREEN for the same owner-backed boundary.

## Completion evidence

Final note must include the verified authority bundle, exact touched boundaries, named OR-07..OR-21 results, mandatory integration result, KM E2E result, focused OpenClaw checks, and RED/GREEN evidence.

No KM edits, service repair/restart, deployment, build/link/install, Gateway restart, production spool access, live provider send, or pilot activation.
