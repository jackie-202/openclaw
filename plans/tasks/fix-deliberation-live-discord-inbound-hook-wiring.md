# Fix live Discord deliberation intake hook wiring

## Problem

The deliberation plugin passes unit/acceptance tests but a live Discord source message is silenced without ever reaching the KM listener.

Live evidence from 2026-08-02:

- configured source channel: `1494265174389948538`
- source message: `1533451497218506752`, content `Tak schvalne`, timestamp `2026-08-02T12:28:47.088Z`
- Discord has no bot reply after this message, so fail-closed silence worked
- `PYTHONPATH=scripts:lib .venv/bin/python3 scripts/deliberation-v2.py audit --limit 20` returns `[]`
- canonical spool files show no write at/after the message timestamp
- listener was down when the message was sent; however the plugin emitted no visible `deliberation intake failed` warning and there is no evidence the intake claim hook ran at all
- the message did not create an agent-session user turn, consistent with the later `before_dispatch` guard terminating dispatch independently

This exposes a gap between the mocked plugin tests and the real Discord inbound hook pipeline. The current behavior can silently discard source messages.

## Required investigation and fix

1. Trace the real Discord inbound path through hook registration and dispatch, specifically whether `inbound_claim` runs for Discord inbound messages before `before_dispatch`.
2. Reproduce the live event with the closest existing Discord inbound integration harness, not only by invoking `createInboundClaimHandler` directly.
3. Determine why `inbound_claim` is absent/skipped while `before_dispatch` still silences the source message. Inspect runtime hook registration, hook-runner capability checks, canonical context construction, and Discord-specific dispatch entry points.
4. Fix the actual integration seam so every configured Discord source message attempts durable KM intake before terminal silence.
5. Preserve fail-closed behavior: if intake fails, ordinary agent dispatch and outbound reply must remain blocked, but the failure must be observable without leaking message content.
6. Add regression coverage at the Discord/core dispatch boundary proving:
   - source event invokes KM intake exactly once;
   - successful intake returns terminal claim and no agent/send occurs;
   - failed intake is logged and `before_dispatch` still blocks agent/send;
   - unrelated Discord channels continue normal routing.
7. Do not weaken listener auth, source matching, `FAIL_CLOSED_HOOK_PRIORITY`, or `401` behavior.

## Acceptance criteria

- A realistic Discord event for channel `1494265174389948538` reaches `createInboundClaimHandler`/KM intake in the integration test.
- Successful intake is present in the canonical spool/audit contract and no normal agent response is dispatched.
- Listener-unavailable failure is observable in logs and cannot leak into ordinary dispatch.
- Existing deliberation and Discord inbound tests remain green.
- The final task note identifies the exact live wiring cause and records focused test/typecheck results.

## Scope boundary

Work only in `/Users/michal/Projects/openclaw-fork`. Do not modify live config, credentials, KM listener code, or other repositories. The runtime evidence above is sufficient; record any additional external requirement as a follow-up.
