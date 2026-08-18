---
title: Refresh Deliberation owner pin against the live canonical KM contract
type: implementation
---

# Refresh Deliberation owner pin against the live canonical KM contract

Repair the remaining Deliberation v2 provenance drift using the existing canonical cross-repository verifier. The previous repair restored a historical owner pin from OpenClaw `HEAD`; that was insufficient because the current KM owner contract has moved.

## Scope and authority

Primary write scope is only `/Users/michal/Projects/openclaw-fork`.

The following KM checkout is an explicit **read-only verification dependency** for this task:

`/Users/michal/.openclaw/workspace/km-system`

Do not modify that checkout, its state, listener, database, config, or scripts. Do not search unrelated repositories. Use it only through the canonical verifier command below and for bounded read-only semantic comparison of these two owner files:

- `contracts/deliberation-v2/v1/contract.json`
- `contracts/deliberation-v2/v1/fixtures.json`

## Current evidence

Current KM owner hashes, verified on 2026-08-17:

- `contracts/deliberation-v2/v1/contract.json`: `73e0a731064201ffe51ad5a19b048b43b513007b523f72acfff328c254dd6171`
- `contracts/deliberation-v2/v1/fixtures.json`: `756bd7ff380fef8b537ae1c5495d96ccdbe2f57a4e1ab54911ea3047c12e892f`

Current manifest incorrectly pins historical revision `401ababdd3` with hashes `c5ea7d...` and `afe531...`.

The canonical verifier exists in OpenClaw as:

```bash
OPENCLAW_DELIBERATION_KM_ROOT=/Users/michal/.openclaw/workspace/km-system \
  pnpm test:deliberation:km-integration
```

Its current result is seven failures at the provenance preflight, all beginning with:

`provenance: KM owner hash mismatch: contracts/deliberation-v2/v1/contract.json`

The verifier has not yet reached the seven integration assertions.

## Required implementation

1. Compare the current KM owner contract/fixtures against OpenClaw's mirrored generic contract and provider-overlay split. Establish semantic compatibility; do not treat matching filenames or fresh hashes as sufficient evidence.
2. Preserve the accepted architecture:
   - JSON wire names stay camelCase.
   - `sourceThreadId` remains distinct from provider thread identity.
   - generic KM wire stays separate from the OpenClaw provider overlay.
   - drafting-only isolation, source-channel send fencing, memory/write guards, and no-real-provider test isolation remain unchanged.
3. Determine the exact current immutable KM revision through bounded read-only repository metadata for the two owner files. Do not reuse a historical OpenClaw baseline revision.
4. Only after semantic compatibility is established, update `extensions/deliberation/contracts/provenance.json` with the current accepted revision and exact current two-entry `ownerFiles` map.
5. Update any repository-local focused assertion that intentionally pins the accepted revision/owner map.
6. Run the canonical verifier. It must pass all seven tests and must reach the integration assertions; merely clearing the provenance preflight is insufficient.
7. Run focused OpenClaw Deliberation contract tests and `git diff --check`.
8. Do **not** restart the gateway, listener, plugin, or any service. Do not perform deployment, live transport calls, git commits, pushes, PRs, or merges. Jackie will run deploy verification, restart the whole gateway, and perform live smoke after this task is green.

## Acceptance criteria

- Semantic comparison is recorded separately from byte/hash comparison.
- `provenance.json` contains the current exact owner revision and current exact owner file hashes.
- `pnpm test:deliberation:km-integration` passes all seven tests against the explicitly approved KM root.
- Focused contract/provenance tests pass.
- No real external provider or transport is called.
- Final note explicitly says the remaining rollout sequence is: host deploy verifier → full gateway restart → live smoke.

## Fail-closed condition

If the current owner revision cannot be established or semantic comparison finds an incompatible change, do not refresh the manifest. Record the precise incompatibility or missing immutable evidence. Do not substitute a historical pin or a hash-only refresh.
