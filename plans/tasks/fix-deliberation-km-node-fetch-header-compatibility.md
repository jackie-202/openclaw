# Fix Deliberation KM compatibility with Node fetch transport headers

## Context

The live Deliberation pilot is configured correctly and the plugin loads all four typed hooks. A synthetic direct invocation of `runInboundClaimForPluginOutcome('deliberation', ...)` reaches the `inbound_claim` handler, but the handler fails closed with `reason=km-request-failed` and returns `declined`.

The failure is isolated to the authenticated loopback HTTP boundary:

- the KM listener at `http://127.0.0.1:8765` is healthy;
- the same credential and protocol headers sent by curl return HTTP 200 from `/deliberation/v1/health`;
- `createKmClient().health()` from the OpenClaw Node runtime returns HTTP 400;
- Node's built-in `fetch` adds `sec-fetch-mode`, while `km-system/lib/deliberation_wire.py` rejects every request header outside its closed application/transport allowlists.

This is a synthetic diagnostic finding, not evidence of a real Discord intake.

## Objective

Make the OpenClaw Deliberation KM client and KM listener wire contract compatible with the standard transport headers emitted by the supported Node `fetch` implementation, without weakening authentication, protocol-version checks, media-type checks, loopback binding, closed application-header semantics, or fail-closed behavior.

## Scope boundary

Work only in `/Users/michal/Projects/openclaw-fork`. Do not edit `km-system`, external config, credentials, runtime state, or Discord settings. The external listener behavior above is supplied evidence; do not inspect or modify other repositories. If a correct solution necessarily belongs to `km-system`, stop and record the exact required contract change rather than crossing the repository boundary.

Expected primary files:

- `extensions/deliberation/src/km-client.ts`
- `extensions/deliberation/src/km-client.test.ts`
- `extensions/deliberation/src/plugin.test.ts` only if needed for an adjacent fail-closed assertion
- Deliberation wire documentation if the supported transport-header contract is documented in this repository

## Requirements

1. Reproduce and characterize the mismatch with a focused test before changing production behavior.
2. Choose the narrowest standards-compatible fix. Do not replace `fetch`, add retries, suppress HTTP errors, relax authentication, or broadly accept arbitrary application headers.
3. Preserve these client request headers exactly:
   - `Accept: application/json`
   - `Authorization: Bearer <credential>`
   - `X-Deliberation-Protocol-Version: 1`
   - `Content-Type: application/json` only when a body exists
4. Preserve SecretRef resolution and never expose credential material in logs, errors, fixtures, snapshots, or artifacts.
5. Preserve fail-closed intake behavior for network errors, authentication errors, protocol errors, malformed JSON, and schema-invalid responses.
6. Add focused regression coverage that models the supported Node runtime's automatic transport headers and proves the chosen boundary behavior. Keep rejection coverage for genuinely unknown application headers.
7. Avoid unrelated plugin/config/runtime changes.

## Verification

Run the smallest relevant focused test suite for `km-client` and adjacent plugin intake behavior, then the Deliberation extension typecheck/build gate used by this repository. Record exact commands and outcomes in the final note.

## Acceptance criteria

- The characterized Node `fetch` transport-header request no longer receives HTTP 400 solely because of standard automatic transport metadata.
- Unknown or unauthorized application headers remain rejected by the documented contract.
- Authentication, protocol version, media type, SecretRef handling, and fail-closed behavior remain covered and unchanged.
- Focused tests and the Deliberation extension typecheck/build gate pass.
- Final note identifies the exact compatibility seam changed and provides verification evidence.

Do not include git, branch, commit, push, PR, or merge operations in implementation work.
