# Plan 2026-08-22: Deliberation completion and receipt acceptance repair

Preserve the existing repair, publish its exact source/test hunks as bounded evidence, and rerun the historical RED commands for fresh GREEN proof.

_Status: DRAFT_
_Task: `quick-peak-6750`_

## Analysis

- `extensions/deliberation/src/final-adapter.ts:128` completes `FAILED` only for `FinalDeliveryRejectedError`; arbitrary post-invocation exceptions remain unknown and do not call completion.
- `extensions/deliberation/index.ts:24` requires one unchanged, non-sentinel ID across the result, primary receipt, platform ID list, and sole receipt part.
- `extensions/deliberation/src/km-client.ts:1031` preserves non-2xx responses as `KmRequestError`; reservation alone translates its expected 409 codes at `extensions/deliberation/src/km-client.ts:1153`.
- `extensions/deliberation/src/km-client.ts:1319` rejects duplicate attempt identities and validates the exact reservation ordinal, pre-CAS version, envelope, target, idempotency keys, outcome, and mutually exclusive receipt/failure evidence.
- Focused regressions already exist in `final-adapter.test.ts`, `plugin.test.ts`, `delivery-composition.test.ts`, and `km-client.test.ts`; do not recreate or rewrite them unless fresh GREEN exposes a defect.
- `plans/checkpoints/calm-crag-0993.red-green-proof.md` preserves genuine RED/GREEN cycles, but `plans/checkpoints/calm-crag-0993.evidence.md` is absent.
- The worktree contains unrelated routing, config, wire-contract, SDK, docs, channel, and changelog changes, including unrelated hunks in `index.ts`, `plugin.test.ts`, `km-client.ts`, and `km-client.test.ts`. Do not revert, edit, or attribute them to this task.

## Knowledge Applied

- `learnings/tooling/calm-crag-0993-inspect-acceptance-payload-boundaries.md`: acceptance needs the complete task-owned patch inline, excluding unrelated hunks even within shared files.
- `learnings/tooling/2026-08-21_acceptance-green-must-match-historical-red-command.md`: preserve historical RED and rerun the identical command for GREEN.
- `learnings/tooling/2026-08-21_evidence-only-tdd-followups-fail-closed-on-missing-red-provenance.md`: never manufacture RED by reverting correct code.
- `learnings/architecture/calm-crag-0993-exact-completion-evidence.md`: bind replay to reservation ordinal and `reservation.version - 1`; `FAILED` must retain null receipt/message IDs.
- Recall used deterministic local fallback because `openclaw-fork-learnings` was unavailable; external-contract results reinforce that this repair must not edit `extensions/deliberation/contracts/**`.
- `extensions/AGENTS.md` keeps the repair inside the plugin boundary and forbids core-internal imports.

## Available Skills

- `task-evidence`: recover exact parent commands and session provenance before constructing the patch.
- `tdd`: record inherited RED and fresh GREEN without fabricating a new failure.
- `acceptance`: validate that the final artifact maps every blocking finding to inspectable evidence.
- `save-learning`: save the implementation-session learning as the final action.

## Implementation

1. Run `skill:task-evidence` for `bold-brook-4380` and `calm-crag-0993`; use recorded task-start snapshots and edit operations as provenance. If either source is unavailable, record the gap and stop rather than deriving ownership from the broad worktree diff.
2. Reconstruct only the completion/receipt patch in an isolated temporary tree or temporary Git index based on the recorded parent baseline. Include the task-owned hunks from the seven runtime/test paths below; exclude every routing, pipeline, target-mode, intake, config, SDK, docs, contract, README, and changelog hunk, including mixed-file hunks.
3. Create `plans/checkpoints/calm-crag-0993.evidence.md` containing the complete unabridged reconstructed patch, baseline identity, exact path inventory, `--numstat`, patch SHA-256, explicit forbidden-path check, truncation-marker check, forward apply against the baseline, and reverse apply against the reconstructed result.
4. Compare the reconstructed result with the corresponding completion/receipt regions in the current files. If they differ, add a focused failing regression first and make the minimum owner-local runtime fix; otherwise leave all runtime and test files unchanged.
5. Create `plans/checkpoints/quick-peak-6750.red-green-proof.md`. Link all genuine RED cycles in `calm-crag-0993.red-green-proof.md`, then capture complete fresh GREEN output for both historical commands below.
6. Create `plans/checkpoints/quick-peak-6750.checkpoint.md` mapping each acceptance requirement to patch hunks and tests, listing excluded dirty paths, verification outcomes, evidence digest, and any provenance blocker.
7. Run scoped verification and the repository-required fresh `skill:autoreview`; fix only actionable findings inside the completion/receipt boundary.
8. Run `skill:acceptance` against the repaired task material and confirm the supplied payload includes the bounded evidence artifact rather than the broad worktree diff.
9. Invoke `skill:save-learning` after all code, evidence, proof, checkpoint, and review work; make it the final action.

## Files to Modify

| File                                                       | Change                                                                                                     |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `extensions/deliberation/src/final-adapter.ts`             | Evidence only; edit only if fresh tests expose a missing unknown/rejected transition.                      |
| `extensions/deliberation/index.ts`                         | Evidence only; edit only if exact receipt validation regresses.                                            |
| `extensions/deliberation/src/km-client.ts`                 | Evidence only; edit only if identity, replay/conflict, lifecycle, or projection checks fail.               |
| `extensions/deliberation/src/final-adapter.test.ts`        | Preserve unknown, rejection, and invalid-receipt regressions.                                              |
| `extensions/deliberation/src/plugin.test.ts`               | Preserve thrown, sentinel, padded, missing, mismatched, and multipart receipt regressions.                 |
| `extensions/deliberation/src/delivery-composition.test.ts` | Preserve one-native-attempt ambiguity regressions.                                                         |
| `extensions/deliberation/src/km-client.test.ts`            | Preserve duplicate, replay, conflict, lifecycle, failure-evidence, and projection regressions.             |
| `plans/checkpoints/calm-crag-0993.evidence.md`             | Add the bounded inline implementation/test patch and provenance validations required by the rejected plan. |
| `plans/checkpoints/quick-peak-6750.red-green-proof.md`     | Link genuine historical RED and record fresh identical-command GREEN.                                      |
| `plans/checkpoints/quick-peak-6750.checkpoint.md`          | Record requirement-to-hunk mapping, exclusions, and verification.                                          |

Do not modify `extensions/deliberation/contracts/**`, config/routing/intake files, SDK/channel files, docs, README, or changelog.

## TDD

Implement the evidence cycle with `skill:tdd`. Do not create a new RED: the executable regression below already exists and failed in the genuine parent run.

**Test file:** `extensions/deliberation/src/km-client.test.ts`  
**Historical RED/GREEN command:** `pnpm test extensions/deliberation/src/final-adapter.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/plugin.test.ts extensions/deliberation/src/delivery-composition.test.ts -- --reporter=verbose`  
**Lifecycle RED/GREEN command:** `pnpm test extensions/deliberation/src/km-client.test.ts -- --reporter=verbose`

```ts
import { describe, expect, it, vi } from "vitest";
import { createKmClient } from "./km-client.js";

it("rejects completion evidence with another reservedRecordVersion", async () => {
  const client = createClient({
    protocolVersion: 1,
    record: {
      recordId: "record-1",
      state: "SENT",
      version: 9,
      delivery: { attempts: [{ ...validTerminalAttempt(), reservedRecordVersion: 8 }] },
    },
  });

  // Historical RED: completion accepted lifecycle evidence from a different reservation CAS.
  await expect(
    client.completeDelivery({
      reservation: validReservation(),
      attemptedTarget: validReservation().deliveryEnvelope.deliveryTarget,
      providerAttemptId: "provider-1",
      outcome: "SENT",
      providerReceiptId: "receipt-1",
      providerMessageId: "message-1",
    }),
  ).rejects.toThrow("mismatched completion evidence");
});
```

| Coverage                                         | Historical RED                           | Fresh GREEN                         |
| ------------------------------------------------ | ---------------------------------------- | ----------------------------------- |
| Unknown/rejected and canonical receipt semantics | Four-file command: 7 failed, 110 passed. | Same command passes all four files. |
| Ordinal and pre-CAS version binding              | KM command: 2 failed, 68 passed.         | Same KM command passes.             |
| Contradictory `FAILED` receipt evidence          | KM command: 2 failed, 70 passed.         | Same KM command passes.             |

## Verification

1. Require both TDD commands above to exit 0 and save complete output, counts, and timestamps.
2. Run `pnpm test extensions/deliberation`.
3. Run `pnpm tsgo:extensions`.
4. Run `pnpm build` because preserved changes cross the plugin/runtime boundary.
5. Run focused formatting and lint checks only for the seven task-owned source/test paths; report unrelated wrapper failures separately.
6. Validate the evidence patch with `git apply --check` on its recorded baseline and `git apply --reverse --check` on its reconstructed result.
7. Require the evidence inventory to contain exactly seven source/test paths and zero forbidden paths or truncation markers.
8. Run fresh `skill:autoreview` until no accepted actionable findings remain.

## Completion Criteria

- Acceptance can inspect every completion/receipt runtime and focused-test hunk in `plans/checkpoints/calm-crag-0993.evidence.md`.
- The evidence digest, statistics, path inventory, forward apply, and reverse apply all describe the same embedded patch.
- Historical RED and fresh `quick-peak-6750` GREEN use identical commands.
- The task payload excludes all routing/config/contract/docs/SDK redesign and does not alter preserved correct behavior.
