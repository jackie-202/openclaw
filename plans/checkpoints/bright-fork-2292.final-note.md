# Deliberation Full Gate Result

- Command: `pnpm test:deliberation:full-gate`
- Result: **23/23 Green**
- OpenClaw revision: `a1e88d993e6ee6fa6ce36c40d4f67fbe35eaef49`
- KM HEAD (provenance only): `3104fa976b1341d68d98c5ea4916dc8e2d368c20`
- KM SHA-256 `contracts/deliberation-v2/v1/contract.json`: `5c63424b32a8db8370a1212ff7eb3878695afbb5d0fec3721fbab326908de44b`
- KM SHA-256 `contracts/deliberation-v2/v1/fixtures.json`: `f26ca9afb804664cdcc03947262001d1d8441eab6d5ad9d92bb8533ae3c916b4`
- KM SHA-256 `lib/deliberation_wire.py`: `a0e42e4fe54eedab6f9955e77f439a4e69c9614a60560ca46532ce0de9dbb528`
- KM SHA-256 `lib/deliberation_spool_contracts.py`: `47587e405d3e6b7f433eb7d450bd02969546860ff0d6822ad7bea9ff2478a0ca`
- Artifact SHA-256: `addb3b6ff087bdbff7e8be531604765bf2bd33d7b9070f6d5bbff52a79293ec0`
- Negative verifier: missing, duplicate, stale, and malformed each exited nonzero with bounded diagnostics and no manufactured ledger
- Support commands: build=Green, package-build=Green, focused-deliberation=Green, oxlint=Green, tsgo-production=Green, tsgo-tests=Green, package-singleton=Green, diff-check=Green, negative-missing=Green, negative-duplicate=Green, negative-stale=Green, negative-malformed=Green
- Elapsed: 549515 ms

- OR-01 Green: OR-01 exclusive-owner-before-ordinary-side-effects
- OR-02 Green: OR-02 disabled-source-terminal-without-side-effects
- OR-03 Green: OR-03 missing-error-ambiguous-owner-terminal
- OR-04 Green: OR-04 discord-system-room-event-claimed-before-enqueue
- OR-05 Green: OR-05 slack-root-child-claim-before-thread-effects
- OR-06 Green: OR-06 command-abort-empty-autothread-claim-matrix
- OR-07 Green: OR-07 authenticated-event-creates-one-record
- OR-08 Green: OR-08 duplicate-idempotent-conflict-zero-mutation
- OR-09 Green: OR-09 account-channel-source-isolation
- OR-10 Green: OR-10 history-context-only-pending-event-singular
- OR-11 Green: OR-11 pipeline-source-target-immutable-end-to-end
- OR-12 Green: OR-12 reservation-no-target-override-cas-replay
- OR-13 Green: OR-13 invocation-marker-before-one-provider-call
- OR-14 Green: OR-14 sent-completion-exact-immutable-receipt
- OR-15 Green: OR-15 authoritative-provider-rejection-terminal
- OR-16 Green: OR-16 timeout-transport-remain-delivery-unknown
- OR-17 Green: OR-17 invoked-unknown-nonreservable-after-restart
- OR-18 Green: OR-18 never-invoked-abandonment-fresh-attempt-id
- OR-19 Green: OR-19 legacy-not-sent-unknown-never-authorize-retry
- OR-20 Green: OR-20 historical-attempt-drift-and-tamper-fail-closed
- OR-21 Green: OR-21 atomic-bounded-legacy-migration-audit-only
- OR-22 Green: OR-22 doctor-package-writeback-built-five-hook-runtime
- OR-23 Green: OR-23 full-gate-integrity

This is repository readiness only. Deployment, live activation, provider authenticity, and pilot readiness were not established.
