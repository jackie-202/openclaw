# Plan 2026-07-19: Complete modelByChannel acceptance evidence

Capture exhaustive source-search evidence for the preserved compatibility surface without changing production behavior.

_Status: DRAFT_

## Progress

- [x] Phase 0: Config and init
- [x] Phase 1: Research
- [x] Phase 2: Knowledge
- [x] Phase 3: Synthesis

## Analysis

### Codebase context

- `git grep -n modelByChannel src/` currently returns 112 lines; the required evidence must preserve the fresh output rather than this provisional count.
- `src/channels/model-overrides.ts:217` makes `resolveChannelRuntimeProfile()` read only `runtimeByChannel`; `src/channels/model-overrides.ts:232` retains the standalone upstream-compatible `resolveChannelModelOverride()`.
- `src/auto-reply/reply/get-reply.ts:566`, `src/auto-reply/reply/get-reply-native-slash-fast-path.ts:113`, and `src/auto-reply/reply/dispatch-from-config.ts:520` call the runtime-profile resolver.
- The only current `modelByChannel` match under `src/auto-reply/reply/` is the negative test fixture at `src/auto-reply/reply/get-reply.fast-path.test.ts:414`; there is no production runtime read in that subtree.

### Relevant documentation

- `plans/tasks/2026-07-19_followup-acceptance-fix-remove-legacy-channels-modelbychannel-support.md:10` defines the missing raw-search, exhaustive-classification, count-reconciliation, compatibility-decision, and scoped-negative proof.
- `plans/2026-07-19_bright-brook-6161_remove-legacy-channels-modelbychannel-support-fork-only.md:43` planned the same proof, but `plans/checkpoints/bright-brook-6161.checkpoint.md:8` recorded only a completion summary.
- `plans/checkpoints/warm-cove-7515.red-green-proof.md:5` and `plans/checkpoints/warm-cove-7515.red-green-proof.md:69` preserve the genuine parent RED/GREEN cycle.
- `upstream/main` retains `modelByChannel` in `src/config/types.channels.ts`, `src/config/zod-schema.channels-config.ts`, and `src/channels/model-overrides.ts`; these are intentional upstream compatibility surfaces.

### Knowledge base

- `learnings/tooling/bright-brook-6161-exhaustive-grep-acceptance-evidence.md`: save exact grep output and reconcile every match; a completion claim is not evidence.
- `learnings/architecture/preserve-upstream-compatibility-while-removing-fork-only-composition.md`: preserve the upstream schema and standalone resolver while excluding legacy input only from fork runtime-profile composition.
- Do not fabricate a new RED after implementation; link the historical proof and capture only fresh verification needed by this evidence follow-up.

## Available Skills

- `task-evidence`: consult parent lineage and report missing or truncated historical outcomes without invention.
- `acceptance`: finalize the supplied blocking finding after the durable evidence artifact is complete.
- `save-learning`: mandatory final action after evidence capture.

## Implementation

1. Re-read the parent plan, checkpoint, proof, current resolver, runtime callers, and working diff. Keep production and test files untouched unless this inspection demonstrates a concrete defect.
2. Create `plans/checkpoints/warm-wave-5625.modelbychannel-evidence.md`. Record the exact command and complete verbatim output of a fresh `git grep -n modelByChannel src/`; do not truncate, summarize, or substitute tool snippets.
3. In the same artifact, add one classification row for every raw output line, keyed by exact `file:line`. Use only these categories: upstream schema/config contract, standalone legacy resolver or caller, maintenance/migration/metadata, or test coverage. State each category count and prove their sum equals the raw match count.
4. Record direct upstream proof with `git grep -n modelByChannel upstream/main -- src/config/types.channels.ts src/config/zod-schema.channels-config.ts src/channels/model-overrides.ts`. State the decision: retain upstream schema/validation and `resolveChannelModelOverride()` compatibility; remove only fork runtime-profile consumption.
5. Record `git grep -n modelByChannel src/auto-reply/reply/` verbatim and classify its test-only match. Cite the three production callers and `src/channels/model-overrides.ts:217-228` to prove runtime execution uses `runtimeByChannel` without a legacy read.
6. Link the genuine parent RED/GREEN proof. Run fresh focused GREEN verification with `pnpm test src/channels/model-overrides.test.ts src/auto-reply/reply/get-reply.fast-path.test.ts -- --reporter=verbose`, and append the command, exit code, and result to the evidence artifact.
7. Update `plans/checkpoints/warm-wave-5625.checkpoint.md` to link the evidence artifact and this plan; do not replace the artifact with a prose completion claim.
8. Invoke `acceptance` if a run manifest is available, then invoke `save-learning` and persist at least one learning as the final tool action.

## Files to Modify

| File                                                          | Change                                                                                                                                  |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `plans/checkpoints/warm-wave-5625.modelbychannel-evidence.md` | Persist raw grep output, exhaustive classification, reconciled counts, upstream decision, scoped runtime proof, and fresh GREEN result. |
| `plans/checkpoints/warm-wave-5625.checkpoint.md`              | Link the plan and complete evidence artifact.                                                                                           |
| `learnings/**`                                                | Save the mandatory session learning.                                                                                                    |

No production or test file changes are expected.

## TDD: skip

This is evidence-only work with a genuine historical RED/GREEN proof; creating a new RED would fabricate history and repeat completed implementation.

## Dependencies

- The preserved parent implementation and `plans/checkpoints/warm-cove-7515.red-green-proof.md` remain available.
- The `upstream/main` ref remains available for direct compatibility ownership proof.
- Completion state links this plan as `plans/2026-07-19_warm-wave-5625_acceptance-fix-remove-legacy-channels-modelbychannel.md`.
