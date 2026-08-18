# Plan 2026-08-17: Pin Deliberation Draft Continuations To The Current Attempt

Resolve the missing authority boundary before adding any draft-continuation code.

## Analysis

### Codebase Context

- `extensions/deliberation/index.ts` registers intake, source suppression, outbound guards, history reads, and final delivery. It never starts an embedded agent run.
- `extensions/deliberation/src/km-client.ts` validates `drafting` only as an optional KM record projection; it has no draft dispatch or result endpoint and cannot author authoritative attempt identity.
- No Deliberation source references `runEmbeddedAgent` or `RunEmbeddedAgentParams`; adding an envelope from session state, message content, paths, or the KM record would create an untrusted second ingress.
- `src/agents/embedded-agent-runner/run/params.ts` and `runtime-context-prompt.ts` support generic runs/runtime events, but neither has Deliberation attempt identity. Do not make the generic continuation prompt parse Deliberation state.
- Existing Deliberation worktree changes concern intake, history, and final delivery. Preserve them; they do not establish a drafting ingress.

### Documentation

- `docs/plugins/reference/deliberation.md` defines KM as the workflow owner and documents only six KM operations, none for drafting dispatch/result recording.
- `docs/investigations/deliberation-v2-standard-plugin-capability-investigation.md` requires immutable drafting/reviewer identities from a KM contract or configuration and rejects user/model-derived authority.

### Knowledge Base

- `learnings/architecture/2026-08-17_deliberation-continuations-require-trusted-dispatch-ingress.md`: stop until the external draft-dispatch owner provides a complete typed OpenClaw ingress.
- `plans/checkpoints/bold-peak-0850.checkpoint.md` and `plans/checkpoints/bold-peak-0850.red-green-proof.md`: no production implementation or genuine regression RED exists; the recorded skip cannot be reused as TDD proof.
- `extensions/AGENTS.md`: a plugin cannot import core internals; any new reusable core-to-plugin seam needs typed SDK exports, documentation, and contract checks.

## Available Skills

- `tdd`: run only after the owner supplies the ingress contract; record an actual failing regression before implementation.
- `task-evidence`: link historical RED only if a genuine, applicable parent RED exists; the prior skip is not evidence.
- `openclaw-testing`, `autoreview`, and `save-learning`: use for the subsequent implementation task.

## Solution

Revise the task contract rather than inventing a local dispatch path. The external drafting-dispatch owner must define and expose one authenticated in-repository ingress that creates a run with a complete, immutable envelope: request kind, attempt and revision, correlation ID, payload path, result path, and `replyRunId`. The ingress must also define the canonical result recorder and its stale/duplicate outcomes. Until that contract lands, goal-001 is blocked and must not be represented as implemented or TDD-complete.

## Implementation

1. Submit the ownership gap to the task/contract owner with the exact missing ingress and result-recorder requirements; explicitly reject session, transcript, channel, filename, and KM-record inference.
2. Update this task's acceptance contract to make the owner-provided typed ingress a prerequisite, or create a successor task once the owner supplies its source location, schema, authorization mechanism, and result API.
3. In that successor, add the closed envelope at the owner ingress, validate it before queueing/model execution, and pass it directly to a narrow runner execution path without changing generic runtime-event behavior.
4. Replace the reused drafting session's active envelope atomically; fence every payload/result tool and completion against the active attempt, correlation, paths, and `replyRunId` before side effects; clear it on every terminal outcome.
5. Keep `extensions/deliberation/src/guards.ts` restricted-send policy unchanged unless the trusted ingress is explicitly plugin-owned; do not extend KM's six-operation wire contract without owner approval.
6. Run a fresh `autoreview` after implementation and save an implementation learning as the final action.

## Files To Modify

| File | Change |
| --- | --- |
| External draft-dispatch owner contract and its in-repository ingress | Define and authenticate the complete envelope plus result-recorder contract before any OpenClaw implementation. |
| `src/agents/embedded-agent-runner/run/params.ts` and the selected execution boundary | Conditional successor change: carry the typed envelope to a dedicated draft path. |
| Nearest owner-ingress and runner continuation tests | Conditional successor change: prove replacement and pre-side-effect fencing. |
| `plans/checkpoints/warm-crag-5774.red-green-proof.md` | Conditional successor evidence only; do not fabricate RED from the prior skipped proof. |

## TDD: skip

The only safe current action is an owner-contract revision: this checkout has no trusted draft-dispatch ingress to exercise, so a RED test would necessarily invent the prohibited authority path. The successor implementation must use `skill:tdd` to add a real owner-ingress regression that dispatches attempts 1, 2, then 3 into one reused session and asserts only attempt 3 can read/write/record; a malformed or mismatched envelope must reject before the fake tool/recorder is called.

## Dependencies

- An accepted owner contract naming the trusted source file, full closed envelope, authentication boundary, current-attempt replacement semantics, result-recorder API, and stale/duplicate error semantics.
- No current parent RED is reusable: `bold-peak-0850.red-green-proof.md` documents a skip, not a failing behavior test.

---
*Created: 2026-08-17*
*Status: DRAFT*
