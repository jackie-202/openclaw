# Plan 2026-08-13: Fix recurring Deliberation intake transport failure after Gateway restart

*Status: WIP*

## Progress

- [x] Phase 0: Config + init
- [ ] Phase 1: Research
- [ ] Phase 2: Knowledge
- [ ] Phase 3: Synthesis

## Analysis [WIP]

### Codebase Context [DONE]

- `extensions/deliberation/index.ts` creates one `KmClient` during plugin registration and shares it between inbound intake, health/status, and the independently managed final-delivery service; registration has no KM startup probe or readiness state.
- `extensions/deliberation/src/km-client.ts` resolves the endpoint once, resolves the credential per request, uses a private `node:http`/`node:https` transport, and maps every request exception to `KmRequestError("transport")`, discarding Node error/abort classes. It has no retry or connection pool.
- `extensions/deliberation/src/intake.ts` performs one intake attempt and logs only bounded `stage/status/code`; failed intake remains non-claiming while `before_dispatch` independently preserves silence.
- `extensions/deliberation/src/km-client.test.ts` covers closed headers and generic transport failure, but not delayed listener startup, refused/reset/timeout classification, retry, or duplicate response after an uncertain first POST.
- `extensions/deliberation/src/hooks.test.ts` covers sanitized diagnostics and fail-closed behavior. `extensions/deliberation/src/plugin.test.ts` covers final-sender startup/stop and must remain green without changing sender semantics.
- `extensions/deliberation/scripts/intake-producer.ts` is the existing production-path probe for real Node transport and duplicate replay; use it rather than adding another intake mechanism.

### Relevant Documentation [DONE]

- `docs/plugins/reference/deliberation.md` defines the six-operation KM protocol, environment-only probe credential, idempotent duplicate replay, fail-closed logging, and unchanged KM-owned final sender lifecycle.
- `extensions/deliberation/contracts/km-wire-v1.json` and `extensions/deliberation/contracts/provenance.json` remain inspect-only protocol authority unless diagnosis proves a contract mismatch.
- Prior transport work in `plans/2026-08-02_swift-peak-4405_fix-deliberation-km-compatibility-with-node-fetch-transport.md` explains why the plugin uses its private Node transport rather than global fetch.
- Prior live-intake work in `plans/2026-08-04_bold-cove-8557_fix-openclaw-deliberation-live-intake-request-failure.md` established the producer probe, bounded diagnostics, and real-listener duplicate proof.

### Knowledge Base [TODO]

## Available Skills [TODO]

## Approach [TODO]

## Implementation [TODO]

## Files to Modify [TODO]

## TDD [TODO]

## Dependencies [TODO]
