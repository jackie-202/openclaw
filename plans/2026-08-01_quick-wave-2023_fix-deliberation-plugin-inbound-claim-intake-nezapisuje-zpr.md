# Plan 2026-08-01: Complete Deliberation full-suite acceptance evidence

Capture the missing canonical Test Gate proof for the preserved Deliberation fix without changing production behavior.

_Status: DRAFT_
_Created: 2026-08-01_

## Progress

- [x] Phase 0: Config + Init
- [x] Phase 1: Research
- [x] Phase 2: Knowledge
- [x] Phase 3: Synthesis

## Analysis

### Codebase context

- `extensions/deliberation/src/hooks.test.ts` already contains the accepted real-shape, media, and skip-log coverage; do not edit or rerun the parent TDD cycle.
- `plans/checkpoints/calm-dune-8979.red-green-proof.md` preserves the genuine focused RED/GREEN, but covers only `hooks.test.ts`.
- `plans/checkpoints/acceptance-runs/calm-dune-8979-acceptance-001/result.json` leaves only `goal-003` unmet because the canonical Test Gate is `not-run`.
- A prior acceptance retry in `plans/checkpoints/acceptance-runs/bold-fork-4060-acceptance-001/result.json` proves that relabeling local commands as a Test Gate does not satisfy caller-owned gate provenance.

### Relevant documentation

- `docs/reference/test.md` routes one plugin through `pnpm test extensions/deliberation`, while the acceptance goal explicitly requires the exact raw command `pnpm exec vitest run extensions/deliberation`; execute that exact command only inside the required canonical gate.
- `extensions/AGENTS.md` confirms no plugin production boundary needs to change for an evidence-only follow-up.

### Knowledge base

- Reuse historical RED/GREEN and capture fresh GREEN separately; never fabricate a post-implementation RED.
- Keep external and accepted behavior intact unless fresh full-plugin execution reveals a reproducible implementation defect.
- Knowledge recall used local fallback because QMD collection `openclaw-fork-learnings` was unavailable; most returned protocol learnings are not relevant to this evidence-only gap.

## Available Skills

- `openclaw-testing`: choose the safe execution path while preserving the exact acceptance command in the canonical gate.
- `task-evidence`: extract historical command/outcome pairs only if lineage evidence is needed; do not use it as a substitute for fresh gate proof.
- `acceptance`: validate that the new evidence directly closes `finding-001`.
- `save-learning`: save the required session learning as the final execution action.

## Implementation

1. Reinspect the preserved Deliberation diff, `extensions/deliberation/src/hooks.test.ts`, and `plans/checkpoints/calm-dune-8979.red-green-proof.md`. If they match the accepted parent behavior, make no production or test edits.
2. Submit the preserved workspace through the caller-owned canonical Test Gate and require it to execute exactly `pnpm exec vitest run extensions/deliberation`. Do not substitute `pnpm test`, a focused file run, a checkpoint claim, or a locally invented gate label.
3. Require a concrete passing gate reference with exact command, exit code, test-file/test counts, timestamp, and provider/run ID when supplied. Treat `not-run`, blocked, missing output, or nonzero exit as incomplete.
4. If the gate fails, inspect the failure first. Record infrastructure or unrelated failures as blockers; only change production code when the output proves a Deliberation implementation defect, then add the smallest regression and rerun the same canonical gate.
5. Write `plans/checkpoints/quick-wave-2023.evidence.md` linking the canonical gate result, `plans/checkpoints/calm-dune-8979.red-green-proof.md`, and `plans/checkpoints/acceptance-runs/calm-dune-8979-acceptance-001/result.json`. Transcribe evidence exactly; do not infer unavailable outcomes.
6. Use `acceptance` to verify that the evidence closes `finding-001`, then write `plans/checkpoints/quick-wave-2023.checkpoint.md` linking this plan and every acceptance input without modifying the immutable task file.
7. Run `git diff --check -- plans/checkpoints/quick-wave-2023.evidence.md plans/checkpoints/quick-wave-2023.checkpoint.md`.
8. Invoke `save-learning`, save at least one learning about canonical gate provenance, and perform no later edits or verification.

## Files to Modify

| File                                              | Change                                                                      |
| ------------------------------------------------- | --------------------------------------------------------------------------- |
| `plans/checkpoints/quick-wave-2023.evidence.md`   | Record the exact passing canonical Test Gate reference and command outcome. |
| `plans/checkpoints/quick-wave-2023.checkpoint.md` | Link the plan, parent proof, acceptance result, and fresh gate evidence.    |
| `learnings/**`                                    | Add the mandatory learning through `save-learning` as the final action.     |

Production and test files remain unchanged unless the canonical run exposes a real Deliberation defect.

## TDD: skip

This is an evidence-only follow-up after implementation; reuse `plans/checkpoints/calm-dune-8979.red-green-proof.md` as genuine TDD provenance and capture only fresh GREEN gate evidence.

## Verification

- The canonical Test Gate reference is caller-owned and not `canonical-status:not-run`.
- Its recorded command is exactly `pnpm exec vitest run extensions/deliberation`, exits 0, and reports the full Deliberation suite passing.
- `acceptance` finds `goal-003` supported by the canonical reference rather than by a local assertion.
- `git diff --check` exits 0 for the new evidence artifacts before `save-learning` runs last.

## Dependencies

- The preserved parent implementation and historical RED/GREEN remain intact.
- Completion depends on the caller-owned Test Gate producing an inspectable result; local verification alone cannot close the finding.
