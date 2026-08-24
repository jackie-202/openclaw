# Plan 2026-08-22: Repair Deliberation completion and receipt acceptance evidence

Preserve the implemented runtime repair, expose its exact source/test hunks to acceptance, and replace the incomplete retry evidence with parent RED provenance plus fresh follow-up GREEN proof.

_Status: DRAFT_
_Task: `calm-crag-0993`_

## Analysis

- `extensions/deliberation/src/final-adapter.ts` already leaves arbitrary post-invocation exceptions unresolved and completes `FAILED` only for `FinalDeliveryRejectedError`.
- `extensions/deliberation/index.ts` already requires one exact non-sentinel message ID across the result, primary receipt, platform ID list, and receipt part.
- `extensions/deliberation/src/km-client.ts` already rejects duplicate attempt identities, validates exact completion replay evidence, preserves completion 409 errors, and parses the schema-permitted projection fields.
- Focused regressions already exist in `final-adapter.test.ts`, `plugin.test.ts`, and `km-client.test.ts`; do not rewrite them unless fresh verification exposes a defect.
- `plans/checkpoints/bold-brook-4380.red-green-proof.md` contains a genuine failing run at lines 5-573 and a passing run at lines 575-715 using the same four-file command. The rejected acceptance payload omitted part of that proof and the owning implementation diff.
- The worktree also contains pipeline routing, config, docs, SDK, and wire-contract work from other tasks. Do not revert, edit, stage, or attribute those changes to this repair.

## Knowledge Applied

- `learnings/architecture/bold-brook-4380-completion-state-requires-positive-evidence.md`: terminal states require positive, unique evidence after durable invocation.
- `learnings/architecture/bold-brook-4380-operation-specific-http-conflicts.md`: keep non-2xx handling generic and translate reservation-only conflicts at `reserve()`.
- `learnings/tooling/2026-07-24_acceptance-retries-need-inspectable-parent-diffs.md`: a retry must expose preserved implementation hunks, not only test totals or checkpoint claims.
- `learnings/tooling/dark-fork-2582-task-scoped-acceptance-provenance.md`: link genuine parent RED, run the identical command for fresh GREEN, and record a narrow follow-up diff.
- `recall-knowledge` used local fallback because collection `openclaw-fork-learnings` was unavailable; external-contract results reinforce that this repair must not change `km-wire-v1.json`.

## Available Skills

- `tdd`: capture the follow-up GREEN while retaining immutable parent RED provenance.
- `task-evidence`: recover exact parent command/outcome metadata if the existing proof is insufficient.
- `openclaw-testing`: run the focused Deliberation proof before broader plugin checks.
- `autoreview`: perform the mandatory fresh pre-closeout review.
- `save-learning`: record the implementation-session learning as the final action.

## Implementation

1. Inventory the preserved hunks in `final-adapter.ts`, `index.ts`, and `km-client.ts` and their three focused test files. Map each acceptance behavior to exact visible source and assertion ranges.
2. Compare those hunks with the original plan. If any required behavior is absent, add only its focused failing test and minimal owner-local implementation; otherwise make no runtime or test change.
3. Create `plans/checkpoints/calm-crag-0993.evidence.md` with a complete inline task-owned diff for only the completion/receipt hunks. Exclude pipeline routing, config normalization, delivery target modes, docs, contracts, SDK work, and prerequisite single-attempt adapter changes, including unrelated hunks in otherwise shared files.
4. Record the diff path inventory, line statistics, SHA-256, absence of truncation markers, and reverse-apply validation against its recorded baseline. If a clean provenance baseline cannot isolate the hunks, stop and record the ownership gap rather than claiming unrelated work.
5. Create `plans/checkpoints/calm-crag-0993.red-green-proof.md`: link the parent proof's exact RED command, exit code 1, and seven behavior-specific failures; then run the identical command and append complete fresh GREEN output, exit code, and counts under this task ID.
6. Update `plans/checkpoints/calm-crag-0993.checkpoint.md` with the requirement-to-hunk map, exact command outcomes, unrelated-path exclusions, and any blocked broad checks.
7. Run scoped verification and fresh `skill:autoreview`; repair only actionable findings within the completion/receipt boundary.
8. Invoke `skill:save-learning` after all code, evidence, checkpoint, and verification work; it must be the final action.

## Files to Modify

| File                                                  | Change                                                                                                  |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `extensions/deliberation/src/final-adapter.ts`        | Preserve as-is; edit only if verification finds a missing unknown/rejected transition.                  |
| `extensions/deliberation/index.ts`                    | Preserve as-is; edit only if exact single-message evidence validation is incomplete.                    |
| `extensions/deliberation/src/km-client.ts`            | Preserve as-is; edit only if identity, replay/conflict, or projection verification fails.               |
| `extensions/deliberation/src/final-adapter.test.ts`   | Preserve and expose post-invocation unknown/explicit rejection regressions.                             |
| `extensions/deliberation/src/plugin.test.ts`          | Preserve and expose malformed, sentinel, mismatched, and multipart receipt regressions.                 |
| `extensions/deliberation/src/km-client.test.ts`       | Preserve and expose replay, conflict, duplicate identity, receipt conflict, and projection regressions. |
| `plans/checkpoints/calm-crag-0993.evidence.md`        | Add bounded inline implementation/test diff and provenance checks.                                      |
| `plans/checkpoints/calm-crag-0993.red-green-proof.md` | Link genuine parent RED and capture fresh identical-command GREEN.                                      |
| `plans/checkpoints/calm-crag-0993.checkpoint.md`      | Add acceptance mapping, verification outcomes, and explicit scope exclusions.                           |

Do not modify `extensions/deliberation/contracts/**`, config/routing/intake files, SDK/channel files, docs, README, or changelog for this repair.

## TDD

Implement the evidence cycle with `skill:tdd`, but do not fabricate a new RED. The executable regression below already exists and failed in the genuine parent RED.

**Test file:** `extensions/deliberation/src/final-adapter.test.ts`  
**Run command:** `pnpm test extensions/deliberation/src/final-adapter.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/plugin.test.ts extensions/deliberation/src/delivery-composition.test.ts -- --reporter=verbose`

```ts
import { describe, expect, it, vi } from "vitest";
import { createFinalDeliveryAdapter, FinalDeliveryOutcomeUnknownError } from "./final-adapter.js";

it("leaves a post-invocation transport outcome unresolved", async () => {
  const provider = { send: vi.fn().mockRejectedValue(new Error("connection reset")) };
  const km = {
    ready: vi.fn().mockResolvedValue({
      items: [{ recordId: "record-1", text: "reply", effectiveDeliveryTarget: deliveryTarget }],
    }),
    reserve: vi.fn().mockResolvedValue({ outcome: "reserved", reservation }),
    invoke: vi.fn().mockResolvedValue({}),
    completeDelivery: vi.fn(),
  };

  // Historical RED: the adapter resolved and submitted FAILED instead of rejecting as unknown.
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

| Behavior                            | Historical RED                        | Follow-up GREEN                                   |
| ----------------------------------- | ------------------------------------- | ------------------------------------------------- |
| Post-invocation transport/timeout   | Resolved and completed `FAILED`.      | Throws unknown; no completion or retry.           |
| Malformed/sentinel receipt          | Missing focused terminal-state proof. | One attempt; no `SENT` or `FAILED`.               |
| Duplicate attempt/provider identity | Ambiguous response resolved.          | Rejects duplicate identity.                       |
| Completion conflict                 | 409 became a response-schema error.   | Preserves HTTP 409 `CAS_CONFLICT`.                |
| Exact replay and receipt match      | Replay/conflict proof incomplete.     | Exact replay passes; changed evidence rejects.    |
| Maximal record projection           | Valid schema fields rejected.         | Full schema-permitted projection parses strictly. |

## Verification

1. Parent RED provenance: `plans/checkpoints/bold-brook-4380.red-green-proof.md` records the exact command above with exit code 1 and seven failures tied to this repair.
2. Fresh GREEN: rerun that exact command and require all four files and all tests to pass; save complete output under `calm-crag-0993`.
3. `pnpm test extensions/deliberation`
4. `pnpm tsgo:extensions`
5. `pnpm build` because the preserved implementation touches plugin/runtime boundaries.
6. Run focused format/lint checks for the six task-owned source/test paths; report unrelated wrapper failures separately.
7. Run fresh `skill:autoreview` until no accepted actionable findings remain.

## Completion Criteria

- Acceptance can inspect every required runtime and focused-test hunk directly in the follow-up evidence.
- Parent RED and fresh task-scoped GREEN use the identical command and record exact outcomes.
- The task-scoped diff contains no pipeline/config/contract/docs/SDK redesign and names any inseparable ownership blocker explicitly.
- No correct preserved work is reverted or reimplemented.
