# Plan 2026-08-03: Repair Discord Deliberation source-target acceptance evidence

Preserve the existing implementation diff, close the remaining boundary assertion gap, and supply run-scoped proof that acceptance can inspect.

_Status: DRAFT_

## Analysis

- `extensions/deliberation/src/intake.ts:91` already changes the KM grouping identity from `${route.accountId}:${route.target}` to `discord:channel:${route.target}` while route matching still retains account identity.
- `extensions/deliberation/src/hooks.test.ts:48` already covers default/non-default accounts, bare/`channel:` targets, exact canonical intake, and `{ handled: true }`.
- `extensions/discord/src/monitor/message-handler.process.test.ts:573` already drives a loader-backed Discord event through production dispatch, asserts the exact canonical JSON body, rejects `default:<channelId>`, and proves ordinary dispatch remains suppressed.
- `plans/checkpoints/quick-dune-1263.red-green-proof.md` now contains genuine RED (`1 failed | 104 passed`) and GREEN (`105 passed`) for the same Discord boundary command. `plans/checkpoints/quick-dune-1263.evidence.md` reports truncated session command lines, so the proof file is the authoritative historical TDD artifact.
- `plans/checkpoints/acceptance-runs/quick-dune-1263-acceptance-001/result.json` rejected the supplied artifact set, not the current three-file diff: it saw unrelated files, an incomplete proof snapshot, no canonical Test Gate result, and no final note.
- Goal 004 is already accepted. Do not change routing, fail-closed suppression, processing-route isolation, KM auth/SecretRef handling, or delivery controls.

## Knowledge Base

- `learnings/architecture/deliberation-route-identity-vs-km-source-target.md`: route keys remain account-qualified; KM `sourceTarget` is provider-channel-qualified.
- `learnings/tooling/2026-08-02-current-run-canonical-gate-provenance.md`: local runs cannot be relabeled as the caller-owned canonical Test Gate.
- `learnings/architecture/2026-08-02_acceptance-repair-plans-must-include-owner-implementation.md`: the acceptance artifact set must include the owning implementation and genuine historical RED plus fresh follow-up GREEN.
- Knowledge recall used deterministic local fallback because `openclaw-fork-learnings` was unavailable; returned generic channel-runtime files add no constraints to this fix.

## Available Skills

- `tdd`: preserve genuine RED/GREEN provenance; never manufacture a new RED after implementation exists.
- `task-evidence`: extract parent command provenance and report its `command_lines_truncated` gap verbatim.
- `acceptance`: validate that the final artifact set maps each finding to concrete source, proof, gate, and final-note evidence.
- `autoreview`: run the mandatory fresh scoped review before handoff.
- `save-learning`: save a new acceptance-provenance learning as the final action.

## Implementation

1. Inspect the current diff and retain the existing changes in `intake.ts`, `hooks.test.ts`, and `message-handler.process.test.ts`; exclude unrelated architecture reviews, trajectory pointers, diagnostics, backups, contracts, and other dirty-worktree files from task-scoped evidence.
2. In the loader-backed Discord integration, explicitly assert the fulfilled `inbound_claim` handler result is `{ handled: true }` after successful KM intake. Reuse the existing `intakeHandler.mock.results` value; do not change production dispatch or hook behavior.
3. Create `plans/checkpoints/calm-wave-2949.red-green-proof.md` as follow-up provenance: link the genuine RED section in `quick-dune-1263.red-green-proof.md`, record why a fresh RED would be fabricated, and capture fresh GREEN output for the identical focused Discord command. Implementace TDD cyklu dle skill:tdd, with the task's explicit historical-RED exception.
4. Run the focused Deliberation suite and build. Run fresh scoped `autoreview` until no actionable findings remain.
5. Submit the preserved workspace to the caller-owned canonical Test Gate using the registered project command `cd ~/Projects/openclaw-fork && npm test`. Record the concrete gate reference, command, exit status, timestamp, and logs identifying the focused Discord/Deliberation coverage; `not run` or a local substitute leaves the task incomplete.
6. Write `plans/checkpoints/calm-wave-2949.final-note.md` with exact commands, counts, exit results, proof links, and the explicit activation statement: a built/managed Gateway must be rebuilt and its process restarted to load the plugin change; this task does not restart live services.
7. Update `plans/checkpoints/calm-wave-2949.checkpoint.md` to link this plan, the three-file implementation diff, historical RED, fresh GREEN, canonical Test Gate reference, autoreview, and final note. Validate the artifact set with `acceptance`.
8. Invoke `save-learning` last and save at least one new learning about supplying preserved implementation diffs and current-run gate provenance to acceptance retries.

## Files to Modify

| File                                                             | Change                                                                                                                    |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `extensions/deliberation/src/intake.ts`                          | Preserve the existing canonical `discord:channel:<normalized-channel-id>` production change.                              |
| `extensions/deliberation/src/hooks.test.ts`                      | Preserve the existing account-independent canonicalization and terminal-success matrix.                                   |
| `extensions/discord/src/monitor/message-handler.process.test.ts` | Preserve exact body/negative assertions and add explicit resolved `{ handled: true }` proof at the real inbound boundary. |
| `plans/checkpoints/calm-wave-2949.red-green-proof.md`            | Link genuine parent RED and capture fresh follow-up GREEN without fabricating RED.                                        |
| `plans/checkpoints/calm-wave-2949.final-note.md`                 | Record exact verification outcomes and Gateway activation requirements.                                                   |
| `plans/checkpoints/calm-wave-2949.checkpoint.md`                 | Link the plan and complete run-scoped implementation/evidence lineage.                                                    |

## TDD

**Test file:** `extensions/discord/src/monitor/message-handler.process.test.ts`
**Focused command:** `pnpm test extensions/discord/src/monitor/message-handler.process.test.ts -- --reporter=verbose`

```ts
// Existing imports include expect and vi from "vitest".
const intakeResult = intakeHandler.mock.results[0]?.value;
await expect(intakeResult).resolves.toEqual({ handled: true });
expect(intakeBody).toMatchObject({
  sourceTarget: `discord:channel:${sourceId}`,
});
expect(intakeBody.sourceTarget).not.toBe(`default:${sourceId}`);
```

| Assertion                   | Historical RED                                                                                       | Fresh GREEN                                                                                    |
| --------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Canonical source target     | Parent proof received `default:1494265174389948538` instead of `discord:channel:1494265174389948538` | Exact canonical value passes and old value is rejected.                                        |
| Terminal real inbound claim | Mapping failure prevented the boundary test from passing                                             | Successful KM intake resolves `{ handled: true }`; ordinary dispatch and delivery stay unused. |

Do not revert production code to recreate RED. Link `plans/checkpoints/quick-dune-1263.red-green-proof.md:5` and capture current-task GREEN from the unchanged focused command.

## Verification

1. Fresh focused GREEN: `pnpm test extensions/discord/src/monitor/message-handler.process.test.ts -- --reporter=verbose`.
2. Focused plugin regression: `pnpm test extensions/deliberation -- --reporter=verbose`.
3. Bundled runtime build: `pnpm build`.
4. Task-scoped diff check: `git diff -- extensions/deliberation/src/intake.ts extensions/deliberation/src/hooks.test.ts extensions/discord/src/monitor/message-handler.process.test.ts` must show the production mapping and both regression surfaces.
5. Caller-owned canonical Test Gate: registered command `cd ~/Projects/openclaw-fork && npm test`, with an inspectable non-`not-run` reference.
6. Final artifact audit: each unmet goal and finding points to source lines, fresh command output, canonical gate evidence, and the activation note.
