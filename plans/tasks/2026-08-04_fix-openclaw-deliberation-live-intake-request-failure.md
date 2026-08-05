# Fix OpenClaw Deliberation live intake request failure

## Ownership

This task belongs only to `openclaw-fork`. Do not modify `km-system` E2E code or documentation here.

## Evidence

Real Discord source message:

- channel `1494265174389948538`
- message id `1534181693647355986`
- occurred at `2026-08-04T12:50:19.483Z`

The enabled Deliberation plugin logged at `2026-08-04T12:50:21.838Z`:
`deliberation intake failed: reason=km-request-failed error=Error`
Trace: `c41f46cfb0da47d62257530ccbb4047f`.

The KM listener was healthy with authenticated protocol-v1 health HTTP 200 and `source-intake=true`. The canonical KM spool contained no new Discord record, so failure is in the OpenClaw hook/request boundary before persistence. A prior real message `1534167685800263824` failed the same way.

## Goal

Diagnose and fix the OpenClaw Deliberation extension so a matched Discord event produces a valid authenticated KM intake request and is persisted once by a real listener.

## Requirements

- Reproduce the extension's exact request against a real temporary KM listener or equivalent wire fixture.
- Distinguish endpoint, auth, protocol headers, fetch metadata, schema, timestamp normalization, and response parsing.
- Fix the root cause while preserving fail-closed behavior and canonical timestamp normalization.
- Improve bounded diagnostics so future intake rejection identifies HTTP status/KM code/stage without credentials or message content.
- Add/extend narrow fork-side contract/integration coverage for the actual extension intake producer.
- Do not modify km-system test harnesses in this task.
- Do not enable sender or source-channel delivery.

## Acceptance

- A Discord-shaped event through the real extension intake producer reaches a real temporary KM listener and persists once.
- Regression test fails before and passes after the fix.
- Existing Deliberation extension tests pass.
- Runtime rejection logs expose bounded status/code/stage safely.
- Fork-side output/contract is documented sufficiently for the separate km-system E2E task to invoke it.
