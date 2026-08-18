---
title: Wire the existing Deliberation final sender into the live plugin runtime
type: implementation
---

# Wire the existing Deliberation final sender into the live plugin runtime

The live Deliberation v2 pipeline reaches `READY_TO_SEND`, but no runtime owner consumes that queue. The delivery implementation already exists in this repository: `extensions/deliberation/src/final-adapter.ts` implements the bounded `ready -> reserve -> invoke -> provider.send -> completeDelivery` protocol. It is currently referenced only by tests, so records remain indefinitely in `READY_TO_SEND` with no delivery attempt.

## Objective

Connect the existing final-delivery adapter to the live Deliberation plugin lifecycle so a ready item is delivered through the configured Discord account and terminally recorded through KM. Prefer a bounded plugin-owned tick or equivalent lifecycle integration. Do not create a second delivery protocol or move provider authority into KM/Python.

## Requirements

- Keep `extensions/deliberation/src/final-adapter.ts` as the sole plugin-confined final provider adapter.
- Instantiate it with the existing KM client and the plugin/Gateway Discord provider boundary.
- Give the sender a bounded, non-overlapping runtime trigger with explicit lifecycle cleanup; avoid unbounded polling, overlapping sends, and duplicate timers across reloads.
- Preserve KM ownership of reservation, idempotency, invocation evidence, crash recovery, and terminal state.
- Respect the existing sender control. Disabled or conflicted reservation must not call the provider.
- Preserve fail-closed behavior for malformed destinations and provider failures; bound diagnostic evidence.
- Do not alter the Python `deliberation-v2-runner` cron merely to perform Discord provider sends. It may remain responsible for orchestration up to `READY_TO_SEND`.
- Characterization-first guardrail: add a test proving that before wiring, a ready item is not consumed by plugin runtime, then prove the wired lifecycle invokes the adapter exactly as intended.

## Acceptance criteria

1. Plugin startup/runtime registration creates exactly one bounded final-delivery runner, and plugin stop/reload cleans it up.
2. A mocked KM ready item follows `ready -> reserve -> invoke -> one provider send -> complete SENT`.
3. Empty queue, sender disabled, and reservation conflict produce no provider call.
4. Provider failure records `FAILED` using the existing bounded evidence path and does not escape the runtime loop.
5. Repeated ticks/reloads do not overlap or duplicate a provider send for one reservation.
6. Focused Deliberation plugin tests, typecheck, and the smallest relevant build gate pass.
7. Final task evidence identifies the production runtime entrypoint that owns the sender and records the verification commands/results.

## Scope boundary

Work only in `/Users/michal/Projects/openclaw-fork`. Do not inspect or edit KM workspace code, external configuration, cron state, or runtime spool files. The accepted cross-repository fact is that KM already exposes and owns the wire operations consumed by `KmClient`; if a missing contract is discovered, record a precise follow-up rather than crossing repository boundaries.
