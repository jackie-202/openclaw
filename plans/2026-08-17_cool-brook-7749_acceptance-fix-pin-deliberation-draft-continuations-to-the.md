# Plan 2026-08-17: Pin Deliberation continuations to the current attempt

Revise the rejected parent plan by making the missing KM-owner ingress an explicit delivery dependency, not a completed implementation.

## Analysis

- The inherited task made no production changes. Its checkpoint correctly records that `extensions/deliberation/index.ts` registers intake, guards, history, and final delivery only.
- `extensions/deliberation/src/km-client.ts` exposes the KM's six operations. Its `drafting` object is an optional record projection, not a dispatch or result API.
- `extensions/deliberation/contracts/km-wire-v1.json` has no drafting dispatch/result endpoint; `extensions/deliberation/contracts/provenance.json` marks the KM owner pin as follow-up-required.
- `extensions/deliberation/src/orchestration.test.ts` proves final-delivery fencing only. It cannot exercise a draft continuation without inventing the absent owner call.
- Do not derive attempt identity from a session, transcript, payload filename, or a projected KM record. That creates a second untrusted ingress.

## Approach

1. Obtain an accepted KM-owner revision that adds one authenticated draft-dispatch ingress and one canonical draft-result recorder. The contract must define a closed immutable envelope: request kind, record ID, attempt, candidate revision, correlation ID, payload path and digest, result path, `replyRunId`, and terminal/stale/duplicate outcomes.
2. Mirror the accepted contract exactly in `extensions/deliberation/contracts/km-wire-v1.json` and its provenance pin. Reject any endpoint or field not supplied by the owner; preserve the existing six-operation contract until the owner explicitly changes it.
3. Implement the owner-authenticated ingress at the owner-selected OpenClaw boundary. Validate the complete envelope before queueing or starting an embedded run, replace the reused session's active envelope atomically, and pass it unchanged to the narrow draft execution path.
4. Fence payload reads, result writes, and result recording against the active envelope's attempt, revision, correlation ID, paths/digest, and `replyRunId` before their first side effect. Return the contract's stale/duplicate outcome and clear the active envelope for every terminal result.
5. Keep generic embedded-runner continuation prompts and Deliberation source/final-delivery guards unchanged unless the owner contract specifically selects a typed SDK seam.

## Files To Modify

| File | Change |
| --- | --- |
| KM-owner source and contract, supplied by the owner | Add authenticated dispatch, immutable envelope, result recorder, and stale/duplicate semantics. |
| `extensions/deliberation/contracts/km-wire-v1.json` | Mirror the accepted owner endpoints and closed schemas only after the owner revision exists. |
| `extensions/deliberation/contracts/provenance.json` | Replace `follow-up-required` with the exact owner revision and file hashes. |
| Owner-selected OpenClaw ingress and its colocated test | Validate, atomically replace, and propagate the immutable envelope; reject before side effects. |
| `plans/checkpoints/cool-brook-7749.red-green-proof.md` | Record fresh RED/GREEN evidence; do not reuse the parent's skipped proof. |

## TDD: skip

No trusted dispatch ingress or result recorder exists in this checkout, so a runnable RED would require a fabricated authority path. Once the owner contract lands, use `skill:tdd` before implementation: dispatch attempts 1, 2, and 3 into one reused session; assert only attempt 3 may read the payload, write the result, or record completion, and assert malformed or stale envelopes call none of those fakes. Run the new colocated test with `pnpm test <owner-selected-test-path>`.

## Verification

- Confirm the supplied owner revision defines authentication, every envelope field, active-envelope replacement, and stale/duplicate results.
- Run the new focused owner-ingress test for RED, then GREEN; record both commands and outcomes in `plans/checkpoints/cool-brook-7749.red-green-proof.md`.
- Run `pnpm test extensions/deliberation/src/contract.test.ts` after updating the contract mirror and `git diff --check`.
- If the heavy-check lock is held, do not terminate its owner; record the blocked focused command and continue with non-conflicting checks.

## Dependencies

- The KM owner must supply the authoritative source location and accepted revision. Current provenance explicitly lacks that pin.
- Relevant skills: `tdd` for the eventual RED/GREEN cycle, `openclaw-testing` for the narrowest valid lane, `autoreview` after code changes, and `save-learning` as the implementing session's final action.

---
*Status: DRAFT*
