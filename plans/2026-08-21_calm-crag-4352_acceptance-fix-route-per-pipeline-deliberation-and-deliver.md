# Plan 2026-08-21: Complete deliberation contract-gate evidence

Capture the missing fresh GREEN result from the same owner contract command used by the genuine historical RED. Keep the completed implementation unchanged unless that gate exposes a real defect.

## Analysis

- `plans/checkpoints/calm-vale-3982.red-green-proof.md` records the genuine RED: the contract gate exited 1 with 1 failed and 8 passed because intake omitted `pipelineId` and `deliveryTarget`.
- `plans/checkpoints/calm-reef-2510.red-green-proof.md` links that RED but its GREEN runs `extensions/deliberation/src/plugin.test.ts`; this is the sole acceptance gap.
- `extensions/deliberation/src/contract.test.ts:10` remains the owner gate and checks immutable pipeline/target fields, a target discriminator, adopted provenance, synchronized hashes, and lifecycle projections.
- `plans/2026-08-21_calm-reef-2510_route-per-pipeline-deliberation-and-deliver-source-default.md:32` requires GREEN from the identical contract command.
- No additional product docs or architecture changes are needed for this evidence-only follow-up.

### Knowledge base

- `learnings/tooling/bright-wave-5804-same-command-tdd-provenance.md`: a passing different suite cannot establish the RED/GREEN transition; command identity and behavior-specific failure are mandatory.
- `learnings/tooling/2026-08-21_evidence-only-tdd-followups-fail-closed-on-missing-red-provenance.md`: preserve recoverable historical RED and never manufacture a post-implementation failure.
- `learnings/architecture/2026-08-21_durable-target-modes-reject-contradictory-evidence.md`: the gate protects the already-implemented closed target modes and immutable lifecycle evidence.
- Knowledge search used local fallback because QMD collection `openclaw-fork-learnings` was unavailable; the fallback itself is not a blocker.

## Implementation

1. Reconfirm that the historical proof contains the exact command, nonzero exit, and behavior-specific assertion failure. Do not edit tests or production code to recreate RED.
2. Run the exact command below once against the preserved implementation and retain its complete stdout, stderr, timestamp, and exit code. If the local heavy-check lock delays execution, wait or retry the unchanged command with a longer tool timeout.
3. On exit 0, append a clearly named contract-gate GREEN section to `plans/checkpoints/calm-reef-2510.red-green-proof.md`; retain the existing plugin-suite GREEN as supplemental behavioral verification and preserve the link to the historical RED.
4. Create `plans/checkpoints/calm-crag-4352.red-green-proof.md` for the follow-up, linking the same historical RED and recording the fresh contract-gate GREEN without claiming a newly manufactured RED.
5. If the command fails for the contract assertion, stop the evidence-only path and document the real defect. Make only the minimal contract/test correction, then rerun the unchanged command; do not touch unrelated dirty-worktree files.
6. Verify both proof files show the same contract command, historical RED outcome, fresh GREEN outcome, and unabridged relevant output. Run `git diff --check` on the evidence changes.
7. Invoke `save-learning` as the final implementation action and save at least one concise learning about same-command acceptance evidence.

## Files to Modify

| File                                                              | Change                                                                                                               |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `plans/checkpoints/calm-reef-2510.red-green-proof.md`             | Append fresh GREEN from the required contract gate; preserve existing RED provenance and supplemental plugin result. |
| `plans/checkpoints/calm-crag-4352.red-green-proof.md`             | Record task-scoped historical RED provenance and the same fresh GREEN result.                                        |
| `learnings/tooling/<generated-same-command-evidence-learning>.md` | Mandatory `save-learning` output.                                                                                    |

Production and test files are out of scope unless the exact gate proves a real implementation defect.

## TDD

Implementace TDD cyklu dle skill:tdd, using its evidence rules with the task's explicit historical-RED exception. Do not call a new RED phase after implementation.

**Existing test:** `extensions/deliberation/src/contract.test.ts`  
**Exact RED/GREEN command:** `env OPENCLAW_VITEST_FS_MODULE_CACHE_PATH=/Users/michal/.openclaw/tmp/opencode/calm-vale-3982-vitest-cache OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test extensions/deliberation/src/contract.test.ts -- --reporter=verbose`

```ts
import { readFile } from "node:fs/promises";
import { expect, it } from "vitest";

it("requires immutable pipeline and target evidence from the KM owner", async () => {
  const contract = JSON.parse(
    await readFile("extensions/deliberation/contracts/km-wire-v1.json", "utf8"),
  );
  expect(contract.schemas.intakeBody.required).toEqual(
    expect.arrayContaining(["pipelineId", "deliveryTarget"]),
  ); // Historical RED: both fields were absent from the owner mirror.
  expect(contract.schemas.deliveryEnvelope.required).toContain("pipelineId");
});
```

| Gate                              | RED provenance                                                                                    | Required GREEN                                                        |
| --------------------------------- | ------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `accepted Deliberation contracts` | `calm-vale-3982`: identical command exits 1; owner intake lacks `pipelineId` and `deliveryTarget` | Fresh identical command exits 0; all tests in `contract.test.ts` pass |

## Available Skills

- `tdd`: enforce command identity and proof completeness without fabricating RED.
- `task-evidence`: use only if the linked historical command/outcome becomes ambiguous.
- `save-learning`: mandatory final action after evidence verification.

## Dependencies

- Preserve the current dirty worktree and completed commit `90eeb86db1e`; do not revert or redo parent changes.
- The historical source proof at `plans/checkpoints/calm-vale-3982.red-green-proof.md` is the authoritative RED provenance.
- Acceptance closes only when the fresh GREEN uses the exact contract-gate command, not another deliberation suite.

_Status: DRAFT_
