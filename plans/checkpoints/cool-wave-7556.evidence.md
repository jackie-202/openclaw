# Evidence: cool-wave-7556

## Owner Authority

- Final observed KM HEAD (non-blocking provenance): `d712ae3af474fa2648d49ad61921d210c2db993e`
- `contracts/deliberation-v2/v1/contract.json`: `5c63424b32a8db8370a1212ff7eb3878695afbb5d0fec3721fbab326908de44b`
- `contracts/deliberation-v2/v1/fixtures.json`: `f26ca9afb804664cdcc03947262001d1d8441eab6d5ad9d92bb8533ae3c916b4`
- `lib/deliberation_wire.py`: `a0e42e4fe54eedab6f9955e77f439a4e69c9614a60560ca46532ce0de9dbb528`
- `lib/deliberation_spool_contracts.py`: `47587e405d3e6b7f433eb7d450bd02969546860ff0d6822ad7bea9ff2478a0ca`
- Result: all four hashes matched `extensions/deliberation/contracts/provenance.json` on every owner-backed run.

## Implementation Boundaries

- Preserved attributable contract mirrors/provenance, intake producer, KM client, final adapter, and focused regressions.
- `extensions/deliberation/scripts/km-spool-probe.py` now requires explicit source-history JSON and a cutoff provider event ID; it no longer derives source history from canonical intake messages.
- `extensions/deliberation/scripts/km-listener.cross-repo.ts` no longer contains `runOwnerTests`, `OWNER_CHARACTERIZATION`, or `OWNER_E2E`.
- OR-07..OR-21 now run as direct `node:test` scenarios against random-loopback listeners and disposable owner SQLite state.
- Restart scenarios preserve the same spool and credential while safely replacing only the listener process.
- OR-19/OR-20 feed owner-projected legacy/tampered delivery histories through the real `createKmClient().completeDelivery()` parser.
- OR-21 invokes the public `DeliberationSpool` migration entry point, injects a deterministic migration failure, compares full logical SQLite dumps for rollback, then proves bounded successful reopen and audit-only historical state.

## Verification

- `OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test extensions/deliberation/src/km-client.test.ts -t 'OR-19|OR-20' -- --reporter=verbose` -> exit 0; 3 passed, 70 skipped.
- `OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test extensions/deliberation/src/contract.test.ts extensions/deliberation/scripts/intake-producer.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/final-adapter.test.ts -- --reporter=verbose` -> exit 0; 112 passed.
- `OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test extensions/deliberation -- --reporter=verbose` -> exit 0; 295 passed.
- `OPENCLAW_DELIBERATION_KM_ROOT="$HOME/.openclaw/workspace/km-system" pnpm test:deliberation:km-integration` -> exit 0; 37 passed, including each OR-07..OR-21 selector exactly once.
- `pnpm tsgo:extensions` -> exit 0.
- `pnpm lint:extensions` -> exit 0 before the final harness-only tightening; the later narrow lint wrapper was blocked during package-boundary declaration preparation by unrelated dirty-worktree errors.
- `pnpm build` -> exit 0.
- `git diff --check` -> exit 0.
- `pnpm check:changed` -> infrastructure-blocked: delegated Blacksmith Testbox could not start because `blacksmith` is absent from `PATH`.

## Known External/Unrelated Results

- KM composed selectors: 2 passed, 1 failed at the stale owner assertion that omits contract-required `pipelineId` and `deliveryTarget` from `record.messages`. Required fields were preserved.
- `pnpm tsgo:extensions:test` remains blocked by pre-existing dirty-worktree type errors in `extensions/deliberation/src/history-read.test.ts`, Discord queue tests, and Slack monitor tests; no error references the two task-edited scripts.
- Repo-local autoreview could not submit its 2,269,217-character shared-worktree bundle to the 1,048,576-character reviewer limit. Three bounded read-only review passes were run instead; accepted harness findings were repaired. Remaining comments concerned pre-existing support assertions outside OR-07..OR-21 and were not expanded in this task.

## Safety And Cleanup

- No KM source, Git metadata, credentials, configuration, service, production spool, deployment, Gateway, provider, or pilot was modified or activated.
- Every direct scenario uses a sentinel-protected temporary root outside canonical KM state.
- Successful and failing fixture paths stop listeners and recursively remove temporary roots.
