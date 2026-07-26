# Plan 2026-07-25: Slice 5 Closure Verification

Produce an evidence-backed Option A closure without changing runtime code, tooling, live state, or the external workspace proposal.

## Evidence Inputs

- Treat `docs/proposals/proposal-20260724-083714-6c9e68_minimize-channel-runtime-divergence-from-upstream.md:251` as the authoritative eight-item checklist.
- Cite Slice 1 behavior from `plans/checkpoints/quick-reef-5974.red-green-proof.md` and `plans/checkpoints/swift-dune-1559.acceptance-evidence.md`.
- Cite Slice 3 behavior, gate results, and provenance delta from `plans/checkpoints/dark-dune-1632.red-green-proof.md` and `plans/checkpoints/dark-crag-9860.final-note.md`.
- Resolve and read the exact Slice 2 and Slice 4 final notes from task lineage before judging migration/tooling criteria. If an artifact or exact outcome is unavailable, record the gap rather than reconstructing history.
- Read the migration backup and current `~/.openclaw/openclaw.json` only through a sanitizing, read-only comparison that emits target counts and equality results, never unrelated config or secrets. Never access `/Users/michal/.openclaw/workspace/**`.

## Implementation

1. Capture the original architecture report byte count and SHA-256 before editing so append-only preservation can be proven afterward.
2. Build an eight-row evidence matrix in `.architecture-reviews/reports/2026-07-24-option-a-closure.md`; give every row an explicit `PASS` or `FAIL`, exact artifact/file references, exact historical command and outcome where available, and a concise gap statement where proof is missing.
3. Prove item 1 from the Slice 1/3 focused tests for regular/fresh reply selection, native `/status`, first-turn dispatch, agent-command, status attribution, and gateway session reconstruction; separately cite the raw resolver test proving `runtimeByChannel` cannot supply a model.
4. Prove item 2 directly against current `upstream/main`: show that `modelByChannel` and `resolveChannelModelOverride()` remain in upstream config types, schema, resolver, and supported consumer surfaces. Do not infer upstream compatibility only from fork tests.
5. Prove item 3 from tests that combine `modelByChannel` with model-free `runtimeByChannel` and preserve `thinkingLevel`, `reasoningLevel`, and `textVerbosity`, including fresh reply and reconstructed-session coverage.
6. Prove item 4 with a sanitized backup/current comparison: require exactly 11 Discord targets; require each backup runtime `model` to equal the current `modelByChannel` value; require current runtime profiles to contain no `model`; require every non-model runtime field to be byte-equivalent after canonical JSON normalization. Mark `FAIL` on a missing backup, target mismatch, model mismatch, or supplemental-field drift.
7. Prove item 5 only from Slice 2/4 tests or final notes that explicitly cover dry-run, apply, doctor, and rollback. List each path independently; one unproved path makes the item `FAIL`.
8. Prove item 6 from exact focused and canonical gate records. Slice 3 supplies focused `84 tests passed` and `pnpm build` success but records non-green `pnpm check` and `npm test`; require a later Slice 4 canonical green record to pass, otherwise mark `FAIL` and make that the task result.
9. Prove item 7 with `plans/checkpoints/dark-crag-9860.final-note.md`: report the measured net affected-surface delta reduction from `+8,698` to `+8,610` lines, explain the added pricing-cache surface, list the three commit dispositions, and pair this with the item 2 upstream checks to show no upstream public surface was deleted.
10. Append a clearly labeled correction to `.architecture-reviews/reports/2026-07-24T082900Z-openclaw-fork.md`. Link the Option A proposal, state that provenance reversed the recommendation because `modelByChannel` is upstream-owned while model-bearing `runtimeByChannel` deepened fork divergence, preserve the original report verbatim, and distinguish correction of the recommendation from any failed implementation acceptance item.
11. Complete item 8 after verifying the correction append. Add the exact required `Workspace proposal supersession note` text to the project-local closure report only; state that the operator must apply/archive it externally and that the inaccessible workspace file is not an acceptance failure.
12. Set the closure report’s overall result to `PASS` only when all eight rows pass; otherwise set it to `FAIL` and enumerate failed row numbers without softening them.
13. Run `skill:technical-documentation` over both reports, then verify formatting, exactly eight verdicts, exact supersession wording, proposal linkage, and absence of secrets or absolute workspace content.
14. Verify append-only integrity by hashing the first original byte-count bytes of the corrected architecture report and comparing that digest with the pre-edit SHA-256. Run `git diff --check` for the tracked report change and a Markdown format check covering both report files; do not run source test suites or perform Git writes.
15. Run `skill:save-learning` as the final action and save at least one learning about evidence-gated closure, especially the rule that a focused/build pass cannot be reported as a green canonical gate.

## Files to Modify

| File | Change |
| --- | --- |
| `.architecture-reviews/reports/2026-07-24T082900Z-openclaw-fork.md` | Append the recommendation correction; preserve every original byte. |
| `.architecture-reviews/reports/2026-07-24-option-a-closure.md` | Add the eight-item evidence matrix, overall result, provenance comparison, gaps, and copy-ready workspace supersession note. |

Do not modify `docs/proposals/**`, `plans/tasks/**`, fork source, workspace helper code, live config, proposal DB state, or `/Users/michal/.openclaw/workspace/**`.

## TDD: skip

The deliverables are append-only evidence documents; validate structure, provenance, and byte preservation rather than introducing behavioral tests.

## Relevant Skills And Rules

- Use `task-evidence` only to recover exact predecessor commands/outcomes; preserve `log_unavailable`, `outcome_unavailable`, and truncation gaps.
- Use `technical-documentation` for the final evidence/correction wording review.
- Apply `learnings/architecture/calm-fork-4679-manual-feature-removal-with-evolved-upstream.md`: prove compatibility from current upstream source and classify remaining fork delta.
- Apply `learnings/architecture/dark-crag-9860-authority-migrations-require-indirect-consumer-cleanup.md`: include status, reconstruction, caching/pricing, and indirect consumers.
- Knowledge discovery used local fallback because QMD collection `openclaw-fork-learnings` was unavailable.

## Dependencies

- Slice 2 and Slice 4 final notes must expose exact test/gate outcomes.
- The migration backup path must be supplied by Slice 2 evidence or the operator; do not guess among backup files.
- Current `upstream/main` must be available locally for read-only provenance checks.

*Status: DRAFT*
