# Fix live Deliberation Discord intake failing before KM spool

## Observed production-like failure

A real Discord source message was posted to configured source channel `1494265174389948538`:

- Discord message id: `1534181693647355986`
- content: `haloo je tu někdo?`
- occurred at: `2026-08-04T12:50:19.483Z`

The enabled OpenClaw Deliberation plugin matched the source but logged at `2026-08-04T12:50:21.838Z`:

`deliberation intake failed: reason=km-request-failed error=Error`

Trace: `c41f46cfb0da47d62257530ccbb4047f`.

The live KM listener itself is healthy when called with protocol/auth headers: HTTP 200, `source-intake=true`. Canonical spool contains no new Discord record; it still has only the old manual probe from 2026-08-02. Therefore the message stopped at the OpenClaw plugin → KM request boundary and Mission Control correctly has nothing to show.

The same failure occurred for the prior real message id `1534167685800263824` at 2026-08-04T11:54:41Z. The recently built KM smoke E2E reached READY_TO_SEND but starts from synthetic HTTP intake and does not prove the actual OpenClaw Discord hook/request runtime.

## Goal

Diagnose and fix the real OpenClaw Deliberation extension intake request so a Discord source event is persisted in the canonical KM spool.

## Scope and ownership

Primary project is `openclaw-fork` because evidence places the failure in the plugin-to-KM request boundary. Inspect live built/runtime code and config rather than assuming source and deployed bundle match. If a km-system contract mismatch is proven, document it and make only the necessary coordinated change through a follow-up task rather than weakening the wire contract.

## Requirements

1. Reproduce the exact live request shape against a real temporary listener or capture bounded sanitized response diagnostics; distinguish auth, protocol header, CORS/fetch metadata, schema, timestamp normalization, and endpoint errors.
2. Improve plugin diagnostics enough that future `km-request-failed` logs include bounded status/code/stage without credentials or message content.
3. Fix the actual cause while keeping fail-closed behavior.
4. Extend the Deliberation E2E boundary so it exercises the real OpenClaw extension intake producer, not merely a synthetic direct KM HTTP request. Keep orchestration/fixtures in km-system if appropriate, but ensure this regression cannot pass while live Discord intake fails.
5. Verify the canonical timestamp producer normalization remains correct.
6. Do not enable final sender/source delivery.

## Acceptance criteria

- A real Discord-shaped event processed through the OpenClaw Deliberation hook reaches a real temporary KM listener and persists once.
- Tests fail before the fix and pass after it.
- Existing OpenClaw Deliberation contract/unit tests and km-system Deliberation E2E remain green.
- Runtime diagnostics identify HTTP status/KM error code on rejection without leaking secrets/content.
- After deployment/reload verification, a new message in source channel `1494265174389948538` appears in the canonical KM spool/MC intake projection.
- Sender remains disabled.

## Verification

Run focused fork tests, the km-system deterministic Deliberation E2E, and a live source-channel probe after the corrected runtime is loaded. Record message id, canonical spool record id/state, and health controls.
