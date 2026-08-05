# Plan 2026-08-04: Complete Deliberation Live Intake Acceptance Evidence

Preserve the completed repair and supply only run-owned RED/GREEN and real-listener persistence evidence.

_Status: DRAFT_

## Analysis

### Codebase Context

- `extensions/deliberation/src/km-client.ts` already replaces global `fetch` with the listener-compatible Node transport and emits bounded request diagnostics.
- `extensions/deliberation/scripts/intake-producer.ts` already composes `createInboundClaimHandler` with the real `KmClient`; it is the required producer boundary.
- `extensions/deliberation/src/hooks.test.ts:39` and `extensions/deliberation/scripts/intake-producer.test.ts:6` already replay the same Discord provider event ID and assert one in-memory record, but they do not prove persistence in the externally owned KM store.
- `docs/plugins/reference/deliberation.md:72` already documents the safe probe command and requires the external harness to assert exactly one canonical record.
- Production and test files are existing dirty worktree state from the parent task; do not edit, revert, or recommit them during this evidence-only follow-up.

### Existing Evidence

- `plans/checkpoints/bold-cove-8557.red-green-proof.md` contains the genuine parent RED (`exit 1`, 7 failed/30 passed) and GREEN (`exit 0`, 39 passed) for the same focused command.
- `plans/checkpoints/bold-cove-8557.evidence.md` cannot independently recover outcomes because its command lines are truncated; cite the immutable proof artifact instead of reconstructing history.
- `plans/checkpoints/acceptance-runs/bold-cove-8557-acceptance-001/result.json` rejected the supplied evidence because it lacked accepted GREEN provenance and listener-owned response/count evidence.

### Knowledge Base

- `learnings/tooling/evidence-only-tdd-followups-preserve-historical-red.md`: never manufacture a new RED after the fix; link the historical RED and capture fresh GREEN with the same command.
- `learnings/tooling/2026-08-02_canonical-gate-evidence-must-belong-to-current-acceptance-run.md`: record exact command, timestamp, exit code, named tests, and counts under the current task.
- `learnings/test-failures/bold-cove-8557-real-listener-proof-uses-fork-producer.md`: listener proof must invoke the fork producer, not a synthetic HTTP request.
- `learnings/runtime-errors/node-fetch-closed-header-contracts.md`: capture the emitted production transport and assert duplicate persistence; a permissive mock is insufficient.
- Knowledge recall used deterministic local fallback because collection `openclaw-fork-learnings` was unavailable; only the acceptance/protocol learnings above were actionable.

## Available Skills

- `task-evidence`: recover exact historical task evidence without rerunning or inventing outcomes.
- `tdd`: capture fresh GREEN while preserving the parent RED provenance.
- `acceptance`: finalize structured evidence against `goal-001` after both artifacts exist.
- `openclaw-testing`: select and run the narrow Deliberation verification command.
- `save-learning`: mandatory final action after evidence and checkpoint completion.

## Implementation

1. Create `plans/checkpoints/bright-vale-5327.checkpoint.md` and link this plan plus the parent task/proof; record that production-code changes are forbidden unless fresh verification exposes a concrete defect.
2. Use `skill:task-evidence` for `bold-cove-8557`; preserve any reported truncation or unavailable outcome as an explicit gap and do not use it to replace the complete parent proof.
3. Use `skill:tdd` to create `plans/checkpoints/bright-vale-5327.red-green-proof.md`: reference the immutable RED in `plans/checkpoints/bold-cove-8557.red-green-proof.md:5`, then capture fresh GREEN with the exact focused command below. Record timestamp, exit code, test-file count, test count, and named producer/persistence cases.
4. Obtain an authority-owned disposable KM protocol-v1 listener with `source-intake=true`, `sender=false`, a disposable canonical store, and an environment-supplied credential. If its start/count interface is unavailable, stop and record that external evidence gap rather than substituting the local fixture.
5. Invoke `extensions/deliberation/scripts/intake-producer.ts` twice with identical Discord-shaped input and provider event ID `1534181693647355986`, following `docs/plugins/reference/deliberation.md:72`. Do not place credentials, endpoint details, content, sender identity, or raw listener errors in artifacts.
6. Write `plans/checkpoints/bright-vale-5327.real-listener-proof.md` with the sanitized listener identity/run reference, both exact probe outcomes (`handled`, `providerEventId`, `duplicate`, exit code), and the listener-owned canonical-store query showing exactly one record for that provider event ID after replay.
7. Run the focused GREEN command once more only if the listener exercise changed the worktree or exposed a defect. If a real defect exists, document it first, make the smallest tested correction, and run fresh `$autoreview`; otherwise leave all production/tests/docs unchanged.
8. Update the task checkpoint with exact artifact paths, commands, outcomes, remaining gaps, and `goal-001` evidence mapping. Use `skill:acceptance` to finalize the evidence package only after both GREEN and real-listener artifacts are inspectable.
9. Run `skill:save-learning` as the final action and save at least one learning about run-owned acceptance evidence or the real-listener proof boundary.

## Files to Modify

| File                                                        | Change                                                                              |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `plans/checkpoints/bright-vale-5327.checkpoint.md`          | Link this plan and track evidence-only progress, commands, outcomes, and gaps.      |
| `plans/checkpoints/bright-vale-5327.red-green-proof.md`     | Link the genuine parent RED and capture fresh current-task GREEN.                   |
| `plans/checkpoints/bright-vale-5327.real-listener-proof.md` | Record sanitized producer replay responses and listener-owned one-record proof.     |
| `learnings/<category>/<generated-name>.md`                  | Mandatory learning created by `skill:save-learning` after all evidence is complete. |

Do not modify `extensions/deliberation/**`, `docs/plugins/reference/deliberation.md`, parent proof files, acceptance-run artifacts, or `plans/tasks/**` unless fresh proof identifies and documents a real implementation defect.

## TDD

This is an evidence-only continuation of the parent TDD cycle. Do not add a new failing assertion or revert the implementation to manufacture RED.

**Historical RED:** `plans/checkpoints/bold-cove-8557.red-green-proof.md:5`
**Target tests:** `extensions/deliberation/src/hooks.test.ts`, `extensions/deliberation/src/km-client.test.ts`, `extensions/deliberation/scripts/intake-producer.test.ts`
**Fresh GREEN command:** `pnpm test extensions/deliberation/src/hooks.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/scripts/intake-producer.test.ts -- --reporter=verbose`
**Workflow:** execute with `skill:tdd` and store current-task evidence in `plans/checkpoints/bright-vale-5327.red-green-proof.md`.

| Proof         | Required outcome                                                                                                                                       |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Parent RED    | Focused regression fails before implementation with `handled:false`; diagnostic and producer tests also fail/miss.                                     |
| Current GREEN | Same focused command exits 0 and names the closed-wire persistence and duplicate-replay tests as passing.                                              |
| Real listener | First probe returns `handled:true, duplicate:false`; replay returns `handled:true, duplicate:true`; listener-owned query reports one canonical record. |

## Dependencies

- Access to the authority-owned temporary KM listener, disposable canonical store, and owner-provided record-count/query mechanism.
- Credential supplied only through `OPENCLAW_DELIBERATION_KM_CREDENTIAL`.
- The parent proof remains immutable and inspectable.

---

_Created: 2026-08-04_
_Status: DRAFT_
