# Plan 2026-08-21: Complete per-pipeline deliberation delivery

## Approach

- Preserve the completed `pipelines` config normalization, authenticated admission, producer payload, and documentation already present in the dirty worktree.
- Make the synchronized repository-local KM owner handoff the first gate: it must require `pipelineId`, preserve it and the effective target across every lifecycle projection, and carry a closed source-anchor versus exact-target discriminator. Do not infer or rename owner fields.
- Keep admission as the only routing authority and the reserved envelope as the only delivery authority; no current-config lookup, provider fallback, retry send, or target recomputation is allowed after intake.
- Add only the generic outbound SDK capability needed for Discord source-message anchors; keep provider-specific thread creation inside Discord and explicit root/thread sends on existing `sendText` paths.

## Implementation

1. Replace `extensions/deliberation/contracts/km-wire-v1.json`, its owner fixtures, hashes, overlay status, and provenance from the approved versioned handoff. Make `extensions/deliberation/src/contract.test.ts` prove required intake/lifecycle `pipelineId`, exact target propagation, the accepted anchor discriminator, and non-pending owner provenance before changing runtime code.
2. Update `extensions/deliberation/src/km-client.ts` and fixtures to parse the accepted target union and `pipelineId` as exact closed-schema fields in intake, ready, reservation, invocation, completion, record attempts, and equality fences. Reject missing, stale, malformed, or drifted pipeline/target evidence before provider send.
3. Map the wire target once in `extensions/deliberation/src/delivery-target.ts` to a closed internal mode: source-message anchor, exact root, or exact thread. Keep explicit targets exact and do not derive mode from mutable config, source equality, or pipeline ID.
4. Extend `ChannelOutboundAdapter` through the public SDK with one narrow text-to-thread-anchor operation. Implement it in `extensions/discord/src/outbound-adapter.ts` using Discord-owned thread creation/reuse from `{ channelId, anchorMessageId }`, followed by exactly one text send and its real receipt; retain ordinary `sendText` for exact roots and existing threads.
5. Update `extensions/deliberation/index.ts` so Discord anchors use the new operation, Discord exact root/thread targets use `sendText`, and Slack root/thread targets both use `sendText` with `threadId` omitted or present exactly as authorized. Preserve one-message limits, account checks, and unresolved post-send receipt handling.
6. Add `parentConversationId` to `PluginHookBeforeDispatchContext`, forward `inboundClaimContext.parentConversationId` in `dispatch-from-config.ts`, and cover the mapper/dispatch path. Keep `createBeforeDispatchHandler` independent of `config.enabled` so Discord child messages stay silent on accepted, rejected, disabled, and KM-failure intake paths.
7. Tighten `createFinalDeliveryAdapter` tests around `ready -> reserve -> invoke -> one selected provider send -> complete`: assert immutable pipeline/target/attempt identity, zero calls to unselected providers, no send on conflicts or malformed evidence, one definitive `FAILED` completion for pre/known provider failures, and no completion for unknown post-send outcomes.
8. Update `docs/plugins/reference/deliberation.md`, `extensions/deliberation/README.md`, and `docs/plugins/sdk-channel-outbound.md` with the accepted discriminator, Discord source-anchor behavior, explicit root/thread behavior, Slack root support, source suppression, and no-fallback single-attempt contract. Exclude live config migration, Gateway restart, and rollout.
9. Record fresh verification in `plans/checkpoints/calm-reef-2510.checkpoint.md`; create `plans/checkpoints/calm-reef-2510.red-green-proof.md` linking the genuine parent RED and appending fresh GREEN. Run `skill:validate-implementation`, mandatory `$autoreview` until clean, then `skill:save-learning` as the final action and save at least one learning.

## Files to Modify

| Surface                | Files                                                                                                                                                                                                                                        |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Owner contract         | `extensions/deliberation/contracts/{km-wire-v1,cutover-controls-v1,openclaw-overlay-v1,provenance}.json`, `extensions/deliberation/src/contract.test.ts`                                                                                     |
| Durable lifecycle      | `extensions/deliberation/src/{km-client,delivery-target,final-adapter}.ts` and colocated tests                                                                                                                                               |
| Suppression context    | `src/plugins/hook-types.ts`, `src/auto-reply/reply/dispatch-from-config.ts`, `src/hooks/message-hook-mappers.test.ts`, `src/auto-reply/reply/dispatch-from-config.test.ts`, `extensions/discord/src/monitor/message-handler.process.test.ts` |
| Provider delivery      | `src/channels/plugins/outbound.types.ts`, `extensions/discord/src/{outbound-adapter,outbound-adapter.test,send.creates-thread.test}.ts`, `extensions/deliberation/{index.ts,src/plugin.test.ts}`                                             |
| Documentation/evidence | `docs/plugins/reference/deliberation.md`, `docs/plugins/sdk-channel-outbound.md`, `extensions/deliberation/README.md`, `plans/checkpoints/calm-reef-2510.{checkpoint,red-green-proof}.md`                                                    |

## TDD

Implement the cycle with `skill:tdd`. Reuse the genuine RED at `plans/checkpoints/calm-vale-3982.red-green-proof.md`; do not recreate RED against partially implemented code. Capture fresh GREEN under `calm-reef-2510` with the identical command.

**Existing test:** `extensions/deliberation/src/contract.test.ts`  
**Identical command:** `env OPENCLAW_VITEST_FS_MODULE_CACHE_PATH=/Users/michal/.openclaw/tmp/opencode/calm-vale-3982-vitest-cache OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test extensions/deliberation/src/contract.test.ts -- --reporter=verbose`

```ts
import { readFile } from "node:fs/promises";
import { expect, it } from "vitest";

it("requires immutable pipeline and target evidence from the KM owner", async () => {
  const contract = JSON.parse(
    await readFile("extensions/deliberation/contracts/km-wire-v1.json", "utf8"),
  );
  expect(contract.schemas.intakeBody.required).toEqual(
    expect.arrayContaining(["pipelineId", "deliveryTarget"]),
  ); // Historical RED: both fields are absent from the pinned owner mirror.
  expect(contract.schemas.deliveryEnvelope.required).toContain("pipelineId");
  expect(Object.keys(contract.schemas.deliveryTarget.properties).length).toBeGreaterThan(4);
});
```

| Evidence            | RED                                                                                                              | GREEN                                                                                           |
| ------------------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Owner contract gate | Parent run exits 1 because intake lacks `pipelineId`/`deliveryTarget` and target semantics are ambiguous         | Identical command exits 0 against synchronized owner contract, fixtures, hashes, and provenance |
| Runtime matrix      | Existing tests lack accepted discriminator handling, Slack root send, Discord anchor send, and child suppression | Focused suites prove each positive path and zero-send negative paths                            |

## Verification

1. Run the identical contract command and append complete GREEN output to `plans/checkpoints/calm-reef-2510.red-green-proof.md`.
2. Run `pnpm test src/hooks/message-hook-mappers.test.ts src/auto-reply/reply/dispatch-from-config.test.ts extensions/discord/src/monitor/message-handler.process.test.ts -- --reporter=verbose`.
3. Run `pnpm test extensions/discord/src/send.creates-thread.test.ts extensions/discord/src/outbound-adapter.test.ts -- --reporter=verbose`.
4. Run `pnpm test extensions/deliberation/src/route-match.test.ts extensions/deliberation/src/hooks.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/final-adapter.test.ts extensions/deliberation/src/plugin.test.ts extensions/deliberation/src/orchestration.test.ts extensions/deliberation/scripts/intake-producer.test.ts -- --reporter=verbose`.
5. Run `pnpm test extensions/deliberation -- --reporter=verbose`, `pnpm build`, `pnpm docs:check-mdx`, `pnpm format:docs:check`, and `git diff --check`; move broad/fan-out proof to `skill:openclaw-testing`/Testbox if local wrappers expand.

## Available Skills

- `tdd`: preserve historical RED provenance and capture fresh GREEN.
- `task-evidence`: recover parent command/outcome lineage if the proof link is insufficient.
- `validate-implementation`: check the completed contract, SDK, runtime, and docs surfaces.
- `save-learning`: mandatory final action after implementation and verification.

## Dependencies

- An approved synchronized KM owner contract/fixture/provenance handoff is mandatory; the current mirror still explicitly marks adoption pending.
- Existing config, admission, producer, docs, and unrelated worktree changes must not be reverted or redone.
- The accepted owner discriminator must distinguish a Discord source root message anchor from an exact explicit thread without runtime guessing.

_Status: DRAFT_
