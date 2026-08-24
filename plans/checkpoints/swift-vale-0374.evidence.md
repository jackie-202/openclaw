# Completion Evidence: swift-vale-0374

## Authority

- KM HEAD (non-blocking provenance): `57811c75fa43614f49ec90e0f7b87d2e8ad4ce8c`
- `contracts/deliberation-v2/v1/contract.json`: `5c63424b32a8db8370a1212ff7eb3878695afbb5d0fec3721fbab326908de44b`
- `contracts/deliberation-v2/v1/fixtures.json`: `f26ca9afb804664cdcc03947262001d1d8441eab6d5ad9d92bb8533ae3c916b4`
- `lib/deliberation_wire.py`: `a0e42e4fe54eedab6f9955e77f439a4e69c9614a60560ca46532ce0de9dbb528`
- `lib/deliberation_spool_contracts.py`: `47587e405d3e6b7f433eb7d450bd02969546860ff0d6822ad7bea9ff2478a0ca`

The owner-backed gate printed HEAD as provenance only and verified all four hashes before running behavior. Direct shell preflight with the KM checkout as the working directory was denied by the environment's external-directory policy, so the required in-repository integration preflight supplied the authority evidence.

## OpenClaw Boundaries

The preserved parent implementation covers:

- owner contract mirrors and hash authority: `extensions/deliberation/contracts/`
- singular intake producer and spool probe: `extensions/deliberation/scripts/intake-producer.ts`, `extensions/deliberation/scripts/km-spool-probe.py`
- isolated owner-runtime harness: `extensions/deliberation/scripts/km-listener.cross-repo.ts`
- immutable lifecycle parsing and retry fencing: `extensions/deliberation/src/km-client.ts`
- one-invocation/one-provider-call adapter: `extensions/deliberation/src/final-adapter.ts`
- focused regressions: `extensions/deliberation/src/contract.test.ts`, `extensions/deliberation/scripts/intake-producer.test.ts`, `extensions/deliberation/src/km-client.test.ts`, `extensions/deliberation/src/final-adapter.test.ts`

This acceptance fix additionally completed `configuredKmCheckoutEvidence` in `extensions/deliberation/contracts/provenance.json` so it records all four authoritative hashes, with a matching contract regression.

## RED/GREEN

Exact task-scoped RED/GREEN evidence is in `plans/checkpoints/swift-vale-0374.red-green-proof.md`.

- Historical parent RED is linked without reconstructing truncated output.
- Fresh OR-19/OR-20 GREEN: 3 passed, 70 skipped.
- Fresh provenance RED: 1 failed because two authoritative hashes were absent.
- Fresh provenance GREEN after implementation: 1 passed, 9 skipped.

## Named Owner Gate

Command:

```bash
OPENCLAW_DELIBERATION_KM_ROOT=/Users/michal/.openclaw/workspace/km-system pnpm test:deliberation:km-integration
```

Result: exit code 0, 37 passed, 0 failed, 0 skipped. Exact required leaves:

- PASS `OR-07 authenticated-event-creates-one-record`
- PASS `OR-08 duplicate-idempotent-conflict-zero-mutation`
- PASS `OR-09 account-channel-source-isolation`
- PASS `OR-10 history-context-only-pending-event-singular`
- PASS `OR-11 pipeline-source-target-immutable-end-to-end`
- PASS `OR-12 reservation-no-target-override-cas-replay`
- PASS `OR-13 invocation-marker-before-one-provider-call`
- PASS `OR-14 sent-completion-exact-immutable-receipt`
- PASS `OR-15 authoritative-provider-rejection-terminal`
- PASS `OR-16 timeout-transport-remain-delivery-unknown`
- PASS `OR-17 invoked-unknown-nonreservable-after-restart`
- PASS `OR-18 never-invoked-abandonment-fresh-attempt-id`
- PASS `OR-19 legacy-not-sent-unknown-never-authorize-retry`
- PASS `OR-20 historical-attempt-drift-and-tamper-fail-closed`
- PASS `OR-21 atomic-bounded-legacy-migration-audit-only`

The same run passed temporary credential, random loopback listener, isolated spool, production-spool rejection, callback cleanup, and path-alias guards. It explicitly reported that listener and temporary root cleanup passed.

## Focused Checks

```text
OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test extensions/deliberation/src/contract.test.ts extensions/deliberation/scripts/intake-producer.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/final-adapter.test.ts -- --reporter=verbose
-> exit 0; 4 files passed; 112 tests passed

pnpm build
-> exit 0; build-all, tsdown, runtime postbuild, plugin SDK exports, plugin assets, and Control UI build passed

git diff --check
-> exit 0; no output

pnpm changed:lanes --json
-> exit 0; selected fail-safe broad lanes because the shared worktree contains many unrelated unknown surfaces

pnpm check:changed
-> exit 1 before checks ran; Blacksmith Testbox delegation could not start because `blacksmith` is not installed in PATH

.agents/skills/autoreview/scripts/autoreview --mode local --prompt "Review only the task-owned changes ..."
-> review did not start; the 2,240,448-character shared-worktree bundle exceeded the engine's 1,048,576-character input limit
```

## KM Composed E2E

Command:

```bash
PYTHONDONTWRITEBYTECODE=1 PYTHONPATH=/Users/michal/.openclaw/workspace/km-system/scripts:/Users/michal/.openclaw/workspace/km-system/lib OPENCLAW_FORK_ROOT=/Users/michal/Projects/openclaw-fork /Users/michal/.openclaw/workspace/km-system/.venv/bin/pytest /Users/michal/.openclaw/workspace/km-system/tests/integration/test_deliberation_v2_e2e.py -q -k 'test_real_producer_listener_to_ready_to_send_is_deterministic_and_audited or test_composed_send_uses_real_public_plugin_adapter_once_and_persists_fake_receipt or test_public_plugin_adapter_rejects_target_mismatch_without_fake_send'
```

Result: exit code 1, 1 failed, 2 passed, 38 deselected. The failing owner assertion expects persisted `messages` without `pipelineId` and `deliveryTarget`; the verified owner contract and current KM persistence require and emit both. OpenClaw cannot omit those fields without violating the verified owner artifacts, so no KM assertion or OpenClaw wire contract was weakened.

## Safety And Cleanup

- No KM source, Git metadata, service, credential, configuration, or production spool was modified.
- No service repair/restart, deployment, KM build/link/install, Gateway restart, live provider send, or pilot activation occurred.
- Integration state used temporary credentials, loopback port, temporary SQLite/spool state, and cleanup guards.
- The owner-backed run passed both explicit cleanup checks and production-state exclusion checks.
