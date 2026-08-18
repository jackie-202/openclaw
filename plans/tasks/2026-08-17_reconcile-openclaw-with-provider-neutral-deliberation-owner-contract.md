---
title: Reconcile OpenClaw with provider-neutral Deliberation owner contract
type: implementation
---

# Reconcile OpenClaw with provider-neutral Deliberation owner contract

Consume the KM owner contract produced by task 1 of batch `deliberation-provider-neutral-contract-convergence-2026-08-17`, retain concrete provider policy in OpenClaw overlays/adapters, and refresh provenance only after canonical cross-repository verification succeeds.

## Shared contract decision

This decision is authoritative for both tasks in the batch:

- `deliveryTarget` remains structured.
- Generic identity fields are camelCase `provider`, `account`, and `channel`.
- `threadId` is an optional generic destination component.
- The generic wire must not enumerate concrete providers such as `discord | slack`.
- The generic wire must not require `threadId` for every destination or define provider-specific ID formats.
- Provider allowlists, provider-specific identifier validation, and rules determining whether `threadId` is required belong to OpenClaw provider overlays/adapters.
- `sourceThreadId` remains distinct from destination thread identity.
- Drafting-only isolation, source-channel send fencing, memory/write guards, and fake/no-network test behavior must remain intact.

## Scope and approved dependency

Primary write scope is only `/Users/michal/Projects/openclaw-fork`.

The KM checkout `/Users/michal/.openclaw/workspace/km-system` is an explicitly approved read-only verification dependency. Read only the canonical owner files, immutable repository metadata needed for their accepted revision, and outputs needed by the canonical cross-repository verifier. Do not modify KM files, state, listener, database, config, or scripts.

## Required changes

1. Read the completed owner contract from task 1 and compare it semantically against `extensions/deliberation/contracts/km-wire-v1.json`.
2. Reconcile the generic mirror with the provider-neutral owner contract.
3. Keep Discord/Slack provider enumeration, destination ID validation, and conditional thread requirements in `openclaw-overlay-v1.json`, provider adapters, or equivalent provider-owned validation—not in the generic mirror.
4. Preserve canonical source identity `v1:<provider>:<account>:<channel>` and separation of `sourceThreadId` from destination `threadId`.
5. Update fixtures and tests to cover threaded and non-threaded generic targets plus provider-specific overlay validation.
6. Only after semantic compatibility is proven, update `extensions/deliberation/contracts/provenance.json` to the exact current KM owner revision and exact SHA-256 hashes for:
   - `contracts/deliberation-v2/v1/contract.json`
   - `contracts/deliberation-v2/v1/fixtures.json`
7. Run the canonical verifier:

```bash
OPENCLAW_DELIBERATION_KM_ROOT=/Users/michal/.openclaw/workspace/km-system \
  pnpm test:deliberation:km-integration
```

It must reach and pass all seven integration tests; merely clearing provenance preflight is insufficient.
8. Do not call real providers/transports and do not weaken guards or delivery fencing.
9. Do not restart gateway, listener, plugin, or any service. Do not deploy, merge, or perform live smoke. Jackie owns host deploy verification, full gateway restart, and live smoke after the batch completes.

## Acceptance criteria

- Generic OpenClaw wire matches the provider-neutral KM owner semantics.
- Concrete provider rules remain in OpenClaw-owned overlays/adapters.
- Canonical cross-repository verifier passes 7/7.
- Focused Deliberation contract, overlay, adapter, drafting-continuation, and delivery-fence tests pass.
- Provenance contains the exact current owner revision and hashes only after semantic verification.
- Final note records exact commands/results and states the remaining rollout: host deploy verifier → full gateway restart → live smoke.

## Fail-closed condition

If task 1 did not produce an immutable compatible owner revision, or semantic comparison remains incompatible, do not refresh provenance. Report the precise mismatch without weakening either side of the contract.
