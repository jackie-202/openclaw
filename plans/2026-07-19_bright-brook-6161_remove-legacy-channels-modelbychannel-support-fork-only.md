# Plan 2026-07-19: Complete modelByChannel acceptance evidence

Capture the missing source-search output and classify each remaining compatibility-owned match without changing production code.

_Status: DRAFT_
_Created: 2026-07-19_

## Progress

- [x] Phase 0: Config + init
- [x] Phase 1: Research
- [x] Phase 2: Knowledge
- [x] Phase 3: Synthesis

## Analysis

### Codebase context

- `src/channels/model-overrides.ts:209` resolves `runtimeByChannel` independently; `src/channels/model-overrides.ts:231` retains the upstream-owned legacy resolver.
- `src/channels/model-overrides.test.ts` and `src/auto-reply/reply/get-reply.fast-path.test.ts` contain the preserved regression coverage.
- `plans/checkpoints/warm-cove-7515.red-green-proof.md` contains the genuine parent RED and GREEN. The parent checkpoint claims grep verification but omits its output.
- Current `git grep -n modelByChannel src/` still has compatibility, maintenance, metadata, and test matches; no production match remains under `src/auto-reply/reply/`.

### Relevant documentation

- `plans/2026-07-19_warm-cove-7515_remove-legacy-channels-modelbychannel-support-fork-only.md` requires verbatim grep output and complete classification.
- `plans/tasks/2026-07-18_remove-legacy-modelbychannel-support.md` makes the final-note grep proof an acceptance requirement.
- `git show upstream/main:src/config/types.channels.ts` and `git show upstream/main:src/channels/model-overrides.ts` prove upstream ownership of the config key and standalone resolver.

### Knowledge base

- `learnings/architecture/preserve-upstream-compatibility-while-removing-fork-only-composition.md`: retain upstream schema/resolver behavior and classify remaining grep matches instead of requiring zero matches.
- `learnings/patterns/warm-cove-7515-classify-legacy-references-before-deleting-them.md`: prove the forbidden execution path is absent while preserving independent compatibility consumers.
- `learnings/test-failures/warm-cove-7515-test-runtime-and-legacy-resolvers-independently.md`: do not fabricate a new RED after implementation; reuse the parent proof and capture fresh GREEN evidence.

## Available Skills

- `task-evidence`: recover exact parent commands and explicitly report unavailable/truncated historical evidence.
- `tdd`: capture fresh GREEN proof only; never manufacture a follow-up RED.
- `acceptance`: finalize the evidence finding if an acceptance manifest is supplied to the implementation session.
- `save-learning`: mandatory final tool action after evidence is complete.

## Implementation

1. Re-read the parent plan, checkpoint, RED/GREEN proof, preserved diff, and current resolver/callers. Stop without source edits unless this inspection proves a real implementation defect.
2. Run `git show upstream/main:src/config/types.channels.ts`, `git show upstream/main:src/config/zod-schema.channels-config.ts`, and `git show upstream/main:src/channels/model-overrides.ts`; record that upstream owns `modelByChannel` schema/validation and `resolveChannelModelOverride()`, so those compatibility surfaces remain intentionally supported.
3. Run `git grep -n modelByChannel src/` immediately before handoff. Include its complete verbatim output in the final note, then classify every output line by file and line as one of: upstream contract/schema, standalone legacy resolver or caller, config migration/maintenance/metadata, or test coverage. Reconcile classification counts to the raw grep line count so no match is omitted.
4. State explicitly that `src/channels/model-overrides.ts:209` reads only `runtimeByChannel`, no production match exists under `src/auto-reply/reply/`, and the remaining test fixture there proves legacy input is ignored rather than consumed by runtime selection.
5. Link the genuine historical RED at `plans/checkpoints/warm-cove-7515.red-green-proof.md`; do not rerun or fabricate RED. Capture fresh GREEN for this follow-up with `TASK_ID=bright-brook-6161 python3 "$HOME/.config/opencode/skills/tdd/scripts/proof-capture.py" green -- pnpm test src/channels/model-overrides.test.ts src/auto-reply/reply/get-reply.fast-path.test.ts -- --reporter=verbose`.
6. If fresh inspection exposes no defect, leave all production and test files unchanged. If it exposes one, stop the evidence-only path, document it, and make only the minimal tested correction authorized by the task.
7. Invoke `save-learning` and save at least one learning as the final tool action before returning the evidence-rich final note.

## Files to Modify

- No production or test files by default.
- `plans/checkpoints/bright-brook-6161.red-green-proof.md` is generated only for fresh GREEN evidence.
- `learnings/**` receives the mandatory session learning through `save-learning`.

## TDD: skip

This is an evidence-only follow-up with an existing genuine RED; creating a new failing test would fabricate history and repeat completed implementation work.

## Dependencies

- The preserved parent implementation and `plans/checkpoints/warm-cove-7515.red-green-proof.md` remain available.
- `upstream/main` is present for direct ownership proof.
- The completion state links this plan as `plans/2026-07-19_bright-brook-6161_remove-legacy-channels-modelbychannel-support-fork-only.md`.
