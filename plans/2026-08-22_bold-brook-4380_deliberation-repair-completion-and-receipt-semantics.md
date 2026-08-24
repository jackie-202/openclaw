# Plan 2026-08-22: Deliberation completion and receipt semantics

_Status: DRAFT_
_Created: 2026-08-22_

## Progress

- [x] Phase 0: Config + init
- [x] Phase 1: Research
- [x] Phase 2: Knowledge
- [x] Phase 3: Synthesis

## Analysis

### Codebase context

- The prerequisite single-attempt channel capability is present: `extensions/deliberation/index.ts` consumes the closed `sent | rejected | unknown` result and `extensions/deliberation/src/delivery-composition.test.ts` counts native Discord/Slack attempts.
- `extensions/deliberation/src/final-adapter.ts` still converts any thrown non-`FinalDeliveryOutcomeUnknownError` after durable invocation into `FAILED`; only explicit `FinalDeliveryRejectedError` is proof that native acceptance was impossible.
- `extensions/deliberation/index.ts` checks one receipt part and matching IDs, but receipt validation needs focused sentinel, missing-field, noncanonical, mismatch, and multipart coverage.
- `extensions/deliberation/src/km-client.ts` selects the first matching attempt with `.find()`, so duplicate durable attempt/provider-attempt identities are ambiguous. Its generic 409 mapping also turns completion `CAS_CONFLICT` into a response-schema error instead of preserving the HTTP conflict.
- The runtime `recordSchema` omits schema-permitted `readyAt`, `processing`, `processingSessionKey`, `sourceContext`, and extended review/freshness projection fields from `extensions/deliberation/contracts/km-wire-v1.json`.

### Relevant documentation

- `plans/investigations/quick-wave-9858_audit-openclaw-deliberation-pipeline-routing-and-delivery-safety.md`: remediation item 5 and the original unsafe paths.
- `plans/2026-08-21_bold-brook-3323_deliberation-enforce-one-native-provider-attempt-and-one.md`: prerequisite contract and composition boundary.
- `docs/plugins/sdk-channel-outbound.md`: `sent` requires one agreeing message/receipt; timeout, connection loss, and malformed success evidence are `unknown`.
- `docs/plugins/reference/deliberation.md`: only definitive rejection may complete `FAILED`; unknown and malformed/multipart evidence remain unresolved.
- No PlantUML diagrams cover this plugin or wire lifecycle.

### Knowledge base

- `learnings/architecture/quick-wave-9858-audit-abstraction-and-fixture-boundaries.md`: prove feature calls, adapter calls, and native attempts separately; hashes do not prove fixture semantics.
- `learnings/patterns/warm-vale-8134-keep-runtime-validation-aligned-with-json-schema.md`: strict runtime and JSON Schema acceptance must match without silent normalization.
- `recall-knowledge` used local fallback because collection `openclaw-fork-learnings` was unavailable; its relevant rule is to treat the mirrored KM schema as external authority rather than inventing a narrower wire during acceptance repair.

## Available Skills

- `recall-knowledge`: load repository learnings before choosing the repair boundary.
- `tdd`: execute the planned RED/GREEN behavior tests and record proof during implementation.
- `openclaw-testing`: choose focused Deliberation tests and the narrow changed-surface gate.
- `autoreview`: perform the mandatory fresh pre-closeout review after implementation.
- `save-learning`: record planning discoveries as the final action of this planning task.

## Approach

Keep the prerequisite `sendTextAttempt` contract unchanged. Tighten the Deliberation-owned boundaries so only an explicit preflight/platform rejection can produce `FAILED`, `SENT` requires one unmodified canonical ID across the message and receipt, and KM completion succeeds only for one unique attempt carrying the exact submitted evidence.

Retain the existing KM JSON Schema as authority and extend the strict Zod projection parser to the schema's complete field set. Do not weaken strictness with `z.unknown()` or remove owner-defined projection fields.

## Implementation

1. In `extensions/deliberation/src/final-adapter.test.ts`, first replace the generic-error terminalization case with transport/timeout tests that expect `FinalDeliveryOutcomeUnknownError` and zero completion calls; retain explicit `FinalDeliveryRejectedError` coverage for definitive `FAILED`.
2. In `extensions/deliberation/src/final-adapter.ts`, remove heuristic classification of arbitrary thrown errors after `km.invoke()`. Complete `FAILED` only for `FinalDeliveryRejectedError`; rethrow an existing unknown error or wrap every other post-invocation exception as `FinalDeliveryOutcomeUnknownError` without retry or completion.
3. In `extensions/deliberation/index.ts`, validate the raw `sent` result without trimming or normalizing: require one non-sentinel message ID, the same primary ID, exactly one identical platform ID, and exactly one part with that ID. Classify missing, padded/noncanonical, `unknown`/`suppressed`, mismatched, or multipart evidence as unknown.
4. Add plugin/composition tests for Discord `messageId: "unknown"`, missing primary/part evidence, differing receipt/message IDs, and malformed native success responses; assert one native attempt and no `SENT`/`FAILED` completion for each unknown case.
5. In `extensions/deliberation/src/km-client.ts`, make non-2xx responses remain `KmRequestError` values and move reserve-only handling of `CAS_CONFLICT`/`CONTROL_DISABLED` into `reserve()`. Completion replay remains a validated 200 response; completion conflict remains HTTP 409 `CAS_CONFLICT`.
6. Before selecting completion evidence, reject duplicate `attemptId` values and duplicate non-null `providerAttemptId` values, then require exactly one attempt matching the reservation. Compare its outcome, target, envelope, idempotency keys, provider attempt, and receipt/message or failure evidence exactly as submitted.
7. Extend the closed Zod record projection schemas for every field allowed by `km-wire-v1.json`, including `readyAt`, `processing`, `processingSessionKey`, `sourceContext`, and complete review/freshness data. Add one maximal schema-permitted projection test plus rejection of unsupported or malformed projection fields.
8. Run focused tests, extension type checks, and `skill:autoreview`; do not regenerate contracts/provenance because this repair does not change the accepted wire schema.

## Files to Modify

| File                                                       | Change                                                                                                        |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `extensions/deliberation/src/final-adapter.ts`             | Restrict definitive failure completion and preserve ambiguous post-invocation outcomes.                       |
| `extensions/deliberation/src/final-adapter.test.ts`        | Cover timeout/transport unknown and explicit rejection.                                                       |
| `extensions/deliberation/index.ts`                         | Enforce one exact canonical message/receipt pair.                                                             |
| `extensions/deliberation/src/plugin.test.ts`               | Cover unknown, missing, mismatched, and multipart provider evidence.                                          |
| `extensions/deliberation/src/delivery-composition.test.ts` | Prove malformed/accepted-then-error native outcomes remain unresolved after one attempt.                      |
| `extensions/deliberation/src/km-client.ts`                 | Preserve completion conflict semantics, enforce unique attempt identity, and align record projection parsing. |
| `extensions/deliberation/src/km-client.test.ts`            | Cover exact replay, 409 conflict, duplicate IDs, receipt/message conflicts, and maximal projections.          |

## TDD

Implement the cycle with `skill:tdd`; record RED/GREEN evidence in `plans/checkpoints/bold-brook-4380.red-green-proof.md`.

**Test file:** `extensions/deliberation/src/final-adapter.test.ts`  
**Run command:** `pnpm test extensions/deliberation/src/final-adapter.test.ts -- --reporter=verbose`  
**Edit hint:** Replace the current generic provider-failure test inside `describe("public final delivery adapter")`; reuse the file's `reservation` and `deliveryTarget` fixtures.

```ts
import { describe, expect, it, vi } from "vitest";
import { createFinalDeliveryAdapter, FinalDeliveryOutcomeUnknownError } from "./final-adapter.js";

it("leaves a post-invocation transport error unresolved", async () => {
  const provider = {
    send: vi
      .fn()
      .mockRejectedValue(Object.assign(new Error("connection reset"), { code: "ECONNRESET" })),
  };
  const km = {
    ready: vi.fn().mockResolvedValue({
      items: [{ recordId: "record-1", text: "reply", effectiveDeliveryTarget: deliveryTarget }],
    }),
    reserve: vi.fn().mockResolvedValue({ outcome: "reserved", reservation }),
    invoke: vi.fn().mockResolvedValue({}),
    completeDelivery: vi.fn(),
  };

  // RED: the current adapter records this ambiguous transport outcome as FAILED.
  await expect(
    createFinalDeliveryAdapter({
      km,
      providers: { discord: provider },
      owner: "owner",
    } as never).runOnce(),
  ).rejects.toThrow(FinalDeliveryOutcomeUnknownError);
  expect(km.completeDelivery).not.toHaveBeenCalled();
});
```

| Test                                      | RED                                                              | GREEN                                                      |
| ----------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------- |
| Post-invocation transport/timeout         | Current adapter submits `FAILED`.                                | Throws unknown; no completion or retry.                    |
| Discord unknown/malformed receipt         | Current gaps can accept or incompletely cover sentinel evidence. | No terminal completion; one native attempt.                |
| Duplicate KM attempt/provider-attempt IDs | `.find()` selects the first matching attempt.                    | Response rejected as ambiguous.                            |
| Exact replay                              | No focused client proof.                                         | Identical 200 replay passes all exact comparisons.         |
| Completion conflict                       | 409 is collapsed into response-schema handling.                  | HTTP 409 `CAS_CONFLICT` is preserved.                      |
| Receipt/message conflict                  | Focused replay conflict proof is missing.                        | Any changed receipt or message ID is rejected.             |
| Maximal record projection                 | Schema-permitted fields fail strict runtime parsing.             | Full valid projection passes; malformed/extra fields fail. |

## Verification

1. `pnpm test extensions/deliberation/src/final-adapter.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/plugin.test.ts extensions/deliberation/src/delivery-composition.test.ts -- --reporter=verbose`
2. `pnpm test extensions/deliberation`
3. `pnpm tsgo:extensions`
4. `pnpm tsgo:extensions:test`
5. `pnpm check:changed`
6. Run fresh `skill:autoreview` until no accepted actionable findings remain.

## Dependencies

- Start only after task `bold-brook-3323` single-attempt delivery changes and tests are present; this checkout currently contains them.
- The mirrored `extensions/deliberation/contracts/km-wire-v1.json` remains the projection authority; external KM deployment convergence stays outside this repository-local repair.
