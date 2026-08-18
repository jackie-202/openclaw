# Plan 2026-08-17: Converge Deliberation contract provenance and rollout readiness

Validate and, only with repository-local proof, resolve the Deliberation v2 provenance owner pin while preserving the converged wire and runtime safety boundaries.

*Status: DRAFT*
*Created: 2026-08-17*

---

## Progress

- [x] Phase 0: initialize canonical plan path
- [x] Phase 1: inspect repository-local contract and validator evidence
- [x] Phase 2: incorporate relevant learnings
- [x] Phase 3: synthesize implementation and verification steps

## Analysis

### Codebase Context

- `extensions/deliberation/contracts/provenance.json` pins all five supplied local artifact hashes but intentionally has only `{ status: "follow-up-required", followUp }` for `ownerPin`.
- `extensions/deliberation/src/contract.test.ts` recomputes every `files` SHA-256 and separately asserts the current unresolved owner-pin object. It proves the converged camelCase `sourceThreadId`, generic durable target mirror, and retained provider-specific overlay without calling external services.
- `extensions/deliberation/contracts/km-wire-v1.json`, `cutover-controls-v1.json`, `source-identity-v1.json`, and `source-identity-fixtures-v1.json` are the KM semantic mirror; `openclaw-overlay-v1.json` explicitly confines Discord/Slack destination validation to OpenClaw.
- `extensions/deliberation/scripts/km-listener.cross-repo.ts` consumes the manifest for cross-repository listener checks, so its accepted `ownerPin` parsing must be inspected before any manifest shape is proposed.

### Documentation And Plans

- `plans/2026-08-17_quick-reef-1568_converge-openclaw-deliberation-intake-and-mirrored-km.md` records the semantic convergence and explicitly retained an unresolved owner revision/hash because the handoff lacked exact owner provenance.
- `plans/checkpoints/cool-wave-8241.final-note.md` repeats that the semantic handoff did not authorize fabricating a replacement owner revision or owner-file hashes.
- `docs/plugins/reference/deliberation.md` documents fail-closed source isolation, trusted reservation-only delivery-target override, durable target equality, and no provider send before a valid reservation/invocation.
- No Deliberation PlantUML diagram is present under `docs/`.

### Knowledge Base

- `learnings/architecture/deliberation-provenance-pass-can-still-block-future-wire-shape.md` requires semantic verification before hashes and forbids deriving absent owner-contract fields from prose.
- `learnings/architecture/deliberation-readiness-evidence-gate.md` separates hermetic OpenClaw proof from external-owner rollout readiness; report the absent artifact rather than synthesize it.
- `learnings/architecture/contract-gated-deliberation-missing-km-authority.md` requires a precise fail-closed checkpoint with unchanged production behavior when immutable owner authority is absent.
- `learnings/architecture/2026-07-29_acceptance-fix-plans-must-close-contract-gates-explicitly.md` requires either accepted immutable owner evidence and a real RED/GREEN cycle, or explicit task-owner acceptance of the blocked outcome.
- `recall-knowledge` used its local backend because the `openclaw-fork-learnings` QMD collection is unavailable; its selected authority learnings were read. The remaining selected auto-extracted files add no actionable rule beyond their titles.

## Available Skills

- `tdd`: use only if implementation adds a behavioral regression test beyond the existing provenance validation suite.
- `save-learning`: record the provenance-validation and fail-closed planning lesson as the final task action.

## Solution

Treat provenance pinning as an evidence gate, not a hash refresh. The supplied five hashes establish current local artifact integrity, while semantic compatibility is already covered by the contract mirror and focused tests. They do not provide the owner revision or the owner-relative file-to-hash map required by `km-listener.cross-repo.ts`; no repository-local artifact supplies those values. Keep `provenance.json` unresolved unless the implementation receives those exact owner fields through an allowed task handoff.

## Implementation

1. Re-run the local semantic gate before touching provenance: verify the accepted camelCase `sourceThreadId`, generic KM `deliveryTarget`, reservation-only legacy input, and separate OpenClaw Discord/Slack overlay in `extensions/deliberation/src/contract.test.ts`; confirm all five SHA-256 values match the mirror files.
2. Inspect the effective manifest consumers before choosing a JSON shape: `contract.test.ts` is the local integrity/semantic assertion, while `scripts/km-listener.cross-repo.ts` requires a non-empty `ownerFiles` map whose keys are `km-system/`-relative owner paths and values are SHA-256 hashes.
3. Require an allowed evidence bundle containing the exact owner revision identifier and every `ownerFiles` path/hash pair. Do not treat `quick-reef-1568`, `dark-reef-5873`, the 37/37 E2E result, or the five local mirror hashes as substitutes for either field.
4. If the bundle is present, update only `contracts/provenance.json` with its exact accepted owner pin and owner-file map; preserve camelCase names, existing local `files` hashes, scope, and all semantic/runtime artifacts. Update the provenance assertion in `src/contract.test.ts` to require exactly that accepted shape and reject the old follow-up state.
5. If either owner revision or owner-file path/hash map is absent, leave `provenance.json` and contract assertions unchanged. Create `plans/checkpoints/fresh-brook-6923.blocked.md` naming the missing field(s), stating that local hash evidence is not owner provenance, and requesting the immutable owner bundle or an explicit accepted-blocked decision.
6. On the accepted-pin path, create `plans/checkpoints/fresh-brook-6923.final-note.md` with the exact owner revision, owner-file map, local artifact hashes, semantic evidence versus hash evidence, and verification outcomes. State that Jackie must perform a full gateway restart, not a plugin-only reload, followed by the live smoke; do not restart, deploy, merge, or call a real provider/transport.

## Verification

1. First run `pnpm test extensions/deliberation/src/contract.test.ts -- --reporter=verbose`; record command, exit code, and test count in the final or blocked checkpoint.
2. Run `pnpm test extensions/deliberation -- --reporter=verbose` to cover the focused plugin contract, guard, and fake-adapter tests without real network/provider/transport calls.
3. Run `pnpm tsgo:extensions` as the smallest broader extension check used by the preceding Deliberation convergence evidence.
4. Run `git diff --check`; verify only provenance and its targeted local assertion changed on the accepted-pin path, or no contract artifacts changed on the blocked path.
5. Do not run `test:deliberation:km-integration`, KM scripts, listener operations, service restarts, deployment, or Git operations for this task.

## Files To Modify

| File | Change |
| --- | --- |
| `extensions/deliberation/contracts/provenance.json` | Accepted-pin path only: replace the unresolved pin with owner-supplied exact revision and `ownerFiles` entries; otherwise leave unchanged. |
| `extensions/deliberation/src/contract.test.ts` | Accepted-pin path only: assert the supplied manifest shape and reject `follow-up-required`. |
| `plans/checkpoints/fresh-brook-6923.final-note.md` | Record accepted-pin evidence, verification, and the restart-owned rollout handoff. |
| `plans/checkpoints/fresh-brook-6923.blocked.md` | Alternative fail-closed closeout if the owner revision or owner-file map is absent. |

## TDD: skip

The repair is a pinned JSON manifest change covered by the existing contract test; adding a RED test before the required owner evidence would force an invented schema.

## Dependencies

- Supplied external owner evidence only; do not inspect KM, invoke KM tools, or derive owner fields from the local mirror.
- Required accepted-pin input: exact owner revision plus `ownerFiles` entries mapping each owner-relative file path to its SHA-256. This input is currently absent from the task evidence and repository-local artifacts.
- `quick-reef-1568` proves semantic convergence; the five supplied hashes prove local mirror integrity; neither proves the missing owner identity.

---

*Created: 2026-08-17*
*Status: DRAFT*
