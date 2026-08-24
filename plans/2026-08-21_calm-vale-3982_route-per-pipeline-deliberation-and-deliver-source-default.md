# Plan 2026-08-21: Route per-pipeline deliberation and deliver source-default replies

## Approach

- Gate implementation on the synchronized repository-local KM contract. It must require `pipelineId` and the effective target at intake, preserve both through ready/reservation/invocation/completion evidence, and distinguish a source root message anchor from an exact explicit thread. The current `km-wire-v1.json` and provenance still mark this adoption pending; if the replacement remains absent or ambiguous, record the mismatch and stop contract-dependent work without inspecting `km-system`.
- Keep authenticated admission as the sole routing authority: one normalized source tuple selects one pipeline; message/model output never contributes routing fields; every provider event remains a separate intake while `sourceThreadId` supplies history only.
- Preserve fail-closed source silence independently of intake success by carrying canonical parent conversation identity into `before_dispatch`, including Discord child messages and disabled/failing KM paths.
- Extend the generic outbound adapter contract only as narrowly as the accepted wire requires so Discord can create/reuse a source-root thread anchor before one text send. Existing-thread and explicit-root targets must remain exact; Slack must accept both explicit root and exact-thread targets.
- Keep `ready -> reserve -> invoke -> one selected provider send -> complete` as the only final path. Validate pipeline, target mode, target equality, attempt identity, and receipt identity at each boundary; never retry, reroute, or consult current pipeline config after reservation.

## Implementation

1. Update `extensions/deliberation/src/contract.test.ts` first to assert the newly supplied owner mirror: required intake fields, immutable `pipelineId`, the accepted source-anchor/exact-thread discriminator, and identical lifecycle projections. Refresh `km-wire-v1.json`, matching fixtures, overlay, and provenance only from the repository-local versioned handoff; reject stale hashes, pending adoption text, or a target shape that cannot distinguish Discord root anchors from explicit threads.
2. Align `extensions/deliberation/src/km-client.ts` with that closed contract. Parse `pipelineId` and the complete effective-target semantics into the delivery envelope, require exact keys, and compare ready, reservation, invocation, completion, and historical-attempt evidence without recomputation or compatibility aliases. Update exact-body and malformed/stale/drift tests together.
3. Add `parentConversationId` to `PluginHookBeforeDispatchContext`, pass the already-resolved inbound parent from `dispatch-from-config.ts`, and test the mapper/dispatch composition. Keep Deliberation's `before_dispatch` match source-based and independent of `config.enabled` so accepted, rejected, disabled, and KM-failure paths remain silent.
4. Add the smallest generic outbound thread-anchor capability required by the accepted contract in `src/channels/plugins/outbound.types.ts` and expose it through the existing `loadAdapter` runtime type. Implement it in Discord using channel-owned thread creation/reuse logic: resolve an existing source thread or create one from the authenticated root channel/message anchor, then perform exactly one text send and return that message receipt. Do not expose Discord internals or add a Deliberation-to-Discord deep import.
5. Update Deliberation's destination parser and final provider adapters. Route source-root anchors through the new capability, existing threads through ordinary `sendText(threadId)`, and explicit roots through ordinary `sendText` without thread fields. Make Slack `threadId` optional so explicit root delivery is valid; retain canonical timestamp validation when present and preserve exact-account and real-receipt checks.
6. Strengthen `createFinalDeliveryAdapter` lifecycle checks around the accepted envelope: require one matching pipeline/target/attempt through reservation and invocation, call only the destination provider once, submit exactly one matching `SENT` or definitive `FAILED` completion, and leave unknown post-send outcomes unresolved. Add negative cases for duplicate/conflicted reservations, stale or malformed evidence, target/pipeline drift, unsupported providers, completion rejection, and provider failures with zero fallback sends.
7. Extend composed coverage: Discord root and child source-default delivery, Slack root and child source-default delivery, Slack-to-Discord, explicit Discord and Slack root/thread targets, duplicate intake, disabled processing, KM failure, and Discord-child/Slack ordinary-dispatch suppression. Assert provider call counts, thread arguments, invocation/completion identity, and absence of calls to unselected providers.
8. Update `docs/plugins/reference/deliberation.md`, `extensions/deliberation/README.md`, and `docs/plugins/sdk-channel-outbound.md` to describe the proven target discriminator, root-anchor behavior, explicit root/thread behavior, Slack source-default eligibility, immutable lifecycle, and no-fallback guarantee. Keep live config migration, Gateway restart, and rollout out of this change.
9. Run `skill:validate-implementation`, then fresh `skill:autoreview` until no accepted actionable finding remains. Run `skill:save-learning` last and save at least one learning about preserving source-anchor versus exact-thread semantics in durable routing evidence.

## Files to Modify

| File                                                                                                     | Change                                                                                |
| -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `extensions/deliberation/contracts/{km-wire-v1,cutover-controls-v1,openclaw-overlay-v1,provenance}.json` | Consume the synchronized local KM handoff and pin immutable pipeline/target semantics |
| `extensions/deliberation/src/contract.test.ts`                                                           | Gate exact owner schema, fixtures, provenance, and lifecycle projections              |
| `extensions/deliberation/src/km-client.ts`                                                               | Parse and fence pipeline/target evidence through every KM operation                   |
| `extensions/deliberation/src/{km-client,final-adapter}.test.ts`                                          | Cover stale, malformed, drift, duplicate, failure, and at-most-once evidence          |
| `src/plugins/hook-types.ts`                                                                              | Add canonical parent conversation identity to `before_dispatch`                       |
| `src/auto-reply/reply/dispatch-from-config.ts`                                                           | Forward the resolved inbound parent into fail-closed dispatch hooks                   |
| `src/{hooks/message-hook-mappers,auto-reply/reply/dispatch-from-config}.test.ts`                         | Prove parent identity reaches `before_dispatch`                                       |
| `src/channels/plugins/outbound.types.ts`                                                                 | Define the narrow generic source-thread-anchor operation accepted by the wire         |
| `extensions/discord/src/{outbound-adapter,outbound-send-context}.ts`                                     | Resolve/create a root-message thread anchor and send once through Discord ownership   |
| `extensions/discord/src/{send.creates-thread,outbound-adapter}.test.ts`                                  | Prove create/reuse, existing-thread, receipt, and no-second-send behavior             |
| `extensions/deliberation/src/{delivery-target,final-adapter}.ts`                                         | Distinguish root/anchor/exact-thread targets and preserve one provider attempt        |
| `extensions/deliberation/index.ts`                                                                       | Bind Discord and Slack adapters to the immutable target semantics                     |
| `extensions/deliberation/src/{plugin,orchestration,hooks}.test.ts`                                       | Add positive/negative provider and suppression integration matrix                     |
| `extensions/discord/src/monitor/message-handler.process.test.ts`                                         | Prove failed Discord child intake remains silent in ordinary dispatch                 |
| `extensions/deliberation/scripts/intake-producer.test.ts`                                                | Keep producer routing fields admission-owned and duplicate-safe                       |
| `docs/plugins/{reference/deliberation,sdk-channel-outbound}.md`                                          | Document final behavior and the generic outbound capability                           |
| `extensions/deliberation/README.md`                                                                      | Update bounded operational and test guidance without rollout changes                  |

## TDD

Implementace TDD cyklu dle skill:tdd. First require the repository-local contract gate to pass; do not write behavioral code against the currently pending/ambiguous mirror. Then capture RED/GREEN evidence in `plans/checkpoints/calm-vale-3982.red-green-proof.md`.

**Primary test file:** `extensions/deliberation/src/plugin.test.ts`  
**Run command:** `pnpm test extensions/deliberation/src/plugin.test.ts -- --reporter=verbose`  
**Edit hint:** Append inside `describe("deliberation plugin boundary")`; reuse `createKm`, `registerPlugin`, and `reservation`.

```ts
it("delivers an explicit Slack root without inheriting or manufacturing a thread", async () => {
  vi.useFakeTimers();
  const target = {
    provider: "slack",
    account: "workspace-delivery",
    channel: "C222",
  } as const;
  const km = createKm();
  km.ready.mockResolvedValue({
    items: [{ recordId: "record-1", text: "reply", effectiveDeliveryTarget: target }],
  } as never);
  km.reserve.mockResolvedValue({
    outcome: "reserved",
    reservation: {
      ...reservation,
      deliveryEnvelope: { ...reservation.deliveryEnvelope, deliveryTarget: target },
    },
  } as never);
  const slackSendText = vi.fn().mockResolvedValue({
    channel: "slack",
    messageId: "1723640000.777777",
    receipt: { primaryPlatformMessageId: "1723640000.777777" },
  });
  const { api, services } = registerPlugin(km, vi.fn(), slackSendText);

  await services[0]?.start({ config: api.config, stateDir: "/tmp", logger: api.logger });
  await services[0]?.stop?.({ config: api.config, stateDir: "/tmp", logger: api.logger });

  expect(slackSendText).toHaveBeenCalledTimes(1); // RED: threadless Slack is currently rejected.
  expect(slackSendText.mock.calls[0]?.[0]).not.toHaveProperty("threadId");
  expect(km.completeDelivery).toHaveBeenCalledWith(
    expect.objectContaining({ attemptedTarget: target, outcome: "SENT" }),
  );
});
```

| Test                              | RED                                                                    | GREEN                                                                             |
| --------------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Explicit Slack root               | Current parser rejects missing `threadId`; no provider call/completion | One root send, no thread field, one matching completion                           |
| Discord root source-default       | Current `threadId` is treated as an existing channel                   | Accepted anchor operation creates/reuses the source-message thread and sends once |
| Discord child failure suppression | `before_dispatch` loses the parent source                              | Parent identity reaches the hook and ordinary dispatch stays silent               |
| Pipeline/target lifecycle drift   | Current owner mirror lacks durable `pipelineId` and anchor semantics   | Every lifecycle projection rejects mismatched/stale evidence before send          |

## Verification

1. `pnpm test extensions/deliberation/src/contract.test.ts -- --reporter=verbose`
2. `pnpm test src/hooks/message-hook-mappers.test.ts src/auto-reply/reply/dispatch-from-config.test.ts extensions/discord/src/monitor/message-handler.process.test.ts -- --reporter=verbose`
3. `pnpm test extensions/discord/src/send.creates-thread.test.ts extensions/discord/src/outbound-adapter.test.ts -- --reporter=verbose`
4. `pnpm test extensions/deliberation/src/route-match.test.ts extensions/deliberation/src/hooks.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/final-adapter.test.ts extensions/deliberation/src/plugin.test.ts extensions/deliberation/src/orchestration.test.ts extensions/deliberation/scripts/intake-producer.test.ts -- --reporter=verbose`
5. `pnpm test extensions/deliberation -- --reporter=verbose`
6. `pnpm build`
7. `pnpm docs:list && pnpm docs:check-mdx && pnpm format:docs:check && git diff --check`

## Available Skills

- `tdd`: RED/GREEN implementation and proof capture.
- `technical-documentation`: source-audited public plugin/SDK updates.
- `openclaw-testing`: focused test and build lane selection.
- `validate-implementation`, `autoreview`, `save-learning`: required closeout sequence.

## Dependencies

- The earlier config/producer changes in the dirty worktree remain prerequisites and must not be reverted or rewritten incidentally.
- A synchronized repository-local KM contract/fixture/provenance handoff is mandatory. Current files explicitly show pending adoption and cannot authorize lifecycle implementation.
- The accepted target contract must make source-root anchoring distinguishable from an exact explicit thread without consulting mutable runtime config.
- No live config edit, Gateway restart, deployment, external repository inspection, or real provider send is part of this implementation.

_Status: DRAFT_
