---
title: Converge Deliberation contract provenance and rollout readiness
type: implementation
---

# Converge Deliberation contract provenance and rollout readiness

Repair the remaining OpenClaw-owned Deliberation v2 deployment gate after semantic contract convergence. The current `extensions/deliberation/contracts/provenance.json` is rejected because `ownerPin.status` remains `follow-up-required`, while the KM deterministic E2E is already green (37/37) and the listener source now matches disk after restart.

## Scope boundary

Work only inside `/Users/michal/Projects/openclaw-fork`. Do not inspect or modify the KM repository or external config. All required external owner evidence is embedded below. If it is insufficient to establish the exact accepted provenance shape, fail closed and state the missing field rather than crossing repository boundaries or refreshing hashes speculatively.

## Authoritative external evidence

- Semantic convergence task: `quick-reef-1568` (`done`).
- KM implementation/E2E task: `dark-reef-5873` and its completed follow-ups.
- KM deterministic Deliberation E2E result: `37 passed`.
- KM registered gate then ran `8428 passed, 4 skipped` and failed only at `tests/test_deliberation_contract_provenance.py::test_live_pins_match_current_km_contracts` because this fork's provenance manifest is invalid.
- Isolated live-pins selector reproduced the same external-manifest failure.
- Current OpenClaw contract file hashes recorded by the manifest:
  - `km-wire-v1.json`: `8fa171dacaca99d36684a310308e36e46598782a19265cffd103eee9e3e0dc5b`
  - `cutover-controls-v1.json`: `da2c9b719b852bd4fa3d1ea8ee1dd13e43a88b78c41f5028e2099fc8b2eedc93`
  - `openclaw-overlay-v1.json`: `843c764a29cee3578ee8ebf0b4a4fb22b03c2528f62220177297da831c6864c8`
  - `source-identity-v1.json`: `252f03184601f2f2fa8752c5df1b4bb7dd4a20b90bd47c932eee09b9c0bc3af6`
  - `source-identity-fixtures-v1.json`: `8e4f0373b5d986cb8098fbc7bf3565cfd3f88ef9b83e7189f4bbb53299a427fb`
- The deployed install is a symlink to this checkout. Listener source drift was separately resolved; this task must not restart services.

## Requirements

1. Inspect repository-local provenance schema, validators, tests, plans/checkpoints, and accepted contract artifacts to determine the exact valid pinned-manifest shape.
2. Verify semantic compatibility before changing provenance. A hash-only refresh is not a repair.
3. Replace the unresolved `ownerPin.status: follow-up-required` state only when repository-local accepted evidence supports the exact owner revision and file hashes expected by validators.
4. Keep JSON wire names camelCase. Do not add snake_case aliases.
5. Do not change or weaken memory/write guards, drafting-only isolation, source-channel send fencing, or external-provider protections.
6. Do not call real external providers or transports in tests.
7. Do not perform gateway/listener restarts, deployment, git operations, or merge operations. Produce verified rollout readiness; Jackie owns the later restart and live smoke.
8. If exact owner identity cannot be proven from the supplied evidence plus repository-local artifacts, fail closed with a precise blocker and leave `provenance.json` unresolved.

## Acceptance criteria

- Repository-local provenance/contract tests pass.
- The manifest is accepted by the repository-local validator and no longer reports `invalid provenance manifest`.
- Every pinned file hash matches its current repository file.
- The final note distinguishes semantic evidence from hash evidence and records the exact accepted owner pin.
- Focused Deliberation tests pass without real network/provider/transport calls.
- A concise rollout note states that a full gateway restart—not a plugin-only reload—is the remaining deployment step.

## Verification

Run the smallest repository-local validator/provenance test first, then the focused Deliberation contract suite and the smallest relevant broader suite. Record exact commands, exit codes, and results. Do not invoke KM scripts or inspect KM files.
