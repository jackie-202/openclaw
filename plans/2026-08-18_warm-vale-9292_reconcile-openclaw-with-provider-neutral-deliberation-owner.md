# Plan 2026-08-18: Close Deliberation provenance and final-note acceptance evidence

Record reproducible post-implementation evidence for the already-preserved provider-neutral reconciliation without changing its runtime behavior.

## Analysis

### Codebase Context

- `extensions/deliberation/contracts/provenance.json` already records accepted revision `quick-cove-1601` and the two required owner SHA-256 entries, but no supplied artifact establishes that this exact pin followed semantic verification.
- `extensions/deliberation/src/contract.test.ts` verifies local mirror hashes and the generic provider-neutral target/overlay split; it does not assert the owner revision or `ownerFiles` map.
- `extensions/deliberation/scripts/km-listener.cross-repo.ts:56-73` validates every `provenance.ownerFiles` entry against the configured KM checkout before executing the isolated seven-test suite.
- `plans/checkpoints/cool-vale-1698.red-green-proof.md` contains the genuine parent RED/GREEN contract proof. Reuse it as inherited evidence; do not manufacture a new RED.
- `plans/checkpoints/cool-vale-1698.checkpoint.md` reports aggregate verification only. It must not be treated as the required auditable final note.
- The worktree contains extensive preserved and unrelated edits. Restrict this repair to new task-scoped evidence artifacts unless fresh verification proves a concrete provenance defect.

### Relevant Documentation

- `plans/2026-08-18_cool-vale-1698_reconcile-openclaw-with-provider-neutral-deliberation-owner.md` requires semantic verification before provenance refresh and lists the focused suite, canonical verifier, build, scoped format/lint, and autoreview.
- `plans/checkpoints/calm-dune-9914.final-note.md` demonstrates the established Deliberation evidence-note structure, but this repair needs command/result records and the complete ordered rollout statement.

### Knowledge Base

- `learnings/architecture/cool-vale-1698-provider-neutral-contract-verification.md`: compare owner semantics before refresh, preserve generic wire/provider overlay separation, run all seven isolated verifier tests, and distinguish source from destination thread identity.
- `learnings/tooling/acceptance-retries-separate-inherited-work-from-target-tdd-proof.md`: map inherited changes first; retain historical genuine RED rather than reconstructing it.
- `learnings/architecture/2026-07-28_residue-audits-require-activation-proof.md`: source inventory alone is insufficient; retain external-authority limits instead of overstating proof.
- Knowledge search used local fallback because collection `openclaw-fork-learnings` was unavailable; relevant sparse auto-extracted authority learnings supplied no additional actionable rule.

## Available Skills

- `task-evidence`: extract exact parent-session commands and outcomes for the acceptance note.
- `openclaw-testing`: select and run fresh narrow verification without fanning out to unrelated worktree changes.
- `autoreview`: run the required fresh closeout review if any code or contract artifact changes.
- `save-learning`: save the acceptance-evidence lesson as the final task action.

## Solution

Create two task-scoped evidence artifacts after a fresh semantic gate: one records the exact current KM revision, both owner hashes, parsed invariants, and command ordering; the other records every fresh verification command and result plus the required rollout sequence. Leave `provenance.json` unchanged if its exact values match the verified owner snapshot; update it and its test only if they differ.

## Implementation

1. Read the inherited RED/GREEN proof and current `provenance.json`; record them as historical evidence, not fresh task proof.
2. Inspect the configured KM checkout directly: require clean tracked owner files at immutable `HEAD`, capture `HEAD` plus SHA-256 for `contract.json` and `fixtures.json`, and compare the owner target schema, lifecycle references, source identity, `sourceThreadId`, and fixture vectors against the provider-neutral mirror and overlay.
3. Run the semantic-focused Deliberation suite before touching provenance. If semantic comparison or focused proof fails, leave provenance unchanged and write a precise blocker instead of pinning hashes.
4. When the semantic gate passes, compare the captured revision and two hashes with `provenance.json`. Update only mismatched `acceptedRevision`/`ownerFiles` values and add or retain a focused assertion for the exact owner map if absent; otherwise make no product or contract change.
5. Write `plans/checkpoints/warm-vale-9292.semantic-comparison.md` after the passing semantic gate. Include immutable revision, both named hashes, checked invariants, the exact command/result, and an explicit statement that the manifest refresh or verification occurred afterward.
6. Run fresh focused tests, the canonical KM verifier, scoped formatting/lint, build, proof checks, and autoreview as applicable. Capture each exact command, exit status, and numeric result.
7. Write `plans/checkpoints/warm-vale-9292.final-note.md` with the provenance values, inherited parent RED/GREEN link, fresh command/result ledger, test counts, and the exact remaining rollout order: `host deploy verifier -> full gateway restart -> live smoke`. State that no deployment, restart, or live transport call occurred.
8. Do not modify prior checkpoint/proof artifacts, restart services, deploy, or invoke a real provider. Run `skill:save-learning` only after all artifacts and verification are complete.

## Files to Modify

| File | Change |
|---|---|
| `extensions/deliberation/contracts/provenance.json` | Update only if direct semantic verification proves its revision or either owner hash differs. |
| `extensions/deliberation/src/contract.test.ts` | Assert the exact current owner pin only if the existing test lacks executable coverage for a corrected manifest. |
| `plans/checkpoints/warm-vale-9292.semantic-comparison.md` | Add ordered semantic-gate, revision, and owner-hash evidence. |
| `plans/checkpoints/warm-vale-9292.final-note.md` | Add exact fresh verification commands/results and the required rollout sequence. |

## TDD: skip

This is an evidence-repair task over preserved behavior: reuse `plans/checkpoints/cool-vale-1698.red-green-proof.md` and record fresh GREEN verification; a new RED would be fabricated because the parent implementation already exists.

## Dependencies

- Read-only KM checkout at `OPENCLAW_DELIBERATION_KM_ROOT` with clean tracked owner files and its listener Python environment.
- The owner snapshot must remain semantically compatible with the generic mirror; hash equality alone is not sufficient.
- Existing test lock availability; do not interrupt a user-owned heavy-check process.

*Status: DRAFT*
*Created: 2026-08-18*
