# Plan 2026-08-17: Repair Deliberation Acceptance Evidence

Complete the missing task-scoped TDD and final verification records without changing the already-completed Deliberation implementation.

*Status: DRAFT*
*Created: 2026-08-17*

## Progress

- [x] Phase 0: Config + Init
- [x] Phase 1: Research
- [x] Phase 2: Knowledge
- [x] Phase 3: Synthesis

## Analysis

### Codebase Context

- `plans/checkpoints/quick-reef-1568.red-green-proof.md` contains the historical genuine RED: the focused five-file command failed because `sourceThreadId` was absent from admission, emitted intake, producer output, and the mirror; the same command later passed in GREEN.
- `plans/checkpoints/quick-reef-1568.checkpoint.md` records aggregate verification only, so it does not satisfy the requested command/result final note.
- `extensions/deliberation/src/hooks.test.ts`, `src/route-match.test.ts`, `src/km-client.test.ts`, `scripts/intake-producer.test.ts`, and `src/contract.test.ts` are already changed and passing according to the parent proof; do not rewrite them unless fresh GREEN exposes a real regression.
- `extensions/deliberation/contracts/openclaw-overlay-v1.json` is the retained local overlay that must be named in the final note, while `contracts/provenance.json` intentionally leaves the exact owner revision/hash unresolved.

### Relevant Documentation

- `plans/tasks/2026-08-17_converge-openclaw-deliberation-intake-and-mirrored-km-contra.md` requires commands/results and intentional overlay disclosure in the final note.
- `plans/2026-08-17_quick-reef-1568_converge-openclaw-deliberation-intake-and-mirrored-km.md` defines the completed implementation and original focused command.

### Knowledge Base

- Historical evidence must come from `task-evidence` and the preserved parent proof; never reconstruct a RED after implementation (`learnings/tooling/acceptance-retries-separate-inherited-work-from-target-tdd-proof.md`).
- Keep the generic KM mirror separate from `openclaw-overlay-v1.json`; the overlay retains provider-specific adapter constraints without narrowing the owner wire (`learnings/architecture/deliberation-generic-wire-provider-overlay-separation.md`).
- Record missing owner revision/hashes as a follow-up; never fabricate provenance.
- Recall used the deterministic local fallback because QMD collection `openclaw-fork-learnings` was unavailable; unrelated empty auto-extracted results add no requirements.

## Available Skills

- `task-evidence`: extract and cite the genuine parent RED/GREEN command and outcomes instead of fabricating a post-implementation RED.
- `tdd`: capture the fresh GREEN under `cool-wave-8241` while preserving historical RED provenance.
- `openclaw-testing`: select the narrow rerun and any justified regression checks.
- `acceptance`: use only if the monitor supplies a new immutable acceptance manifest; do not invent or finalize a run from this task.
- `save-learning`: mandatory last implementation-session action.

## Implementation

1. Run `python3 /Users/michal/.config/opencode/skills/task-evidence/scripts/fetch-evidence.py --task quick-reef-1568 --project-dir .`; inspect the generated artifact and preserve every exact command/outcome or explicit evidence gap.
2. Verify `plans/checkpoints/quick-reef-1568.red-green-proof.md` contains the exact focused command, RED exit 1 with the missing `sourceThreadId` failures, and GREEN exit 0. Do not rerun or synthesize RED.
3. Run the same focused command fresh: `pnpm test extensions/deliberation/src/route-match.test.ts extensions/deliberation/src/hooks.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/scripts/intake-producer.test.ts extensions/deliberation/src/contract.test.ts -- --reporter=verbose`.
4. Create `plans/checkpoints/cool-wave-8241.red-green-proof.md` with a historical RED provenance section citing the parent proof's exact command, exit code, failing assertion excerpts/totals, plus the complete fresh GREEN command, exit code, and target outcomes. Keep the behavior link visible near the top so artifact truncation cannot hide it.
5. Run `pnpm test extensions/deliberation -- --reporter=verbose` for the producer, contract, admission, and adapter regression surface; run `git diff --check` for the new Markdown artifacts. Do not rerun build/type/lint gates unless source or test code actually changes.
6. Create `plans/checkpoints/cool-wave-8241.final-note.md`. List every executed command and exact result, distinguish historical evidence from fresh verification, identify `extensions/deliberation/contracts/openclaw-overlay-v1.json` as the intentionally stricter OpenClaw provider-adapter overlay, explain that the KM mirror remains provider-generic, and retain the unresolved exact KM owner revision/hash follow-up from `provenance.json`.
7. Update `plans/checkpoints/cool-wave-8241.checkpoint.md` to link this plan, proof, evidence artifact, and final note. Mark complete only after rereading the artifacts and confirming both findings are directly answered.
8. Invoke `skill:save-learning` and save at least one learning file as the final action before finishing.

## Files to Modify

| File | Change |
| --- | --- |
| `plans/checkpoints/quick-reef-1568.evidence.md` | Generated by `task-evidence`; preserve exact historical commands/outcomes and gaps. |
| `plans/checkpoints/cool-wave-8241.red-green-proof.md` | Link genuine parent RED and record fresh matching GREEN with visible behavior evidence. |
| `plans/checkpoints/cool-wave-8241.final-note.md` | Record commands/results, overlay rationale, and owner-pin follow-up. |
| `plans/checkpoints/cool-wave-8241.checkpoint.md` | Link the canonical plan and completed acceptance artifacts. |
| `learnings/<category>/<generated-name>.md` | Save the mandatory evidence-repair learning last. |

Do not modify Deliberation production, contract, or test files unless the fresh focused run exposes a target regression.

## TDD

Implementace TDD cyklu dle `skill:tdd`, with the task's inherited-proof rule taking precedence: reuse the genuine historical RED and capture fresh GREEN; never invoke a false post-implementation RED.

**Existing test files:** `extensions/deliberation/src/hooks.test.ts`, `extensions/deliberation/src/contract.test.ts`  
**Focused command:** `pnpm test extensions/deliberation/src/route-match.test.ts extensions/deliberation/src/hooks.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/scripts/intake-producer.test.ts extensions/deliberation/src/contract.test.ts -- --reporter=verbose`

Existing behavior-linked assertions to preserve unchanged:

```ts
expect(intake).toHaveBeenCalledWith(
  expect.objectContaining({
    sourceTarget: `v1:${provider}:${accountId}:${channelId}`,
    sourceThreadId: expected,
  }),
);
expect(contract.schemas.intakeBody.required).toContain("sourceThreadId");
```

| Evidence | RED | GREEN |
| --- | --- | --- |
| Intake assertion | Parent proof shows Discord root, Slack root, and Slack reply missing `sourceThreadId`. | Fresh command passes the same three assertions. |
| Contract assertion | Parent proof shows `intakeBody.required` omitted `sourceThreadId`. | Fresh command passes required camelCase intake and generic target lifecycle assertions. |
| Command identity | Parent proof records the exact five-file command with exit 1. | Follow-up records the identical command with exit 0. |

## Dependencies

- The preserved parent proof is the only valid RED source; if `task-evidence` contradicts it or reports unavailable provenance, stop and record the gap rather than claim completion.
- `provenance.json` intentionally leaves the exact owner pin unresolved pending owner-supplied evidence.
- Existing unrelated dirty-worktree changes must remain untouched.
