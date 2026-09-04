# Plan 2026-08-25: Complete Deliberation probe TDD evidence

Capture the missing GREEN result for the already-implemented Deliberation delivery probe without changing production code.

_Status: DRAFT_
_Created: 2026-08-25_

## Progress

- [x] Phase 0: Config + Init
- [x] Phase 1: Research
- [x] Phase 2: Knowledge
- [x] Phase 3: Synthesis

## Analysis

### Codebase Context

- `extensions/deliberation/api.ts` already exports `runDeliberationDeliveryProbe`; no production change is needed.
- `extensions/deliberation/src/delivery-probe.test.ts` already covers API isolation, lifecycle/replay, mismatch, diagnostics, redaction, and unsafe-input refusal.
- `plans/checkpoints/bold-wave-8562.red-green-proof.md` contains a genuine failing RED and a passing GREEN for the exact focused command, but acceptance requires fresh follow-up-scoped GREEN provenance.
- `plans/checkpoints/bold-wave-8562.evidence.md` reports truncated historical command lines and unavailable outcomes, so it cannot replace the complete proof artifact.

### Relevant Documentation

- `plans/2026-08-25_bold-wave-8562_add-openclaw-side-of-deployed-deliberation-delivery-probe.md` defines the focused command and original proof requirement.
- `plans/checkpoints/bold-wave-8562.checkpoint.md` records the implementation as complete; this follow-up must not repeat it.
- `extensions/AGENTS.md` requires the public probe to remain at the plugin API boundary; evidence-only work leaves that boundary unchanged.

### Knowledge Base

- `learnings/architecture/deployable-probes-need-two-isolation-boundaries.md` confirms the existing API/export, loopback, provider-isolation, and artifact-identity design; none needs reimplementation.
- Recall used deterministic local fallback because QMD collection `openclaw-fork-learnings` was unavailable. Returned auto-extracted architecture files contained no additional actionable evidence guidance.
- Historical evidence must be linked, not reconstructed; a missing current result must be captured by running the real command.
- `skill:tdd` requires one proof file per task and both RED/GREEN sections before completion, while forbidding fabricated post-implementation RED.

## Available Skills

- `tdd`: capture and validate the fresh GREEN result in the follow-up proof artifact.
- `task-evidence`: extract exact command/outcome provenance if task logs are needed; report unavailable/truncated gaps rather than guessing.
- `acceptance`: finalize the run-scoped finding after the proof artifact is complete.
- `save-learning`: save at least one learning as the final action required by the task.

## Solution

Treat this as proof repair only: retain the parent RED as immutable historical evidence, run the same focused command now for a fresh GREEN result, and expose both through follow-up-scoped evidence. Do not edit production code or tests unless inspection reveals a concrete defect.

## Implementation

1. Re-read `plans/checkpoints/bold-wave-8562.red-green-proof.md`, confirm its RED has exit code 1 for the missing probe export, and link that exact section as the genuine historical RED; do not rerun or fabricate RED.
2. Confirm `extensions/deliberation/api.ts` still exports the probe and the focused assertions remain in `extensions/deliberation/src/delivery-probe.test.ts`. If either differs because of a real defect, stop the evidence-only path and document the defect before making any minimal tested correction.
3. Use `skill:tdd` to capture fresh GREEN under task `warm-reef-8385` for the exact unchanged command: `pnpm test extensions/deliberation/src/delivery-probe.test.ts extensions/deliberation/src/km-client.test.ts -- --reporter=verbose`. Record exit code 0 and complete test totals; do not claim GREEN if any test fails.
4. Create `plans/checkpoints/warm-reef-8385.acceptance-evidence.md` linking the parent RED and fresh GREEN, with exact command, timestamps, exit codes, and outcomes. Explicitly note the parent task-evidence truncation gap rather than using it as proof.
5. Create or update `plans/checkpoints/warm-reef-8385.checkpoint.md` to link this canonical plan and acceptance evidence, map `finding-001` to both phases, and state that production/test files were unchanged.
6. Verify the linked artifacts contain a genuine failing RED and successful fresh GREEN for the identical command, then run `git diff --check -- plans/checkpoints/warm-reef-8385.acceptance-evidence.md plans/checkpoints/warm-reef-8385.checkpoint.md`.
7. Use `skill:acceptance` if a run manifest is available, and do not mark `finding-001` resolved until the complete linked proof is supplied.
8. Invoke `skill:save-learning` last and save at least one learning about preserving historical RED while capturing follow-up-scoped GREEN evidence.

## Files to Modify

| Path                                                      | Change                                                                                       |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `plans/checkpoints/warm-reef-8385.red-green-proof.md`     | Store fresh follow-up GREEN output if generated by `skill:tdd`; never manufacture a new RED. |
| `plans/checkpoints/warm-reef-8385.acceptance-evidence.md` | Link the immutable parent RED and fresh follow-up GREEN with exact outcomes.                 |
| `plans/checkpoints/warm-reef-8385.checkpoint.md`          | Link this plan and map the completed proof to `finding-001`.                                 |
| `learnings/**`                                            | Add the mandatory session learning through `skill:save-learning`.                            |

No production, test, plugin, or documentation files change by default.

## TDD: skip

This is an evidence-only continuation with a genuine historical RED; creating a new failing test after implementation would fabricate history. Reuse `plans/checkpoints/bold-wave-8562.red-green-proof.md:5-203` as RED and capture fresh GREEN for the same focused command under `warm-reef-8385`.

| Evidence       | Required outcome                                                         |
| -------------- | ------------------------------------------------------------------------ |
| Historical RED | Parent command exits 1 because `runDeliberationDeliveryProbe` is absent. |
| Fresh GREEN    | Identical command exits 0 with both focused test files passing.          |

## Dependencies

- The preserved parent implementation, test files, and genuine RED artifact remain available and unchanged.
- The focused command runs through the repository `pnpm test` wrapper; the injected registry-wide `npm test` command is not used for this narrow proof.
- Completion state must link `plans/2026-08-25_warm-reef-8385_add-openclaw-side-of-deployed-deliberation-delivery-probe.md`; `plans/tasks/2026-08-25_followup-warm-reef-8385-add-openclaw-side-of-deployed-deliberation-delivery-probe.md` remains untouched.
