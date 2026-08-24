# Plan 2026-08-21: Repair deliberation acceptance evidence and documentation

Correct the remaining documentation drift and produce follow-up-scoped proof without changing the completed runtime implementation.

## Approach

- Treat the current admission/intake implementation and tests as complete: authenticated source facts select one pipeline, omitted targets derive from the source thread, explicit targets remain exact, and intake carries `pipelineId` plus `deliveryTarget` without a reservation-time override.
- Replace the obsolete configuration-slice wording in both documentation surfaces with that active behavior while retaining the bounded legacy-config normalization note.
- Update the public producer probe from legacy `routes.sources` input to the script's current top-level `pipelines`, `processingSource`, `event`, and `context` schema.
- Build `plans/checkpoints/cool-reef-5441.red-green-proof.md` from the genuine parent RED provenance and a fresh identical-command GREEN. Do not alter correct code/tests or manufacture another RED.

## Implementation

1. In `docs/plugins/reference/deliberation.md`, state that admission authenticates provider/account/channel/parent/thread evidence, selects exactly one configured pipeline, and sends its stable ID and effective target at intake.
2. Define target behavior in the same page: an omitted target resolves to the authenticated source provider/account/channel and source-thread anchor; an explicit target is copied exactly, with absent `threadId` meaning root delivery and no source-thread inheritance.
3. Remove claims that selection is deferred, all pipelines need one common explicit target, or a common target is injected at reservation. Keep only the actual legacy `sources`/global `deliveryTarget` normalization and its migration removal condition.
4. Rewrite the producer probe JSON and explanation to match `extensions/deliberation/scripts/intake-producer.ts`: use canonical pipelines plus separate authenticated event/context evidence, and explain that unmatched or contradictory evidence makes no KM request.
5. Apply the same active-selection, source-default, exact-explicit-target, and removed-common-projection wording to `extensions/deliberation/README.md`; preserve the pilot's separate activation and provider-allowlist constraints.
6. Create `plans/checkpoints/cool-reef-5441.red-green-proof.md`. Link `plans/checkpoints/swift-peak-3523.red-green-proof.md` as historical RED provenance, record its identical command, exit 1, and behavior-specific missing `pipelineId`/`deliveryTarget` assertion, then append the fresh follow-up GREEN output from that exact command with exit 0. Clearly label parent versus follow-up task IDs.
7. Update `plans/checkpoints/cool-reef-5441.checkpoint.md` with the two repaired findings, exact verification outcomes, proof paths, and any blocked checks.
8. Run `skill:validate-implementation`, then fresh `skill:autoreview` until no accepted actionable finding remains. Run `skill:save-learning` last and save at least one learning about provenance-aware acceptance repair.

## Files to Modify

| File                                                  | Change                                                                            |
| ----------------------------------------------------- | --------------------------------------------------------------------------------- |
| `docs/plugins/reference/deliberation.md`              | Describe current intake-time pipeline/target authority and fix the producer probe |
| `extensions/deliberation/README.md`                   | Replace deferred-slice/common-target guidance with active behavior                |
| `plans/checkpoints/cool-reef-5441.red-green-proof.md` | Link genuine parent RED and capture fresh identical-command GREEN                 |
| `plans/checkpoints/cool-reef-5441.checkpoint.md`      | Record repaired findings and exact verification                                   |
| `learnings/<category>/<generated-name>.md`            | Save the mandatory session learning via `skill:save-learning`                     |

## TDD

Implementace TDD cyklu dle skill:tdd, using the task's historical-provenance exception: reuse the genuine parent RED and capture only a fresh GREEN for this already-implemented follow-up. Do not invoke a new RED run against correct code.

**Existing test file:** `extensions/deliberation/src/route-match.test.ts`  
**Identical command:** `pnpm test extensions/deliberation/src/route-match.test.ts extensions/deliberation/src/hooks.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/contract.test.ts extensions/deliberation/scripts/intake-producer.test.ts -- --reporter=verbose`

```ts
import { describe, expect, it } from "vitest";
import { parseDeliberationConfig } from "./config.js";
import { admitInboundSource } from "./route-match.js";

it("selects the pipeline and anchors an omitted target to the root source message", () => {
  const config = parseDeliberationConfig({
    enabled: true,
    failClosed: true,
    pipelines: [
      {
        id: "discord-source",
        source: { channel: "discord", accountId: "acct", target: "source" },
      },
    ],
    processingSource: { channel: "discord", accountId: "acct", target: "processing" },
    km: {
      endpoint: "https://km.invalid",
      credential: { source: "env", provider: "default", id: "KM_TOKEN" },
      requestTimeoutMs: 1000,
    },
    restrictedSessionKeys: ["agent:reviewer"],
  });

  expect(
    admitInboundSource(
      config,
      {
        provider: "discord",
        eventType: "message",
        eventKind: "user_request",
        accountId: "acct",
        conversationId: "source",
        messageId: "message-1",
        senderId: "sender-1",
      },
      {
        channelId: "discord",
        accountId: "acct",
        conversationId: "source",
        messageId: "message-1",
        senderId: "sender-1",
      },
    ),
  ).toMatchObject({
    accepted: true,
    pipelineId: "discord-source",
    deliveryTarget: {
      provider: "discord",
      account: "acct",
      channel: "source",
      threadId: "message-1",
    },
  });
});
```

| Evidence                             | RED                                                                        | GREEN                                                                              |
| ------------------------------------ | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Selected pipeline and omitted target | Parent run fails because admission lacks `pipelineId` and `deliveryTarget` | Fresh identical command passes with the selected ID and exact source-thread target |

## Verification

1. Run the identical focused command above and require exit 0; preserve its complete output in the follow-up proof.
2. Run `pnpm docs:list`, `pnpm docs:check-mdx`, `pnpm format:docs:check`, and `git diff --check`.
3. Search the two touched docs for `configuration-only`, `producer-contract slice`, `common-target projection`, and `same explicit target`; no operative stale claim may remain.
4. Compare the probe payload field-for-field with `extensions/deliberation/scripts/intake-producer.ts` and its accepted fixtures in `extensions/deliberation/scripts/intake-producer.test.ts`.
5. Verify `plans/checkpoints/cool-reef-5441.red-green-proof.md` contains both the linked behavior-specific historical RED and fresh same-command GREEN before completing the checkpoint.

## Available Skills

- `technical-documentation`: source-backed edits and docs validation.
- `tdd`: proof format and identical-command discipline; do not fabricate RED.
- `task-evidence`: recover parent command/outcome lineage if direct proof provenance is unavailable.
- `openclaw-testing`: narrow test and docs-check selection.
- `validate-implementation`, `autoreview`, `save-learning`: required closeout sequence.

## Dependencies

- Preserve all existing runtime/test changes and unrelated dirty-worktree files.
- Use `plans/checkpoints/swift-peak-3523.red-green-proof.md` only as cited historical evidence; do not rewrite it or `plans/tasks/**`.
- Keep external KM adoption wording distinct from verified OpenClaw producer behavior; do not claim unverified external deployment.

_Status: DRAFT_
