# Plan 2026-08-07: Deliberation final provider adapter acceptance repair

_Status: DRAFT_

## Progress

- [x] Phase 0: Initialize canonical plan
- [x] Phase 1: Research current contracts and implementation state
- [x] Phase 2: Review applicable learnings
- [x] Phase 3: Synthesize implementation and TDD steps

## Analysis

### Codebase context

- `km-client.ts` is fixed to KM protocol v1 and exposes only intake, ready, reserve, complete, and reconcile; no immutable envelope or provider-invoked acknowledgment exists.
- `source-identity.ts` provides the canonical `v1:<provider>:<account>:<channel>` parser; `history-read.ts` demonstrates strict configured-route matching and account-bound public SDK use.
- `sole-send.test.ts` is a static token scan and cannot prove activation or authority.
- `channel-outbound.ts` and `sdk-channel-outbound.md` expose only `sendDurableMessageBatch`, whose durable/retry-owning semantics violate the required one-shot boundary.
- `index.ts` has no final-delivery trigger or adapter registration. No `final-adapter.ts` exists.

### Documentation and knowledge

- `extensions/AGENTS.md` requires plugin production code to use public SDK seams only; missing seams require a typed SDK addition in a separately reviewed core task.
- `plans/tasks/2026-08-06_deliberation-v2-05b-plugin-confined-final-adapter.md` permits a partial result only as an evidence-backed blocker naming capability, inspected APIs, exact impossibility, and the smallest generic seam.
- Historical proof at `plans/checkpoints/dark-reef-5008.red-green-proof.md` is not valid implementation GREEN: it records no production change and no focused RED.
- Recall used local fallback because `openclaw-fork-learnings` is absent. Relevant rules require external owner authority, explicit acceptance-fix outcomes, and activation tracing rather than token scans; `v1` is the current wire version, not a legacy implementation path.

## Approach

1. Re-read the pinned Slice 5A KM contract and public SDK exports at execution time. Do not infer either from the prior plan, checkpoint, or existing `v1` client.
2. Implement only when the KM contract supplies a versioned immutable envelope and durable provider-invoked acknowledgement, and the SDK exposes an account-bound, non-durable, non-retrying one-shot sender with a target-bound receipt.
3. If either contract remains unavailable, produce the required task-result blocker instead of treating the stop as success: name the capability, each inspected public API/path, the exact mismatch, and the smallest generic core seam. Make no core or production changes.

## Implementation

1. Record the two gate results in `plans/checkpoints/fresh-peak-7116.checkpoint.md`; link the historical `dark-reef-5008` proof as context, not fresh TDD evidence.
2. When both gates pass, add `final-adapter.ts` as the only Deliberation provider side-effect boundary. Parse the envelope as `unknown`, validate its exact accepted closed schema, derive the sole provider/account/channel from `sourceTarget`, and reject stale, mismatched, override, bot, and self inputs before acknowledgement or send.
3. Extend `km-client.ts` only with the accepted Slice 5A request/response parser and invocation-ack method. Reject response schema/ack failure with zero provider calls; do not add a competing KM schema, retry, replay, reconciliation, or fallback.
4. Inject the proven public sender into the adapter. Acknowledge invocation first, call it once with the canonical account/channel, accept only a receipt bound to that target as `SENT`, and classify denial, rejection, 429, transport failure, and timeout as closed `delivery_failed`. Leave post-invocation receipt loss unknown to KM.
5. Wire the adapter through `index.ts` only if the accepted KM/SDK contract identifies a plugin-local entry point. Preserve current dispatch/tool/message guards and do not create session, generic, operator, synthetic, or V1 alternate delivery paths.
6. Replace `sole-send.test.ts`'s fixed-file literal scan with an authority ledger covering sender import, construction, registration, and reachable invocation. Prove rejected paths never call the injected sender and enumerate all production sender call sites.
7. Capture fresh focused GREEN and `pnpm tsgo:extensions`; audit `git diff --name-only` and `git diff --numstat` to confirm production changes stay in `extensions/deliberation/`. Run `skill:save-learning` last, after implementation or the complete blocker result.

## Files to Modify

| File                                                | Change                                                                               |
| --------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `extensions/deliberation/src/final-adapter.ts`      | Add the conditional, sole one-shot provider adapter.                                 |
| `extensions/deliberation/src/final-adapter.test.ts` | Add fake-backed envelope, ack, sender-count, target, receipt, and error tests.       |
| `extensions/deliberation/src/km-client.ts`          | Add only the accepted Slice 5A envelope/invocation-ack client contract.              |
| `extensions/deliberation/src/km-client.test.ts`     | Lock exact endpoint/body/closed response parsing after the KM contract is available. |
| `extensions/deliberation/src/sole-send.test.ts`     | Replace static scan with activation and sole-authority proof.                        |
| `extensions/deliberation/index.ts`                  | Register the adapter only when the accepted contract requires a local trigger.       |
| `plans/checkpoints/fresh-peak-7116.checkpoint.md`   | Record contract-gate proof, fresh verification, or the required blocker.             |

Do not modify `src/**` in this task. If a sender seam is absent, the proposed separate core task should expose one narrow generic runtime SDK function accepting an explicit channel, account ID, target, text, and abort signal, performing exactly one native send with no queue, retry, reroute, or reconciliation, and returning a target-bound receipt.

## TDD

Use `skill:tdd`; record fresh evidence in `plans/checkpoints/fresh-peak-7116.red-green-proof.md`. Retain a link to `plans/checkpoints/dark-reef-5008.red-green-proof.md` as historical gate evidence only.

**Test file:** `extensions/deliberation/src/final-adapter.test.ts`  
**Run command:** `pnpm test extensions/deliberation/src/final-adapter.test.ts`

```ts
import { describe, expect, it, vi } from "vitest";
import { createFinalAdapter } from "./final-adapter.js";

describe("final provider adapter", () => {
  it("rejects an unrecognized envelope before acknowledgement or send", async () => {
    const acknowledgeInvocation = vi.fn();
    const send = vi.fn();
    const adapter = createFinalAdapter({ acknowledgeInvocation, send });

    await expect(adapter.deliver({})).resolves.toMatchObject({ kind: "delivery_failed" });
    expect(acknowledgeInvocation).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled(); // RED: adapter does not exist.
  });
});
```

| Test                                                          | RED                                 | GREEN                                                                    |
| ------------------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------ |
| Unknown/malformed envelope                                    | Missing adapter import              | Closed failure; no ack or send                                           |
| Accepted immutable envelope                                   | Missing KM/client and sender wiring | One ack, one canonical account/channel send, target-bound `SENT` receipt |
| Stale/mismatched/override/self/bot input                      | Missing validation                  | Zero calls                                                               |
| Ack failure and sender denial/rejection/429/transport/timeout | Missing mapping                     | Zero or one call; `delivery_failed`; never retries                       |
| Cross-account/channel receipt and non-final paths             | Missing authority proof             | Receipt rejected; fake sender remains uncalled                           |

## Dependencies

- The readable, pinned Slice 5A delivery envelope and invocation-ack contract, including exact schemas, endpoint, completion vocabulary, and fixtures.
- A public account-bound one-shot sender meeting the task's no-durability/no-retry contract. `sendDurableMessageBatch` is explicitly excluded.
- Relevant discovered skills: `tdd` for evidence, `validate-implementation` for boundary validation, and `save-learning` as the final action.
