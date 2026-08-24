# Plan 2026-08-21: Repair deliberation pipeline config acceptance

Restore the required intake thread identity contract without disturbing the completed canonical pipeline configuration and legacy normalization work.

## Approach

- Keep `pipelines[]`, exclusive legacy parsing, canonical indexes, manifest changes, consumer migrations, fixtures, and docs unchanged.
- Restore the pre-task invariant: every accepted intake has `sourceThreadId`; Discord uses `providerEventId`, while Slack uses the validated root thread timestamp or its own event timestamp.
- Restore the KM mirror, fixtures, reservation wording, and provenance to the accepted pre-task contract. Do not introduce a new owner revision for this configuration-only slice.
- Reverse only source-thread semantic hunks in files that also contain valid pipeline-config changes.

## Implementation

1. Update `extensions/deliberation/src/route-match.ts` so accepted admissions require `sourceThreadId`, derive it with the pre-task Discord/Slack rule, and keep matching through `pipelineBySourceKey`.
2. Update `extensions/deliberation/src/intake.ts` and `extensions/deliberation/src/km-client.ts` so `sourceThreadId` is required and always serialized to KM; retain `commonExplicitTarget` conversion from canonical pipeline config.
3. Restore required-thread expectations in route, hook, KM client, and producer tests while retaining canonical pipeline fixtures. Remove the newly added Discord-explicit-thread behavior test because it belongs to a later producer-contract slice.
4. Restore `sourceThreadId` to `intakeBody.required`, the required-thread reservation description, and removed fixture fields in `km-wire-v1.json` and `cutover-controls-v1.json`.
5. Restore `provenance.json` and its assertions in `contract.test.ts` to the prior accepted owner hashes and evidence; do not claim the rejected optional-thread owner revision.
6. Use `skill:task-evidence` to preserve the parent task's genuine config RED provenance. Link `plans/checkpoints/warm-vale-8134.red-green-proof.md` from the follow-up proof rather than reconstructing that historical run.
7. Complete the focused regression RED/GREEN cycle below with `skill:tdd`, run scoped verification, then run `skill:validate-implementation` and a fresh `skill:autoreview`; resolve actionable findings.
8. Run `skill:save-learning` last and record the configuration-slice contract-boundary lesson without modifying product behavior.

## Files To Modify

| File                                                         | Change                                                                          |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| `extensions/deliberation/src/route-match.ts`                 | Restore required source-thread derivation; retain pipeline index matching       |
| `extensions/deliberation/src/intake.ts`                      | Always send the required admitted thread identity                               |
| `extensions/deliberation/src/km-client.ts`                   | Make `KmIntakeBody.sourceThreadId` required; retain canonical target projection |
| `extensions/deliberation/src/route-match.test.ts`            | Restore Discord root semantics with canonical pipeline fixtures                 |
| `extensions/deliberation/src/hooks.test.ts`                  | Restore required Discord/Slack intake expectations only                         |
| `extensions/deliberation/src/km-client.test.ts`              | Restore required serialization test while retaining pipeline config             |
| `extensions/deliberation/scripts/intake-producer.test.ts`    | Require `sourceThreadId: "message-override"` again                              |
| `extensions/deliberation/contracts/km-wire-v1.json`          | Restore required intake field and reservation semantics                         |
| `extensions/deliberation/contracts/cutover-controls-v1.json` | Restore removed source-thread fixture values                                    |
| `extensions/deliberation/contracts/provenance.json`          | Restore the prior accepted contract provenance and hashes                       |
| `extensions/deliberation/src/contract.test.ts`               | Assert the restored required contract and prior provenance                      |
| `plans/checkpoints/dark-mist-7145.red-green-proof.md`        | Link historical parent RED and capture this repair's genuine RED/GREEN evidence |

## TDD

Implementace TDD cyklu dle skill:tdd. Do not recreate the original config RED: obtain its exact provenance with `skill:task-evidence` for `warm-vale-8134` and link the existing parent proof. For this acceptance repair, first restore the regression assertion below against the currently wrong implementation and capture its genuine RED before production edits.

**Test file:** `extensions/deliberation/src/route-match.test.ts`

**Focused command for both repair RED and GREEN:**

```bash
pnpm test extensions/deliberation/src/route-match.test.ts extensions/deliberation/src/contract.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/scripts/intake-producer.test.ts -- --reporter=verbose
```

```ts
import { describe, expect, it } from "vitest";
import { parseDeliberationConfig } from "./config.js";
import { admitInboundSource } from "./route-match.js";

it("keeps Discord root intake anchored to the provider event", () => {
  const admission = admitInboundSource(config, event, context);

  expect(admission).toMatchObject({
    accepted: true,
    providerEventId: "message-1",
    sourceThreadId: "message-1",
  });
});
```

| Test                    | RED before repair                                               | GREEN after repair                      |
| ----------------------- | --------------------------------------------------------------- | --------------------------------------- |
| Discord root admission  | `sourceThreadId` is absent                                      | Required value equals `providerEventId` |
| KM intake schema        | `sourceThreadId` is not required                                | Required list contains `sourceThreadId` |
| KM client serialization | Required intake fixture conflicts with optional typing/behavior | Exact camelCase field is serialized     |
| Producer probe          | Payload omits `sourceThreadId`                                  | Payload contains `message-override`     |

Capture with `TASK_ID=dark-mist-7145` to `plans/checkpoints/dark-mist-7145.red-green-proof.md`, use the identical command for GREEN, and verify both phases exist before final verification.

## Verification

1. Run the identical focused TDD command and record the fresh GREEN result.
2. Run `pnpm test extensions/deliberation/src/hooks.test.ts extensions/deliberation/src/orchestration.test.ts` to prove intake/orchestration behavior remains stable.
3. Run `pnpm test extensions/deliberation/src/config.test.ts src/plugins/source-checkout-runtime.test.ts` to prove canonical and legacy config behavior remains intact.
4. Run `pnpm test extensions/deliberation` for the bounded plugin regression suite.
5. Run scoped `oxfmt`, `git diff --check`, and inspect `git diff --numstat`; do not broaden into unrelated worktree changes.
6. Verify the final diff contains no source-thread changes outside restoration and no edits to completed config/docs behavior.

## Available Skills

- `task-evidence`: extract exact parent-run provenance without fabricating history.
- `tdd`: capture the repair's genuine RED and identical-command GREEN.
- `openclaw-testing`: choose the cheapest safe OpenClaw verification commands if a listed command fans out or is blocked.
- `validate-implementation`: check the repair against repository architecture and task boundaries.
- `autoreview`: mandatory fresh pre-handoff review of code changes.
- `save-learning`: mandatory final action after implementation and verification.

## Dependencies

- Treat `plans/checkpoints/warm-vale-8134.red-green-proof.md` as immutable historical evidence; do not rerun tests to simulate its RED timestamp.
- Treat repository `HEAD` as the pre-task intake/KM contract baseline and preserve all unrelated dirty-worktree changes.
- Do not inspect live config, restart Gateway, alter final delivery behavior, or edit the already-correct pipeline documentation.

_Status: DRAFT_
