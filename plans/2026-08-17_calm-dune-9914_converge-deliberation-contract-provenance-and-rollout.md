# Plan 2026-08-17: Converge Deliberation provenance acceptance

Restore the owner pin removed by the prior convergence, reconcile every current local hash, and leave a precise acceptance handoff.

## Analysis

### Codebase Context

- `extensions/deliberation/contracts/provenance.json` currently has a follow-up `ownerPin`, but `git show HEAD:.../provenance.json` records the accepted immutable owner pin: revision `401ababdd3`, `km-system/contracts/deliberation-v2/v1/contract.json` SHA-256 `c5ea7d1514b8834368d90bed51f0f9f99772b0b59ab885a4a67bccb78775cbd5`, and `km-system/contracts/deliberation-v2/v1/fixtures.json` SHA-256 `afe531da034209a8a329b6af24d40381cc06cc0a93406ca274c99564eb4d5d34`.
- `extensions/deliberation/scripts/km-listener.cross-repo.ts:60-70` loads `ownerFiles` and compares each owner-relative SHA-256 against the configured KM checkout; the unresolved manifest cannot reach that check.
- `extensions/deliberation/src/contract.test.ts:10-20` recomputes local mirror hashes. Its current final assertion explicitly requires the unresolved owner pin, so it must switch to the restored accepted revision and complete owner-file map.
- Current local hashes already match `provenance.json` for the five pinned artifacts, including `cutover-controls-v1.json` at `da2c9b719b852bd4fa3d1ea8ee1dd13e43a88b78c41f5028e2099fc8b2eedc93`; preserve those exact current values.
- The large existing worktree is user-owned. Limit this repair to the manifest, its focused test, and new `calm-dune-9914` evidence files; do not disturb completed semantic/runtime work.

### Relevant Documentation

- `docs/plugins/reference/deliberation.md:70-85` defines the current KM wire boundary and separates KM-owned controls from the OpenClaw delivery overlay; no public-doc change is required for a provenance-only repair.
- `plans/2026-08-17_fresh-brook-6923_converge-deliberation-contract-provenance-and-rollout.md:52-64` identifies the same validator and required evidence categories, but incorrectly treated the pin recoverable from repository history as absent.
- `plans/checkpoints/fresh-brook-6923.blocked.md:3-16` is historical blocked evidence only; replace it with a new accepted final note rather than editing it.

### Knowledge Base

- `learnings/architecture/fresh-brook-6923-provenance-evidence-gate.md`: keep owner provenance, local hashes, and semantic evidence distinct; inspect all consumers before changing the pin.
- `learnings/architecture/2026-07-29_acceptance-fix-plans-must-close-contract-gates-explicitly.md`: acceptance repairs need accepted immutable evidence plus genuine RED/GREEN proof, not another blocked closeout.
- `learnings/tooling/fresh-brook-6923-preserve-test-lock-ownership.md`: wait for an existing test lock; never bypass or terminate its owner.
- Recall used the local fallback because `openclaw-fork-learnings` is unavailable; its remaining selected auto-extracted items add no actionable provenance rule.

## Available Skills

- `tdd`: record the focused manifest assertion's RED/GREEN transition in `plans/checkpoints/calm-dune-9914.red-green-proof.md`.
- `openclaw-testing`: select the focused Vitest command and handle any heavy-check lock correctly.
- `save-learning`: final implementation action, after all evidence is recorded.

## Solution

Use the accepted owner pin present in the repository baseline, rather than inventing external provenance or repeating the prior blocked path. Keep the newer semantic-handoff fields and all five current local hashes, re-add `acceptedRevision` and `ownerFiles`, and make the test enforce both evidence classes independently.

## Implementation

1. Record `plans/checkpoints/calm-dune-9914.red-green-proof.md` with the inherited historical contract-gate context, then change only the provenance assertion in `extensions/deliberation/src/contract.test.ts` to require `acceptedRevision: "401ababdd3"` and the exact two-entry `ownerFiles` map. Run the focused test before the manifest edit and capture its expected failure against the still-unresolved manifest.
2. Update `extensions/deliberation/contracts/provenance.json`: remove `ownerPin.status: "follow-up-required"`; add the recovered `acceptedRevision` and exact `ownerFiles` map; retain the semantic-handoff metadata, current scope/sources, and the five current `files` hashes. Do not restore outdated local hashes or remove the new OpenClaw overlay entry.
3. Finish the contract assertion by rejecting `ownerPin` and asserting all five recomputed local hashes still match. Run the same focused test to capture GREEN.
4. Add `plans/checkpoints/calm-dune-9914.final-note.md` with separate sections for semantic evidence (the `quick-reef-1568` handoff), owner provenance (revision `401ababdd3` and both owner-file hashes), local hash evidence (all five manifest `files` values), and rollout evidence (full gateway restart, not plugin reload, then live smoke). State that no restart or live call is performed by this repair.
5. Update `plans/checkpoints/calm-dune-9914.checkpoint.md` to link the RED/GREEN proof and final note, report exact commands/results, and mark the three previously unmet goals complete. Run `save-learning` last and save the resulting learning without altering prior task artifacts.

## Files To Modify

| File | Change |
| --- | --- |
| `extensions/deliberation/contracts/provenance.json` | Restore the accepted revision and two owner-file SHA-256 entries; retain current semantic and local-hash data. |
| `extensions/deliberation/src/contract.test.ts` | Assert the accepted owner pin/map and reject the unresolved follow-up state while retaining local hash recomputation. |
| `plans/checkpoints/calm-dune-9914.red-green-proof.md` | Record the targeted pre-manifest failure and post-manifest pass. |
| `plans/checkpoints/calm-dune-9914.final-note.md` | Separate semantic, owner-provenance, local-hash, and rollout evidence. |
| `plans/checkpoints/calm-dune-9914.checkpoint.md` | Link final evidence and fresh verification results. |
| `learnings/<generated-by-save-learning>.md` | Save the post-repair provenance lesson as the final action. |

## TDD

**Workflow:** Implement the RED/GREEN cycle with `skill:tdd`; do not manufacture a historical RED. The RED is the focused assertion requiring the recovered owner pin before `provenance.json` is restored.

**Test file:** `extensions/deliberation/src/contract.test.ts`  
**Framework:** Vitest  
**Run command:** `pnpm test extensions/deliberation/src/contract.test.ts -- --reporter=verbose`

```ts
it("pins the accepted KM owner revision and owner files", async () => {
  const provenance = JSON.parse(await readFile(join(contractDir, "provenance.json"), "utf8"));
  expect(provenance.acceptedRevision).toBe("401ababdd3");
  expect(provenance.ownerFiles).toEqual({
    "km-system/contracts/deliberation-v2/v1/contract.json":
      "c5ea7d1514b8834368d90bed51f0f9f99772b0b59ab885a4a67bccb78775cbd5",
    "km-system/contracts/deliberation-v2/v1/fixtures.json":
      "afe531da034209a8a329b6af24d40381cc06cc0a93406ca274c99564eb4d5d34",
  });
  expect(provenance).not.toHaveProperty("ownerPin");
});
```

| Test | RED | GREEN |
| --- | --- | --- |
| accepted owner pin assertion | Fails because the current manifest lacks `acceptedRevision` and `ownerFiles` and has `ownerPin`. | Passes with the recovered exact pin/map and no unresolved field. |
| local mirror hash loop | Existing pinned hashes continue to match all five current JSON artifacts. | Passes without changing contract content beyond the manifest. |

## Dependencies

- The required immutable values are available from the repository baseline (`HEAD` provenance manifest), not inferred from the semantic handoff or local hashes.
- A configured `OPENCLAW_DELIBERATION_KM_ROOT` is required only for `pnpm test:deliberation:km-integration`; run it only when that trusted checkout is available. It verifies the restored `ownerFiles` against real owner files and must not be simulated.
- If the focused test is waiting on the heavy-check lock, record the wait and rerun after its owner releases it; do not run Vitest concurrently.
- Verify `shasum -a 256` for the five manifest-pinned local artifacts, run the focused contract test, run `git diff --check`, and inspect the scoped diff. Do not repeat completed broader tests, provider calls, deployment, plugin reload, or restart.

---

*Created: 2026-08-17*
*Status: DRAFT*
