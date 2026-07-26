# Plan 2026-07-24: Acceptance Evidence for Upstream Model Authority

Collect the preserved parent implementation and focused-test diff needed for semantic acceptance, without changing production behavior unless inspection proves a defect.

*Status: DRAFT*

## Progress

- [x] Phase 0: Initialize canonical plan
- [x] Phase 1: Inspect parent implementation and evidence
- [x] Phase 2: Load relevant project knowledge
- [x] Phase 3: Finalize evidence-only execution plan

## Analysis

### Parent evidence

- `plans/checkpoints/acceptance-runs/quick-reef-5974-acceptance-001/result.json` rejects only the missing source/test diff; it reports no semantic defect.
- `plans/checkpoints/quick-reef-5974.red-green-proof.md` contains the genuine parent RED and GREEN for the six focused test files.
- `plans/checkpoints/quick-reef-5974.evidence.md` has truncated command history and cannot substitute for source inspection.

### Code and tests

- The preserved `git diff -- src` contains 13 intended files: 6 production consumers/helpers and 7 focused test/support files, totaling 317 insertions and 52 deletions.
- `src/channels/model-overrides.ts` contains the sole proposal-marked fallback helper; canonical `modelByChannel` resolution runs first and the fallback reuses `resolveChannelRuntimeProfile()` target matching.
- Reply, native slash, dispatch, agent-command, status, and Gateway paths route model selection through `resolveChannelModelOverride()`; runtime profile reads remain separate for non-model fields.
- Focused tests expose canonical precedence, fallback warning behavior, caller routing, status attribution, and preservation of Gateway thinking/reasoning fields. Inspection found no implementation defect requiring production edits.

### Knowledge base

- `learnings/architecture/canonical-channel-model-fallback-seam.md`: preserve one fallback helper, remove caller presence guards, and keep supplemental fields separate.
- `learnings/architecture/bold-peak-9726-channel-runtime-profiles-must-reach-every-execution-path.md`: evidence must cover bypass paths and fallback-only configuration.
- Recall used deterministic local search because QMD collection `openclaw-fork-learnings` was unavailable.

## Available Skills

- `acceptance`: semantically inspect the supplied source/test artifact; do not run suites from the acceptance review itself.
- `task-evidence`: preserve exact historical commands and explicitly report unavailable/truncated outcomes.
- `tdd`: capture fresh GREEN under this follow-up while linking the genuine parent RED.
- `save-learning`: record the evidence-boundary lesson as the final execution action.

## Approach

Package the preserved parent implementation as a bounded, reviewable diff artifact. Do not touch production or test code unless a final pre-capture inspection reveals a concrete defect; no such defect is currently known.

## Steps

1. Confirm the 13 preserved `src/` paths still match the parent diff inventory and that no unrelated work is included. Record the current base commit and path list in `plans/checkpoints/swift-dune-1559.acceptance-evidence.md`.
2. Generate `plans/checkpoints/swift-dune-1559.source-and-tests.diff` from `git diff --` restricted to those 13 paths. Include complete production and focused-test hunks so acceptance can inspect the resolver seam, warning, precedence, caller routing, and unchanged non-model behavior.
3. Validate the artifact with `git apply --check --reverse plans/checkpoints/swift-dune-1559.source-and-tests.diff` and `git diff --check -- <13 paths>`; record both outcomes and an artifact checksum in the evidence summary.
4. Link the historical RED/GREEN proof at `plans/checkpoints/quick-reef-5974.red-green-proof.md`; do not synthesize a new RED after implementation exists.
5. Capture a fresh GREEN in the follow-up task with `TASK_ID=swift-dune-1559 python3 "$HOME/.config/opencode/skills/tdd/scripts/proof-capture.py" green -- pnpm test src/channels/model-overrides.test.ts src/auto-reply/reply/get-reply.fast-path.test.ts src/auto-reply/reply/dispatch-from-config.test.ts src/agents/agent-command.live-model-switch.test.ts src/auto-reply/status.test.ts src/gateway/session-utils.test.ts -- --reporter=dot` and link the generated proof from the evidence summary.
6. Update `plans/checkpoints/swift-dune-1559.checkpoint.md` with the plan path, raw diff artifact, parent proof, fresh GREEN proof, exact commands/outcomes, and any remaining evidence gap. Then invoke `save-learning` as the final action.

## Files

| File | Change |
| --- | --- |
| `plans/checkpoints/swift-dune-1559.source-and-tests.diff` | Add the complete bounded diff for the preserved 13 implementation/test paths. |
| `plans/checkpoints/swift-dune-1559.acceptance-evidence.md` | Record provenance, path inventory, checksum, semantic coverage map, and proof links. |
| `plans/checkpoints/swift-dune-1559.red-green-proof.md` | Generated fresh GREEN evidence only; parent proof remains the RED provenance. |
| `plans/checkpoints/swift-dune-1559.checkpoint.md` | Link this plan and all acceptance artifacts. |

No `src/` file is expected to change.

## TDD: skip

This follow-up adds evidence rather than behavior; reuse the genuine parent RED and capture fresh GREEN only.

## Verification

- Raw diff contains all and only the 13 preserved `src/` paths listed by `git diff --numstat -- src`.
- Reverse apply check proves the artifact represents the current preserved implementation.
- Fresh focused GREEN passes across the resolver, regular/native reply, dispatch, agent-command, status, and Gateway tests.
- Evidence summary explicitly maps each acceptance requirement to visible diff hunks and reports any command or provenance gap without fabrication.
