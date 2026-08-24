# Plan 2026-08-21: Carry deliberation pipeline identity and effective target from intake

Select the pipeline and resolve its immutable wire target at authenticated admission, then carry both facts in every accepted producer request.

## Approach

- Make `admitInboundSource` return the indexed `DeliberationPipeline`, `pipelineId`, and one wire-shaped `deliveryTarget`; never accept these values from message content or caller overrides.
- Authenticate provider/account/channel/message/thread facts across event and hook context before lookup. For Discord thread events, match the configured source through the authenticated parent channel and retain the thread channel ID; for Slack, retain the validated root timestamp.
- Derive omitted targets as `{provider, account, channel, threadId: sourceThreadId}`. Convert explicit targets exactly and omit `threadId` when configuration omits it.
- Keep `providerEventId` as the per-message intake/dedupe identity; use `sourceThreadId` only for history and source-default delivery context.
- Remove the temporary all-pipelines `commonExplicitTarget` projection and reservation-time override so later lifecycle reads only the target persisted from intake.
- Preserve `km-wire-v1.json` and KM-owner hashes as the accepted external baseline. Extend the OpenClaw-owned `openclaw-overlay-v1.json` and provenance with the producer intake extension and an explicit pending KM adoption statement; do not claim unverified `km-system` support.

## Implementation

1. In `extensions/deliberation/src/route-match.ts`, normalize and cross-check direct/parent conversation evidence, reject malformed or contradictory thread facts, look up exactly one pipeline from `pipelineBySourceKey`, and return its ID plus the resolved target. Keep duplicate-source rejection in config parsing and unmatched/processing routes fail closed.
2. In `extensions/deliberation/src/intake.ts`, pass only admission-derived `pipelineId` and `deliveryTarget` to `KmClient.intake`; leave content responsible only for the existing payload text and preserve one handler invocation per inbound message.
3. In `extensions/deliberation/src/km-client.ts`, require `pipelineId` and `deliveryTarget` in `KmIntakeBody`, serialize them unchanged, remove the intake target rejection, and delete global configured-target injection from ready/reservation validation. Continue rejecting unrelated caller-controlled fields.
4. In `extensions/deliberation/src/config.ts`, delete `commonExplicitTarget` and its equality helper after all consumers move to selected-pipeline admission; retain bounded legacy normalization into pipelines.
5. Update `extensions/deliberation/scripts/intake-producer.ts` to accept canonical pipelines, provider-neutral Discord/Slack events, parent/thread facts, and no message-supplied route authority. Make duplicate, malformed, no-match, and contradictory input produce no unauthorized request.
6. Add route/intake/producer cases for omitted-target Discord and Slack roots, child threads, explicit root/thread targets, multiple pipelines, duplicate config, malformed evidence, and content that resembles routing data. Assert exact target equality and distinct per-message `providerEventId` values within one thread.
7. Table-drive `before_dispatch` evidence in `hooks.test.ts` for every configured source across accepted intake, rejected intake, disabled processing, empty content, and KM failure; add a plugin-boundary assertion that the suppression hook remains registered and active independently of final-delivery service enablement.
8. Extend `openclaw-overlay-v1.json` with the required producer fields, derivation vectors, exact-equality rule, and content/model non-authority rule. Update `provenance.json` and `contract.test.ts` to hash and identify this OpenClaw-owned proposal handoff while preserving the existing KM owner revision/hashes.
9. Update the loader-backed Discord intake assertion to cover the new producer fields without changing channel dispatch or provider sending.
10. Record in implementation evidence that `km-system` must adopt and persist required `pipelineId` plus `deliveryTarget` through its closed intake/lifecycle schemas before rollout; do not inspect that repository, edit live config, send final messages, or restart Gateway.

## Files to Modify

| File                                                             | Change                                                                          |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `extensions/deliberation/src/route-match.ts`                     | Return selected pipeline and derive authenticated effective target              |
| `extensions/deliberation/src/intake.ts`                          | Carry pipeline ID and target into accepted intake                               |
| `extensions/deliberation/src/km-client.ts`                       | Require/serialize producer authority; remove global late override               |
| `extensions/deliberation/src/config.ts`                          | Remove temporary common-target projection                                       |
| `extensions/deliberation/scripts/intake-producer.ts`             | Consume canonical pipelines and provider-neutral thread facts                   |
| `extensions/deliberation/src/route-match.test.ts`                | Prove exact selection, root/thread derivation, and fail-closed evidence         |
| `extensions/deliberation/src/hooks.test.ts`                      | Prove immutable intake payload and suppression across all outcomes              |
| `extensions/deliberation/src/config.test.ts`                     | Remove common-target expectations; retain canonical/legacy parity               |
| `extensions/deliberation/src/km-client.test.ts`                  | Prove exact producer serialization and no reservation-time override             |
| `extensions/deliberation/scripts/intake-producer.test.ts`        | Prove canonical multi-pipeline producer behavior and non-authority of content   |
| `extensions/deliberation/src/plugin.test.ts`                     | Prove suppression registration remains independent of processing state          |
| `extensions/discord/src/monitor/message-handler.process.test.ts` | Synchronize loader-backed intake request evidence                               |
| `extensions/deliberation/contracts/openclaw-overlay-v1.json`     | Version the OpenClaw producer extension and derivation fixtures                 |
| `extensions/deliberation/contracts/provenance.json`              | Hash the overlay and distinguish pending KM adoption from accepted owner mirror |
| `extensions/deliberation/src/contract.test.ts`                   | Assert producer fields, vectors, provenance, and unchanged KM owner baseline    |
| `plans/checkpoints/swift-peak-3523.red-green-proof.md`           | Capture identical-command RED/GREEN evidence during implementation              |

## TDD

Implement the cycle with `skill:tdd`: add the route assertion first, capture RED, implement, then rerun the identical command for GREEN.

**Test file:** `extensions/deliberation/src/route-match.test.ts`  
**Run command:** `pnpm test extensions/deliberation/src/route-match.test.ts extensions/deliberation/src/hooks.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/contract.test.ts extensions/deliberation/scripts/intake-producer.test.ts -- --reporter=verbose`

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
        channel: "discord",
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

| Test                             | RED                                                    | GREEN                                                        |
| -------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------ |
| Selected omitted-target pipeline | Admission lacks `pipelineId` and `deliveryTarget`      | Exact ID and source-thread target are returned               |
| Explicit target                  | Existing path relies on global projection              | Exact configured target is sent with no inherited thread     |
| Closed producer contract         | Intake rejects/omits producer target                   | Required ID and target serialize unchanged                   |
| Suppression matrix               | Coverage does not span every producer outcome/pipeline | Every configured source remains handled by `before_dispatch` |

## Verification

1. Run the identical focused TDD command and record RED/GREEN results.
2. Run `pnpm test extensions/deliberation/src/plugin.test.ts extensions/deliberation/src/source-identity.test.ts extensions/discord/src/monitor/message-handler.process.test.ts -- --reporter=verbose`.
3. Run `pnpm test extensions/deliberation` as the bounded deliberation regression suite.
4. Run scoped `oxfmt`, `git diff --check`, and `git diff --numstat`; trim production growth or justify the removed late-target path.
5. Run `skill:validate-implementation`, then fresh `skill:autoreview` until no accepted actionable finding remains.
6. Run `skill:save-learning` as the final action.

## Available Skills

- `tdd`: capture genuine identical-command RED/GREEN proof.
- `openclaw-testing`: adjust only if a listed command fans out or the checkout is unhealthy.
- `validate-implementation`: verify architecture, contract ownership, and scope boundaries.
- `autoreview`: perform mandatory fresh code review before handoff.
- `save-learning`: record the producer/KM ownership lesson last.

## Dependencies

- Treat `docs/proposals/proposal-20260820-203458-161e2c_per-source-deliberation-pipelines-with-source-default-delivery.md` and normalized `DeliberationPipeline` config as OpenClaw authority.
- Treat `km-wire-v1.json` plus its pinned owner hashes as the unchanged accepted KM baseline; the OpenClaw producer overlay is a handoff, not evidence that KM already accepts it.
- Preserve unrelated worktree changes and do not modify `plans/tasks/`, `km-system`, live configuration, Gateway state, or final provider adapters.

_Status: DRAFT_
