# Plan 2026-08-21: Complete source-thread TDD evidence

Capture the missing acceptance evidence without changing production behavior.

_Status: DRAFT_
_Created: 2026-08-21_

## Evidence Constraints

- Preserve the currently restored `sourceThreadId` behavior and tests; change no production or product-documentation files.
- Use the exact four-file command specified by `plans/2026-08-21_dark-mist-7145_define-deliberation-pipelines-config-and-legacy.md`.
- Reject `plans/checkpoints/dark-mist-7145.red-green-proof.md` as source-thread RED evidence because it captures only `config.test.ts`.
- Follow `learnings/architecture/2026-08-21_config-only-acceptance-repairs-restore-wire-invariants.md`: link genuine history and never reconstruct RED after implementation.

## Available Skills

- `task-evidence`: recover exact historical commands/outcomes without rerunning history.
- `tdd`: validate identical RED/GREEN command requirements and capture fresh GREEN only after credible RED provenance exists.
- `save-learning`: record the provenance outcome as the final action.

## Implementation

1. Run `skill:task-evidence` for `bright-wave-5804` and its `dark-mist-7145` lineage; inspect generated evidence plus existing task, checkpoint, proof, and acceptance-repair audit artifacts.
2. Accept historical RED only when it includes the exact command below, a nonzero outcome, and a source-thread assertion/schema/serialization failure. Record the originating task/session, timestamp, command, exit code, and unaltered output in `plans/checkpoints/bright-wave-5804.red-green-proof.md`.
3. If step 2 succeeds, run the exact same command on the preserved implementation, append its zero-exit output as GREEN, and verify proof metadata identifies that command rather than `config.test.ts` alone.
4. If step 2 fails, do not run a synthetic RED or change source/tests. Update `plans/checkpoints/bright-wave-5804.checkpoint.md` with `historical_source_thread_red_unavailable`, cite the searched lineage and existing `outcome_unavailable` evidence, and escalate the acceptance requirement.
5. Only if the fresh command exposes a real regression, stop the evidence-only path, document the defect, and replan the smallest test-first repair before changing production code.
6. Run `skill:save-learning` last, recording that evidence-only retries must fail closed when behavior-specific historical RED cannot be recovered.

## Files to Modify

| File                                                    | Change                                                                                         |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `plans/checkpoints/bright-wave-5804.red-green-proof.md` | Add verified same-command historical RED provenance and fresh GREEN only if RED is recoverable |
| `plans/checkpoints/bright-wave-5804.checkpoint.md`      | Record completion or the explicit provenance blocker                                           |
| `learnings/tooling/<generated-save-learning-file>.md`   | Save the evidence provenance lesson as the final action                                        |

## TDD

Implementace TDD cyklu dle skill:tdd, with the historical-evidence exception above: never rerun RED after the fix or edit the already-correct tests to force failure.

**Existing test targets:** `extensions/deliberation/src/route-match.test.ts`, `extensions/deliberation/src/contract.test.ts`, `extensions/deliberation/src/km-client.test.ts`, `extensions/deliberation/scripts/intake-producer.test.ts`

**Identical RED/GREEN command:**

```bash
pnpm test extensions/deliberation/src/route-match.test.ts extensions/deliberation/src/contract.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/scripts/intake-producer.test.ts -- --reporter=verbose
```

Historical failing assertion target, already present in the repaired suite:

```ts
import { expect, it } from "vitest";
import { admitInboundSource } from "./route-match.js";

it("keeps Discord root intake anchored to the provider event", () => {
  expect(admitInboundSource(config, event, context)).toMatchObject({
    accepted: true,
    providerEventId: "message-1",
    sourceThreadId: "message-1", // RED only in the genuine pre-repair state
  });
});
```

| Evidence           | RED requirement                                                 | GREEN requirement                                     |
| ------------------ | --------------------------------------------------------------- | ----------------------------------------------------- |
| Route admission    | Historical output shows missing `sourceThreadId`                | Discord root equals `providerEventId`                 |
| KM contract/client | Historical output shows required-field or serialization failure | Required schema and camelCase payload pass            |
| Intake producer    | Historical output shows omitted `message-override`              | Payload contains `sourceThreadId: "message-override"` |

Do not mark TDD complete unless both phases use the exact command. A provenance blocker is an escalation, not a TDD pass.

## Dependencies

- Current implementation remains untouched unless fresh GREEN unexpectedly fails and proves a real defect.
- Existing `plans/checkpoints/dark-mist-7145.evidence.md` reports only config-command outcomes as unavailable; it does not satisfy the required historical RED.
- Preserve all unrelated dirty-worktree changes.
