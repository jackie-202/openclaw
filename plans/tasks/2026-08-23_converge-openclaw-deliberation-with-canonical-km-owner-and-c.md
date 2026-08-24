---
title: Converge OpenClaw Deliberation with canonical KM owner and cross-repository gate
---

# Converge OpenClaw Deliberation with canonical KM owner and cross-repository gate

## Objective

Regenerate OpenClaw from the accepted KM owner produced by the preceding batch task and make the real producer/client/adapter integration conform to singular-event and ambiguity-safe delivery semantics.

Work only in `/Users/michal/Projects/openclaw-fork`. KM is a read-only verification dependency. Do not edit KM. Before implementation, resolve the accepted KM revision and owner contract/fixture hashes from the final evidence of the preceding KM task; fail closed if they are absent or ambiguous. Provision or use an isolated clean KM checkout pinned to that exact revision and set `OPENCLAW_DELIBERATION_KM_ROOT` to its `km-system` directory. Never use `tmp/bold-wave-3956-agent-workspace` or any unproven snapshot.

## Deliverable

1. Regenerate/reconcile OpenClaw contract mirrors and provenance from the accepted owner contract. Do not hand-invent a hybrid schema.
2. Make the intake producer and integration harness singular: one authenticated provider event creates one durable record; history is context only; no burst/debounce grouping authority remains.
3. Converge client and public final adapter with KM lifecycle semantics:
   - reserve from immutable durable envelope without target override;
   - persist invocation before exactly one provider call;
   - only authoritative permission/rejection/rate-limit outcomes are definitive failures;
   - timeout/transport ambiguity reaches terminal invoked-unknown fencing;
   - no retry after invocation, including legacy `NOT_SENT` or `DELIVERY_UNKNOWN` without an authorized owner transition;
   - only never-invoked abandonment receives a fresh attempt identity;
   - validate every historical attempt against admitted pipeline/source/target/envelope and immutable receipt evidence.
4. Replace stale burst assertions in `extensions/deliberation/scripts/km-listener.cross-repo.ts` with real named scenario leaves. Preserve random loopback port, temporary credential/SQLite, no-live-path guard, and `finally` cleanup.
5. Resolve the three current composed KM E2E failures at the OpenClaw producer/adapter boundary without weakening KM assertions.

## Executable acceptance

Materialize and run named leaves:

- `OR-07` through `OR-21` as assigned in `wild-crag-3236`;
- especially `OR-13 invocation-marker-before-one-provider-call`, `OR-14 sent-completion-exact-immutable-receipt`, `OR-16 timeout-transport-remain-delivery-unknown`, `OR-17 invoked-unknown-nonreservable-after-restart`, `OR-18 never-invoked-abandonment-fresh-attempt-id`, `OR-19 legacy-not-sent-unknown-never-authorize-retry`, and `OR-20 historical-attempt-drift-and-tamper-fail-closed`.

Mandatory cross-repository command:

```bash
OPENCLAW_DELIBERATION_KM_ROOT=<clean-pinned-checkout>/workspace/km-system pnpm test:deliberation:km-integration
```

It must print the exact KM revision and accepted owner hashes, identify each OR leaf, and be Green. Also run the focused OpenClaw Deliberation suite and, from the pinned KM checkout, the three previously failing composed E2E selectors (or the full deterministic E2E if selectors changed). No aggregate count may substitute for named boundary results.

## Completion evidence

Final note must include exact KM revision/hashes, checkout cleanliness evidence, named OR results, `pnpm test:deliberation:km-integration` result, KM E2E result, and focused OpenClaw checks. If KM owner evidence changed after planning, stop rather than silently regenerating against another revision.

No OpenClaw package/doctor work, deployment, build/link/install, Gateway restart, production spool access, live provider send, or pilot activation.
