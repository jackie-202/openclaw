---
title: Complete OpenClaw convergence against verified KM owner artifacts
---

# Complete OpenClaw convergence against verified KM owner artifacts

Reference: `docs/proposals/proposal-20260820-203458-161e2c_per-source-deliberation-pipelines-with-source-default-delivery.md`, section `Corrective Completion Plan`. Implement only this owner-convergence slice, not the entire proposal.

## Goal

Complete the missing OpenClaw producer/client/adapter and contract-provenance work that earlier tasks never started because they incorrectly required a moving KM checkout to retain an old whole-repository HEAD.

Work only in `/Users/michal/Projects/openclaw-fork`. Read-only KM access is allowed at `/Users/michal/.openclaw/workspace/km-system`. Do not edit KM, its Git metadata, live service, credentials, configuration, or production spool.

## Authority preflight — artifact hashes, not repository HEAD

The current KM HEAD is provenance only. Record it, but **do not fail because HEAD moved**.

Before implementation, verify these authoritative files and accepted SHA-256 values:

- `contracts/deliberation-v2/v1/contract.json` → `5c63424b32a8db8370a1212ff7eb3878695afbb5d0fec3721fbab326908de44b`
- `contracts/deliberation-v2/v1/fixtures.json` → `f26ca9afb804664cdcc03947262001d1d8441eab6d5ad9d92bb8533ae3c916b4`
- `lib/deliberation_wire.py` → `a0e42e4fe54eedab6f9955e77f439a4e69c9614a60560ca46532ce0de9dbb528`
- `lib/deliberation_spool_contracts.py` → `47587e405d3e6b7f433eb7d450bd02969546860ff0d6822ad7bea9ff2478a0ca`

If all four hashes match, implementation must continue regardless of unrelated KM commits or dirty unrelated paths. Fail closed only if one of these exact files differs; identify it precisely.

## Required product work

1. Regenerate/reconcile OpenClaw contract mirrors and provenance from the verified KM owner contract and fixtures. Do not invent a hybrid schema.
2. Make producer and integration harness singular: one authenticated provider event creates one durable record; source history is context only; no burst/debounce grouping authority remains.
3. Converge the HTTP client and final provider adapter:
   - reserve immutable admitted envelope without target override;
   - persist invocation before exactly one provider call;
   - only authoritative provider rejection/permission/rate-limit outcomes are definitive failures;
   - timeout and transport ambiguity become terminal invoked-unknown fencing;
   - no retry after invocation, including legacy `NOT_SENT`/`DELIVERY_UNKNOWN` without an owner-authorized transition;
   - only never-invoked abandonment gets a fresh attempt ID;
   - historical attempts validate immutable pipeline/source/target/envelope and receipt evidence.
4. Replace stale burst assumptions in `extensions/deliberation/scripts/km-listener.cross-repo.ts` with real named owner-runtime scenarios.
5. Resolve the three composed E2E failures recorded by `wild-crag-3236` at the OpenClaw boundary without weakening KM assertions.

## Executable acceptance

Materialize and run executable named leaves `OR-07` through `OR-21`, especially OR-13, OR-14, and OR-16 through OR-20.

Run with isolated temporary listener credentials, random loopback port and temporary SQLite, always cleaned up:

```bash
OPENCLAW_DELIBERATION_KM_ROOT=/Users/michal/.openclaw/workspace/km-system pnpm test:deliberation:km-integration
```

The command must print current KM HEAD as non-blocking provenance, verify the four accepted hashes, and be Green for named OR-07..OR-21. Also run focused OpenClaw Deliberation tests and the deterministic KM composed E2E against isolated state.

Preserve exact commands/results and genuine historical RED versus fresh post-change GREEN. No source-build aggregate may substitute for owner-backed execution.

## Completion evidence

Final note must include current KM HEAD, verified hashes, touched OpenClaw boundaries, named OR-07..OR-21 results, integration result, KM E2E result, focused checks, and RED/GREEN evidence.

No KM writes, service repair/restart, deployment, build/link/install, Gateway restart, production spool, live provider send, or pilot activation.
