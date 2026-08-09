# Plan 2026-08-09: Complete Deliberation KM fixture TDD evidence

_Status: DRAFT_
_Created: 2026-08-09_

## Progress

- [x] Phase 0: Config + Init
- [x] Phase 1: Research
- [x] Phase 2: Knowledge
- [x] Phase 3: Synthesis

## Analysis

### Codebase Context

- `extensions/deliberation/src/km-client.test.ts` already contains the parent fixture repair and seven-route assertion; its diff is test-only.
- `extensions/deliberation/src/km-client.ts:253` and `extensions/deliberation/src/km-client.ts:286` confirm the repaired fixtures match exact-key ready-item and reservation parsing.
- `extensions/deliberation/src/final-adapter.ts:61` confirms the active sequence includes `invoke` between reservation and completion.
- `plans/checkpoints/swift-reef-2132.red-green-proof.md:5` contains genuine RED (2 failed, 11 passed) and `:127` contains GREEN (17 passed), while the finalized acceptance run rejected the supplied material as missing GREEN.
- `plans/checkpoints/swift-reef-2132.evidence.md:21` independently recovers the exact parent RED and GREEN helper commands; the only reported gap is truncated unrelated command lines.

### Relevant Documentation

- `extensions/AGENTS.md` keeps any repair inside the Deliberation plugin boundary; no production boundary change is needed.
- `docs/reference/test.md` requires narrow explicit-file proof before broader suites.

### Knowledge Base

- `learnings/tooling/evidence-only-tdd-followups-preserve-historical-red.md`: link genuine parent RED and capture fresh GREEN with the same command; do not manufacture another failure.
- `learnings/test-failures/2026-08-09_closed-schema-fixtures-must-reach-field-boundaries.md`: canonical fixture mutation is already implemented and should not be redone.
- Knowledge search used local fallback because collection `openclaw-fork-learnings` was unavailable; returned generic contract-authority learnings add only the constraint not to broaden protocol behavior.

## Available Skills

- `task-evidence`: retain exact parent command/outcome provenance and disclose gaps.
- `tdd`: apply the explicit historical-RED exception and capture fresh GREEN.
- `openclaw-testing`: run only the focused KM client test unless it exposes a defect.
- `acceptance`: inspect the final run-scoped artifact set before finalization.
- `save-learning`: save the required learning as the implementation session's final action.

## Solution

Repair only the acceptance provenance. Preserve the genuine parent RED, capture fresh GREEN under `dark-crag-9165`, and put both in one follow-up proof artifact. Do not change production or tests unless fresh verification exposes a real defect.

## Implementation

1. Reinspect `extensions/deliberation/src/km-client.test.ts` and its diff; stop if the parent fixture helpers, seven endpoint paths, or isolated malformed-field cases are absent.
2. Create `plans/checkpoints/dark-crag-9165.red-green-proof.md` with the exact historical RED metadata and immutable output link from `plans/checkpoints/swift-reef-2132.red-green-proof.md:3-125`; state that a new RED would fabricate history.
3. Run `pnpm exec vitest run extensions/deliberation/src/km-client.test.ts` unchanged and record timestamp, exit code, full output, and `17 passed` as fresh GREEN in the same follow-up proof.
4. Verify the proof visibly contains both `## RED Phase` and `## GREEN Phase`; a checkpoint assertion alone is insufficient.
5. Create `plans/checkpoints/dark-crag-9165.checkpoint.md` linking this plan, the parent proof, `plans/checkpoints/swift-reef-2132.evidence.md`, and the follow-up proof with exact command/outcome pairs and the `command_lines_truncated` provenance gap.
6. Inspect the final acceptance input with `acceptance`; block completion if the follow-up proof is omitted or GREEN output is only summarized elsewhere.
7. If fresh GREEN fails, document the concrete defect before changing code, then make only the minimal test-first repair and rerun the focused command. Otherwise leave `extensions/deliberation/**` untouched.
8. Invoke `save-learning` last and save at least one learning about run-scoped proof completeness.

## Files to Modify

| File                                                  | Change                                                                        |
| ----------------------------------------------------- | ----------------------------------------------------------------------------- |
| `plans/checkpoints/dark-crag-9165.red-green-proof.md` | Link genuine parent RED and capture fresh current-task GREEN.                 |
| `plans/checkpoints/dark-crag-9165.checkpoint.md`      | Link this plan and the complete evidence set; record exact outcomes and gaps. |

## TDD

Implementace TDD cyklu dle `skill:tdd`, using the task's explicit historical-RED exception. Do not edit the existing regression or revert working code to create another RED.

**Test file:** `extensions/deliberation/src/km-client.test.ts`  
**Run command:** `pnpm exec vitest run extensions/deliberation/src/km-client.test.ts`  
**Edit hint:** no test edit; verify the preserved executable regression below.

```ts
it.each([
  {
    name: "deliveryEnvelope",
    reservation: { ...validReservation(), deliveryEnvelope: null },
    expected: "invalid deliveryEnvelope",
  },
  {
    name: "deliveryEnvelopeDigest",
    reservation: { ...validReservation(), deliveryEnvelopeDigest: "short" },
    expected: "invalid deliveryEnvelopeDigest",
  },
  {
    name: "reviewedTextHash",
    reservation: { ...validReservation(), reviewedTextHash: "short" },
    expected: "invalid reviewedTextHash",
  },
])("rejects malformed reservation $name", async ({ reservation, expected }) => {
  const client = createClient({ protocolVersion: 1, reservation });
  await expect(client.reserve(validReadyItem(), "sender-1")).rejects.toThrow(expected);
});
```

| Evidence                   | RED                                                                                 | GREEN                                     |
| -------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------- |
| Focused KM client contract | Parent proof: 2 failed, 11 passed; stale reservation shape masked field assertions. | Fresh follow-up run: 17 passed, 0 failed. |

## Verification

1. `git diff -- extensions/deliberation/src/km-client.test.ts` shows only the preserved parent test repair.
2. `pnpm exec vitest run extensions/deliberation/src/km-client.test.ts` passes 17 tests.
3. Read `plans/checkpoints/dark-crag-9165.red-green-proof.md` and confirm both phases, exact identical command, nonzero historical RED, and zero-failure fresh GREEN are present.
4. `git diff --check -- plans/checkpoints/dark-crag-9165.red-green-proof.md plans/checkpoints/dark-crag-9165.checkpoint.md` passes.

## Dependencies

- Parent implementation remains preserved in the dirty worktree.
- `plans/checkpoints/swift-reef-2132.red-green-proof.md` remains the immutable historical RED source.
- `plans/checkpoints/swift-reef-2132.evidence.md` provides independently recovered exact RED/GREEN command provenance; unrelated truncated command lines must remain disclosed.
