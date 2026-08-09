---
title: Fix Discord provider reconnect after network outage
type: bugfix
size: medium
---

# Fix Discord provider reconnect after network outage leaves client initialized but not ready

## Context / observed incident

On 2026-08-06 around 08:36 Europe/Prague, a likely internet outage/UPS event broke Discord connectivity while the OpenClaw gateway process kept running. Gateway was later restarted manually at 09:07, after which Discord came back.

Evidence from `/Users/michal/Library/Logs/openclaw/gateway.log`:

- `2026-08-06T08:36:28` and `08:36:31`: Discord gateway websocket closed with code `1006` for both/default-ish flows.
- `2026-08-06T08:42:00`: Discord gateway websocket errors: `Opening handshake has timed out`, then health monitor logged `[discord:default] health-monitor: restarting (reason: disconnected)` and `[discord:iris] health-monitor: restarting (reason: disconnected)`.
- Restart attempts logged provider startup and `client initialized ... awaiting gateway readiness` for both default and iris at ~08:42:15/08:42:16, but no subsequent readiness confirmation was observed before later closes.
- `2026-08-06T08:58:58`: both Discord gateway websockets closed again with `1006`; communication via Discord still did not recover.
- `2026-08-06T09:07:27`: manual gateway restart requested due to dropped Discord gateway connections/handshake timeouts.
- `2026-08-06T09:07:39-09:07:52`: gateway restarted cleanly; Discord channels resolved and clients initialized; current `openclaw status --deep` reports `Discord OK configured`.

## Problem to solve

The Discord channel should self-heal after network loss without requiring a full OpenClaw gateway restart. The health monitor detected disconnection and attempted provider restart, but at least one state path can leave the Discord client in an initialized/awaiting-ready/not-actually-ready condition or otherwise not receiving messages after network restoration.

## Scope boundary

Work only in the OpenClaw fork repository. Do not inspect other projects. Use the incident evidence above as sufficient external log context; do not require reading `/Users/michal/Library/Logs/openclaw/gateway.log` from inside the coding agent if permissions reject it.

## Requirements

1. Inspect the Discord provider lifecycle/reconnect/health-monitor code paths.
2. Identify why a provider restart after websocket close/handshake timeout can leave a client initialized but not ready or not receiving messages.
3. Add a focused fix so disconnected/stuck Discord clients are fully destroyed/recreated or otherwise forced through a clean ready state.
4. Add regression coverage if the codebase has suitable tests for Discord lifecycle/health monitor behavior. If no suitable harness exists, add a small testable seam or document precisely why test coverage was not practical.
5. Improve logs if needed so future incidents distinguish:
   - websocket close/error,
   - restart attempt scheduled/started,
   - ready reached,
   - restart failed or timed out.
6. Preserve support for multiple Discord accounts/providers (`default`, `iris`) and startup staggering/rate-limit avoidance.

## Acceptance criteria

- A simulated or unit-tested Discord gateway close / handshake-timeout / no-ready-after-restart path triggers a clean provider recovery rather than remaining in initialized-but-not-ready limbo.
- Existing Discord startup behavior and multi-account staggering remain intact.
- Verification commands are run and recorded in final note.
- Final note includes the exact files changed and explains the root cause in terms of observed lifecycle state, not just “network outage”.

## Verification suggestion

Run the smallest relevant test/typecheck/build commands for the OpenClaw fork. If full build/test is expensive, run focused tests plus a compile/typecheck gate that covers modified files.
