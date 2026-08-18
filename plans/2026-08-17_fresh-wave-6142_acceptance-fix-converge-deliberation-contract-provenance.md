# Plan 2026-08-17: Deliberation Validator Acceptance Evidence

Capture the missing repository-local KM validator acceptance for the already-restored owner provenance; do not change production code unless that run exposes a real defect.

## Analysis

### Parent Evidence

- `extensions/deliberation/contracts/provenance.json` already contains accepted revision `401ababdd3`, both immutable `ownerFiles` hashes, and no unresolved `ownerPin`.
- `plans/checkpoints/calm-dune-9914.red-green-proof.md` supplies the historical genuine RED and focused GREEN. Reuse it as inherited proof; do not manufacture a new RED.
- `plans/checkpoints/calm-dune-9914.final-note.md` explicitly says the full gateway/KM validation was not run, which is the unmet acceptance evidence.
- `plans/checkpoints/acceptance-runs/calm-dune-9914-acceptance-001-evidence-repair-001/repair.json` is an escalated task-evidence repair with no validator result; it cannot close the gate.

### Repository Validator

- `package.json:1769` maps `test:deliberation:km-integration` to `extensions/deliberation/scripts/km-listener.cross-repo.ts`.
- `extensions/deliberation/scripts/km-listener.cross-repo.ts:54-71` resolves `OPENCLAW_DELIBERATION_KM_ROOT`, requires the KM listener and Python environment, then rejects missing or mismatched manifest `ownerFiles` before the integration tests execute.
- `extensions/deliberation/README.md:3-18` documents that command as the real isolated KM-listener test; this is the repository-local validator required by the finding.

### Knowledge Base

- `learnings/architecture/calm-dune-9914-recover-owner-pins-from-baselines.md` keeps semantic handoff, owner provenance, and local hashes as separate evidence classes and preserves the genuine parent RED/GREEN.
- `learnings/architecture/2026-07-29_acceptance-fix-plans-must-close-contract-gates-explicitly.md` requires fresh GREEN against accepted immutable owner evidence; a prior blocked state is not closure.
- `learnings/tooling/acceptance-retries-separate-inherited-work-from-target-tdd-proof.md` requires preserved worktree mapping and historical-proof reuse rather than reconstructed RED evidence.
- `recall-knowledge` used the local backend because `openclaw-fork-learnings` is unavailable; its other returned authority learnings were empty auto-extracted stubs or unrelated to this evidence-only gate.

## Available Skills

- `openclaw-testing`: select and record the authoritative KM integration command.
- `task-evidence`: preserve the parent RED/GREEN provenance in the follow-up artifact.
- `acceptance`: generate the canonical Test Gate/acceptance artifact when its run manifest is available.
- `save-learning`: record the evidence-artifact lesson last.

## Implementation

1. Inspect the preserved manifest, parent RED/GREEN proof, and `km-listener.cross-repo.ts` without modifying production files. Confirm the current map retains revision `401ababdd3`, the two owner hashes, and no `ownerPin`.
2. Obtain the trusted KM checkout through the existing `OPENCLAW_DELIBERATION_KM_ROOT`; verify it resolves to the intended owner source and contains the listener, Python environment, and both owner-relative files. If it is unavailable or its revision/hash differs, write a blocked Test Gate artifact with the exact failed prerequisite and stop. Do not substitute a mirror, local artifact, or semantic handoff.
3. Run `OPENCLAW_DELIBERATION_KM_ROOT=<trusted-km-root> pnpm test:deliberation:km-integration` once. Capture its complete command, exit code, test summary, and the absence of every `provenance:` failure in a new canonical `fresh-wave-6142` Test Gate artifact.
4. Create `plans/checkpoints/fresh-wave-6142.final-note.md` that links the parent historical RED/GREEN proof and the fresh validator/Test Gate artifact. Separate inherited manifest repair from the fresh owner-checkout validation; state that validator success proves the manifest is accepted and does not replace rollout or live transport evidence.
5. Run `git diff --check` and inspect the scoped evidence-only diff. If the validator reports a concrete manifest defect, make the smallest manifest/test repair, rerun the same validator, and record the new outcome; otherwise leave production files untouched.

## Files to Modify

| File | Change |
| --- | --- |
| `plans/checkpoints/fresh-wave-6142.test-gate.md` | Record the authoritative KM validator command, trusted-checkout prerequisites, complete result, and acceptance conclusion. |
| `plans/checkpoints/fresh-wave-6142.final-note.md` | Link inherited RED/GREEN evidence and fresh Test Gate evidence; distinguish validator acceptance from rollout readiness. |
| `extensions/deliberation/contracts/provenance.json` | Modify only if the real validator identifies a manifest defect. |
| `extensions/deliberation/src/contract.test.ts` | Modify only with a real manifest repair, to preserve the accepted-pin invariant. |
| `learnings/<generated-by-save-learning>.md` | Save the post-verification evidence lesson as the final task action. |

## TDD: skip

This evidence-only follow-up must reuse the parent genuine RED and capture a fresh validator GREEN; adding a test would not establish acceptance by the required trusted-KM validator.

## Dependencies

- A trusted KM checkout supplied through `OPENCLAW_DELIBERATION_KM_ROOT`; never log credentials or private paths in public evidence.
- The existing `pnpm test:deliberation:km-integration` command and its isolated listener prerequisites.
- If a canonical acceptance-run manifest is present, use `skill:acceptance` to emit its Test Gate reference instead of treating the final note as the gate.

---

*Status: DRAFT*
