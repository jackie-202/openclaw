# Plan 2026-08-17: Pin Deliberation draft continuations to the current attempt payload

Add one trusted, runtime-owned draft-dispatch envelope that replaces session-local continuation state and fences every result-producing action to the active attempt.

## Analysis

### Codebase context

- `extensions/deliberation/index.ts` registers source intake, source suppression, restricted-session send guards, history reads, and final delivery; it does not dispatch drafting work.
- `extensions/deliberation/src/km-client.ts` accepts `drafting.attempt`, `correlationId`, `payloadPath`, and `resultPath` only as a closed record projection; it exposes no drafting dispatch/result endpoint.
- `extensions/deliberation/src/guards.ts` protects outbound tools only. Preserve those restrictions and do not weaken memory-flush behavior.
- `src/agents/embedded-agent-runner/run/runtime-context-prompt.ts` converts an empty-transcript runtime event into `Continue the OpenClaw runtime event.` and retains prior session history; that generic path has no current-attempt identity.
- `src/agents/embedded-agent-runner/run/params.ts` carries no typed internal draft-dispatch envelope. No in-repo producer currently binds a drafting request to `runId`, payload, result path, and correlation.

### Documentation

- `docs/plugins/reference/deliberation.md` defines Deliberation as an intake/final-delivery adapter and confirms KM owns workflow controls.
- `docs/investigations/deliberation-v2-standard-plugin-capability-investigation.md` assigns drafting/reviewer identity to immutable contracts/configuration and direct outbound restrictions to `before_tool_call`.
- No public documentation update is planned unless the selected in-repo dispatch seam becomes a plugin SDK or operator-facing contract.

### Knowledge base

- Learning search used local fallback (`openclaw-fork-learnings` collection absent).
- `learnings/architecture/calm-crag-8936-sync-required-envelope-fields.md`: required envelope fields require complete fixture/projection synchronization; retain camelCase wire names.
- `learnings/patterns/bright-reef-1988-keep-focused-orchestration-tests-complementary.md`: put cross-component continuation replay proof in one integration test and retain narrow boundary tests for malformed envelopes.
- `learnings/test-failures/2026-08-17_test-replay-safety-at-the-reservation-fence.md`: prove replay safety at the pre-side-effect fence.

## Decision Gate

1. Identify the in-repo trusted caller that creates the draft run. If none exists, stop before implementation and record that the stated external contract lacks an OpenClaw ingress for the envelope; do not infer it from a channel message, transcript, payload filename, or KM record projection.
2. If the caller exists, keep ownership at that caller plus the embedded-runner execution boundary. Do not add Deliberation-specific parsing to the generic continuation prompt and do not change the six-endpoint KM wire mirror without an accepted contract update.

## Implementation

1. Define a closed internal `DraftDispatchEnvelope` at the identified caller/runner boundary with `requestKind`, attempt/revision, `correlationId`, `payloadPath`, `resultPath`, and `replyRunId`; validate non-empty values, expected attempt/path identity, and camelCase keys before queueing or model invocation.
2. Replace, rather than append to, the session's prior draft execution context when a valid envelope targets an existing drafting session. Build the model-visible task from the current envelope and payload only; do not submit the generic runtime-event prompt for this dispatch.
3. Make the result route runtime-owned: expose only the current envelope's canonical recorder/action, validate its returned identifiers against the active envelope, and reject duplicate/stale completion before a write, command, or result publication.
4. Fence every tool/action that can read/write the draft payload or result using the active `replyRunId` and exact current paths. Reject attempt/correlation/path/run mismatches before side effects; retain existing restricted-session outbound and memory-flush guards unchanged.
5. Clear the active envelope on terminal success/failure so an ordinary continuation cannot revive prior metadata or replay a prior tool action.
6. Extend only the affected closed schemas, fixture assertions, and provenance hash if the internal envelope is represented in an existing contract artifact; preserve existing camelCase names and reject snake_case.

## Files to Modify

| File | Change |
| --- | --- |
| In-repo drafting dispatch caller, to be identified by Decision Gate | Construct and validate the authoritative current-attempt envelope before invoking the existing session. |
| `src/agents/embedded-agent-runner/run/params.ts` and the runner module that consumes the chosen field | Carry the typed envelope to the execution boundary and replace stale continuation state. |
| `src/agents/embedded-agent-runner/run/runtime-context-prompt.ts` or a narrow adjacent helper | Keep generic runtime events generic; give validated draft dispatches an explicit envelope-derived prompt path. |
| `extensions/deliberation/src/guards.ts` | Add only an envelope-aware pre-side-effect fence if the selected dispatch path uses plugin hooks; preserve send restrictions. |
| `extensions/deliberation/src/draft-dispatch.test.ts` (new) | Isolated attempt-pinning, mismatch, and exactly-once result tests without provider or transport. |
| Existing runner continuation test nearest to the selected dispatch caller | Prove the envelope reaches a reused session without generic continuation replay. |

## TDD

**Workflow:** Implement the TDD cycle using `skill:tdd`; record RED/GREEN evidence in `plans/checkpoints/bold-peak-0850.red-green-proof.md`.

**Test file:** `extensions/deliberation/src/draft-dispatch.test.ts`

**Run command:** `pnpm test extensions/deliberation/src/draft-dispatch.test.ts`

```ts
import { describe, expect, it, vi } from "vitest";
import { createDraftDispatch } from "./draft-dispatch.js";

describe("Deliberation draft dispatch", () => {
  it("replaces attempts 1 and 2 with attempt 3 in a continued drafting session", async () => {
    const recordResult = vi.fn();
    const dispatch = createDraftDispatch({ recordResult });
    await dispatch({ requestKind: "rewrite", attempt: 1, revision: 1, correlationId: "c1", payloadPath: "attempt-1.payload.json", resultPath: "attempt-1.result.json", replyRunId: "run-1" });
    await dispatch({ requestKind: "rewrite", attempt: 2, revision: 2, correlationId: "c2", payloadPath: "attempt-2.payload.json", resultPath: "attempt-2.result.json", replyRunId: "run-2" });
    await dispatch({ requestKind: "rewrite", attempt: 3, revision: 3, correlationId: "c3", payloadPath: "attempt-3.payload.json", resultPath: "attempt-3.result.json", replyRunId: "run-3", continuation: true });
    expect(recordResult).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ attempt: 3, correlationId: "c3", resultPath: "attempt-3.result.json", replyRunId: "run-3" }));
  });
});
```

| Test | RED | GREEN |
| --- | --- | --- |
| Continued attempt 3 replaces attempts 1/2 | Missing module or stale replay reaches attempt-2 path | Exactly one attempt-3 result; no attempt-2 read/write/command. |
| Inconsistent correlation, payload, result, or `replyRunId` | Invalid envelope is accepted or reaches fake recorder | Rejection before recorder/tool invocation. |
| Repeated continuation after terminal result | Second recorder call succeeds | Existing terminal result is returned/rejected without a second side effect. |
| Existing isolation | Restricted send or memory-flush guard changes | Existing `hooks.test.ts` assertions remain green. |

Run the selected focused runner continuation test after the unit test, then the smallest relevant broader Deliberation suite chosen via `skill:openclaw-testing`. Record exact commands and outcomes in the implementation final note.

## Dependencies

- The task statement is the complete cross-system contract. Do not inspect or modify the KM repository or external configuration.
- `tdd`, `openclaw-testing`, `autoreview`, and `save-learning` apply during implementation; `save-learning` is mandatory after completion.

---
*Created: 2026-08-17*
*Status: DRAFT*
