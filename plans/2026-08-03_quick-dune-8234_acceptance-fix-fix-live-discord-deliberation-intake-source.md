# Plan 2026-08-03: Supply the owning Discord Deliberation canonicalization diff

Ensure the preserved production fix and its two regression surfaces are included in this task's review material, then capture fresh follow-up proof without recreating completed work.

_Task: `quick-dune-8234`_
_Status: DRAFT_

## Analysis

- `extensions/deliberation/src/intake.ts:91` already contains the required owning change: normalized `route.target` becomes `discord:channel:${route.target}` instead of `${route.accountId}:${route.target}`.
- `extensions/deliberation/src/route-match.ts:11` removes an optional runtime `channel:` prefix before intake; `extensions/deliberation/src/config.ts:62` correctly retains account identity only for configured route matching.
- `extensions/deliberation/src/hooks.test.ts:48` already proves default/non-default accounts and bare/prefixed targets produce one canonical target and terminally return `{ handled: true }`.
- `extensions/discord/src/monitor/message-handler.process.test.ts:573` already drives the configured pilot channel through loader-backed production dispatch, asserts `discord:channel:1494265174389948538`, rejects `default:1494265174389948538`, and proves the hook itself returned `{ handled: true }`.
- `plans/checkpoints/acceptance-runs/calm-wave-2949-acceptance-001/result.json:14` rejected the supplied task-scoped artifact because it omitted the `intake.ts` hunk; it did not identify another behavior defect.
- The worktree also contains unrelated Deliberation contract changes and generated artifacts. Do not modify, revert, or include them in this repair's implementation diff.

## Knowledge Base

- `learnings/architecture/deliberation-route-identity-vs-km-source-target.md`: route matching remains account-qualified, while KM grouping identity is provider/channel-qualified.
- `learnings/test-failures/calm-wave-2949-assert-terminal-hook-outcomes.md`: composed ingress proof must assert the terminal hook result as well as payload and suppression.
- `learnings/architecture/2026-08-02_acceptance-repair-plans-must-include-owner-implementation.md`: acceptance narratives cannot replace the owning production diff.
- `learnings/tooling/2026-08-02-current-run-canonical-gate-provenance.md`: historical proof may be linked, but current-run GREEN and canonical gate evidence must retain their real provenance.
- Knowledge recall used deterministic local fallback because `openclaw-fork-learnings` was unavailable; the returned generic architecture files added no task-specific constraint.

## Available Skills

- `tdd`: preserve the genuine parent RED and capture fresh GREEN; never revert working code to manufacture RED.
- `task-evidence`: recover exact parent command provenance if the existing proof is insufficient, reporting any gaps verbatim.
- `openclaw-testing`: run the focused Discord and Deliberation proof before broader checks.
- `autoreview`: perform the mandatory fresh review of only the three implementation files before handoff.
- `acceptance`: audit the final supplied material against `goal-001` and verify the owning hunk is visible before finalization.
- `save-learning`: run last and save at least one learning from this follow-up.

## Implementation

1. Preserve the existing changes in `extensions/deliberation/src/intake.ts`, `extensions/deliberation/src/hooks.test.ts`, and `extensions/discord/src/monitor/message-handler.process.test.ts`; do not redo the canonicalization or broaden behavior.
2. Generate and inspect the task-scoped diff for exactly those three files. Completion is blocked unless it visibly includes the `intake.ts` replacement from account-qualified identity to `discord:channel:${route.target}` plus both regression surfaces.
3. Create `plans/checkpoints/quick-dune-8234.red-green-proof.md`: link the genuine RED in `plans/checkpoints/quick-dune-1263.red-green-proof.md:5`, explain that production is preserved, and append fresh GREEN results from the identical focused command.
4. Run the focused Deliberation suite and bundled-runtime build. Run fresh scoped `autoreview` until no accepted/actionable findings remain.
5. Record exact commands, outcomes, source paths, and the inspected three-file diff in `plans/checkpoints/quick-dune-8234.checkpoint.md`. Keep unrelated dirty-worktree files out of the supplied task material.
6. Before acceptance finalization, verify the caller-supplied diff itself contains `extensions/deliberation/src/intake.ts`; a checkpoint statement that the file was preserved is not sufficient.
7. Run `save-learning` as the final action and save at least one learning about validating the actual acceptance artifact set, not only workspace state.

## Files to Modify

| File                                                             | Change                                                                                                       |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `extensions/deliberation/src/intake.ts`                          | Preserve and supply the owning `discord:channel:<normalized-channel-id>` production hunk.                    |
| `extensions/deliberation/src/hooks.test.ts`                      | Preserve and supply direct account-independent normalization and terminal-claim coverage.                    |
| `extensions/discord/src/monitor/message-handler.process.test.ts` | Preserve and supply loader-backed pilot-channel payload, negative old-value, and terminal-result assertions. |
| `plans/checkpoints/quick-dune-8234.red-green-proof.md`           | Link genuine historical RED and record fresh current-task GREEN.                                             |
| `plans/checkpoints/quick-dune-8234.checkpoint.md`                | Record exact verification and confirm the owning diff was included in supplied task material.                |

## TDD

Implement the evidence cycle with `skill:tdd`, using the task's explicit historical-RED exception.

**Test file:** `extensions/discord/src/monitor/message-handler.process.test.ts`
**Run command:** `pnpm test extensions/discord/src/monitor/message-handler.process.test.ts -- --reporter=verbose`
**Edit hint:** assertions already exist in `runDeliberationIntegrationTest`; do not edit production or tests merely to recreate RED.

```ts
// Existing loader-backed test, after parsing requestInit.body.
await expect(intakeHandler.mock.results[0]?.value).resolves.toEqual({ handled: true });
expect(intakeBody).toMatchObject({
  sourceTarget: `discord:channel:${sourceId}`,
});
expect(intakeBody.sourceTarget).not.toBe(`default:${sourceId}`);
```

| Test                                    | Historical RED                                                         | Fresh GREEN                                                                                        |
| --------------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Configured Discord pilot-channel intake | Received `default:1494265174389948538` instead of the canonical value. | Exact `discord:channel:1494265174389948538` body passes and the hook resolves `{ handled: true }`. |
| Direct normalization matrix             | Parent implementation lacked account-independent canonical output.     | Default/non-default accounts and bare/`channel:` targets all emit `discord:channel:source`.        |

## Verification

1. `git diff -- extensions/deliberation/src/intake.ts extensions/deliberation/src/hooks.test.ts extensions/discord/src/monitor/message-handler.process.test.ts`
2. `pnpm test extensions/discord/src/monitor/message-handler.process.test.ts -- --reporter=verbose`
3. `pnpm test extensions/deliberation -- --reporter=verbose`
4. `pnpm build`
5. `git diff --check -- extensions/deliberation/src/intake.ts extensions/deliberation/src/hooks.test.ts extensions/discord/src/monitor/message-handler.process.test.ts`
6. Run the caller-owned canonical Test Gate using the registered `cd ~/Projects/openclaw-fork && npm test` command and preserve its actual reference; do not relabel local focused output as canonical evidence.
7. Inspect the final acceptance input and block finalization if the owning `intake.ts` hunk is absent.
