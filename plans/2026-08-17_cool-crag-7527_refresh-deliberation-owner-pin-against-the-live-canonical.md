# Plan 2026-08-17: Refresh Deliberation owner pin against the live canonical KM contract

Refresh the accepted KM provenance only after the live owner contract is proven semantically compatible with OpenClaw's generic mirror and provider overlay.

## Analysis

### Codebase Context

- `extensions/deliberation/contracts/provenance.json` currently pins obsolete `401ababdd3` and historical owner hashes, while its five local mirror hashes remain independent integrity evidence.
- `extensions/deliberation/src/contract.test.ts` recomputes the local hashes and separately asserts the obsolete accepted revision and owner file map.
- `extensions/deliberation/scripts/km-listener.cross-repo.ts` validates `ownerFiles` before starting seven integration assertions. Its fixture uses a temporary spool, rejects production-spool overlap before SQLite access, uses loopback only, and substitutes a fake provider.
- `extensions/deliberation/contracts/km-wire-v1.json` is the generic KM wire mirror. `extensions/deliberation/contracts/openclaw-overlay-v1.json` intentionally owns Discord/Slack adapter constraints.
- The approved KM checkout could not be read in this planning session because workspace external-directory permission enforcement blocked the supplied read-only path. The plan therefore does not infer a revision or semantic result from the obsolete OpenClaw pin.

### Documentation

- `extensions/AGENTS.md` requires preserving the plugin boundary. This repair changes provenance metadata and its focused assertion only.
- `extensions/deliberation/README.md` defines the cross-repository harness as loopback-only with disposable state and a production-spool rejection.
- No relevant PlantUML documentation exists under `docs/`.

### Knowledge Base

- `learnings/architecture/2026-07-29_acceptance-fix-plans-must-close-contract-gates-explicitly.md`: use genuine pre-edit and post-edit proof, not historical green evidence.
- `learnings/architecture/2026-07-29_contract-gated-plans-should-name-absent-audit-artifacts.md`: preserve missing external evidence as a blocking condition rather than guess.
- `learnings/architecture/2026-07-28_wire-protocol-versions-are-not-implementation-generations.md`: retain the current v1 wire naming; do not treat it as legacy behavior.

## Approach

Keep the repair limited to the provenance pin and its local assertion. First establish the current immutable KM `HEAD` and compare owner semantics against the generic mirror and provider overlay. Only a compatible comparison permits the hash/revision refresh; any missing metadata or semantic incompatibility writes a precise blocked checkpoint and leaves the manifest unchanged.

## Implementation

1. Use only the approved read-only KM root. Confirm both owner files are tracked at a clean `git rev-parse HEAD` with `git status --porcelain -- <two owner paths>` and `git ls-tree -r HEAD -- <two owner paths>`; record the full `HEAD` as the accepted immutable revision. Do not use per-file historical log entries or an OpenClaw baseline revision.
2. Compare the KM `contract.json` to `km-wire-v1.json` by semantics, recording separately from hashes: camelCase keys and `sourceThreadId` grammar/requiredness; generic structured `deliveryTarget`; reservation-only legacy string input; structured lifecycle outputs; endpoints, controls, schema closure, source-channel domain, fencing, and drafting-only/write guards.
3. Compare the KM `fixtures.json` to `cutover-controls-v1.json` by semantic vectors: source-thread identity remains separate from provider event identity; source-target grouping remains account/channel scoped; synthetic request/response cases retain source-channel send fencing, memory/write guards, and no real provider behavior. Confirm `openclaw-overlay-v1.json` remains provider-specific and is not folded into the KM wire.
4. Stop without edits if the exact `HEAD` cannot be proven, either owner hash differs from the task-approved values, or any required semantic invariant differs. Write `plans/checkpoints/cool-crag-7527.blocked.md` with the specific field/path and evidence gap; do not substitute `401ababdd3` or do a hash-only refresh.
5. After compatibility passes, update the expected revision/map in `extensions/deliberation/src/contract.test.ts` first, using the immutable KM `HEAD` and the exact approved hashes. Run the focused test and capture the expected RED against the old manifest.
6. Update only `extensions/deliberation/contracts/provenance.json`: replace `acceptedRevision` and both `ownerFiles` values; retain its semantic scope, source declarations, five local `files` hashes, and the generic-mirror/provider-overlay split.
7. Rerun the local contract test, then run the canonical verifier with `OPENCLAW_DELIBERATION_KM_ROOT=/Users/michal/.openclaw/workspace/km-system pnpm test:deliberation:km-integration`. Require seven passing tests and assertions beyond the provenance preflight.
8. Run the focused Deliberation contract test command and `git diff --check`. Do not restart services, deploy, call a real provider or transport, commit, push, open a PR, or merge.
9. Record the semantic comparison separately from byte/hash evidence in `plans/checkpoints/cool-crag-7527.semantic-comparison.md`, including the verified `HEAD`, both file hashes, the invariants checked, and the seven-test integration summary. State that the remaining rollout sequence is: host deploy verifier -> full gateway restart -> live smoke.

## Files To Modify

| File | Change |
| --- | --- |
| `extensions/deliberation/contracts/provenance.json` | Replace only the accepted KM revision and two owner-file SHA-256 values after the semantic gate passes. |
| `extensions/deliberation/src/contract.test.ts` | Replace the obsolete revision/map assertion with the exact current immutable owner pin. |
| `plans/checkpoints/cool-crag-7527.semantic-comparison.md` | Record semantic compatibility independently from revision/hash evidence and verification results. |
| `plans/checkpoints/cool-crag-7527.blocked.md` | Create only when the immutable-evidence or semantic gate fails; leave product files unchanged. |

## TDD

**Workflow for the implementing agent:** use `skill:tdd`; edit the focused assertion first, run RED, update the manifest, then run GREEN. Capture proof in `plans/checkpoints/cool-crag-7527.red-green-proof.md`.

**Test file:** `extensions/deliberation/src/contract.test.ts`

**Run command:** `pnpm test extensions/deliberation/src/contract.test.ts -- --reporter=verbose`

**Edit location:** replace the expectations in `it("pins the accepted KM owner revision and owner files")` after step 1 establishes `<verified-km-head>`.

```ts
const provenance = JSON.parse(await readFile(join(contractDir, "provenance.json"), "utf8")) as {
  acceptedRevision: string;
  ownerFiles: Record<string, string>;
};

expect(provenance.acceptedRevision).toBe("<verified-km-head>"); // RED: currently 401ababdd3
expect(provenance.ownerFiles).toEqual({
  "km-system/contracts/deliberation-v2/v1/contract.json":
    "73e0a731064201ffe51ad5a19b048b43b513007b523f72acfff328c254dd6171",
  "km-system/contracts/deliberation-v2/v1/fixtures.json":
    "756bd7ff380fef8b537ae1c5495d96ccdbe2f57a4e1ab54911ea3047c12e892f",
}); // RED: currently historical owner hashes
```

| Test | RED | GREEN |
| --- | --- | --- |
| accepted revision and owner map | Old manifest fails the new exact revision/map assertion. | Manifest has the verified current KM `HEAD` and both exact owner hashes. |

## Verification

1. `pnpm test extensions/deliberation/src/contract.test.ts -- --reporter=verbose`
2. `OPENCLAW_DELIBERATION_KM_ROOT=/Users/michal/.openclaw/workspace/km-system pnpm test:deliberation:km-integration`
3. Confirm the integration output reports all seven tests passing, not just no `provenance:` mismatch.
4. `git diff --check`

## Dependencies

- Read-only access to `/Users/michal/.openclaw/workspace/km-system` for its two approved owner files and bounded Git metadata.
- The KM checkout's listener and `.venv/bin/python3`, required by the canonical isolated integration verifier.

---
*Status: DRAFT*
