# Add OpenClaw side of deployed Deliberation delivery probe

## Context

The active incident proved repository-local adapter tests are insufficient: a valid KM `READY_TO_SEND` row remained unreserved while the live plugin emitted `KM request failed`. The existing KM deterministic E2E intentionally stops before final provider delivery.

## Objective

Add a public, test-only OpenClaw probe boundary that lets the KM-owned isolated integration gate execute the real plugin KM client plus final-delivery adapter using a fake provider, with deployment identity and bounded diagnostics.

## Requirements

1. Scope is only `openclaw-fork`.
2. Reuse the actual production KM client/request construction, final adapter, target parsing, reserve/invoke/complete calls, and idempotency derivation. Do not copy protocol logic into a fixture.
3. Add a deliberately explicit test/probe entrypoint guarded so normal Gateway/plugin startup can never select it. It accepts only an isolated loopback KM endpoint and an ephemeral credential reference supplied by the harness.
4. The injected provider must never call Discord/Slack. It returns deterministic synthetic receipt/message IDs and records a bounded call count/target classification without text content.
5. Emit bounded JSON stage evidence and active build/source identity. Surface operation/path/status or safe cause for KM failures; never expose credentials or payload text.
6. Add tests for successful ready/reserve/invoke/complete, one provider call, replay zero-call, target mismatch, auth/protocol failures, and refusal of non-loopback or normal production provider execution.
7. Run focused extension tests plus build/typecheck. Do not restart Gateway, change config, or send externally.

## Acceptance

The OpenClaw probe can be invoked by an isolated KM harness to prove the real production request/adapter path through a fake provider, while being impossible to use against a non-loopback endpoint or real provider.
