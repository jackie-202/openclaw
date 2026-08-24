# Plan 2026-08-21: Deliberation source ownership and provider-event intake

_Status: DRAFT_

## Progress

- [x] Phase 0: initialize canonical plan
- [x] Phase 1: research routing and tests
- [x] Phase 2: apply relevant learnings
- [x] Phase 3: synthesize implementation plan

## Analysis

### Codebase context

- `extensions/deliberation/src/route-match.ts:66-82,109-223` already owns canonical source matching and requires a Discord thread parent; reuse that owner logic rather than reading Deliberation config in channels.
- `extensions/discord/src/monitor/message-handler.ts:148-294` and `extensions/slack/src/monitor/message-handler.ts:48-155` merge provider events before `inbound_claim`, retaining the final ID as `MessageSid`; `MessageSids` remains context and cannot restore separate intake records.
- `src/channels/inbound-debounce-policy.ts:16-38` and `src/auto-reply/inbound-debounce.ts:219-257` already support ordered per-event debounce bypass while preserving ordinary same-key aggregation.
- `extensions/discord/src/monitor/threading.auto-thread.ts:39-74` retargets replies/session state to the created child; `extensions/discord/src/monitor/message-handler.context.ts:339-346` must still project the authenticated source channel as the child's parent.
- `extensions/deliberation/src/intake.ts:63-132` correctly separates successful intake from unconditional configured-source suppression for disabled, failed, empty, malformed, and room-event paths.
- `src/auto-reply/reply/dispatch-from-config.ts:1899-1924,1953-1996,2142-2192` runs successful claims before ordinary work, but sends fast-abort confirmation before `before_dispatch`; defer only that confirmation/return so `/stop` still aborts the active run.
- Existing composed Discord coverage at `extensions/discord/src/monitor/message-handler.process.test.ts:574-769` proves accepted and KM-failure claims after context construction, but bypasses monitor debounce and lacks auto-thread, disabled, empty, room-event, and fast-abort vectors.

### Relevant documentation

- `docs/proposals/proposal-20260820-203458-161e2c_per-source-deliberation-pipelines-with-source-default-delivery.md:74-86` defines provider-event intake identity, history-only context, and source silence.
- `docs/plugins/reference/deliberation.md:93-114,141-155` is the user-visible contract to update with the debounce and auto-thread guarantees.
- `docs/plugins/sdk-channel-inbound.md:10-39` keeps provider event normalization and aggregation in the generic channel-inbound boundary.
- `docs/reference/test.md:11-24,35-38` requires focused `pnpm test <path>` runs and extension lanes rather than raw Vitest.

### Knowledge base

- `learnings/architecture/2026-07-28_residue-audits-require-activation-proof.md`: prove registration, activation, callers, and side effects; a route matcher alone does not prove channel behavior.
- `learnings/architecture/2026-07-28_wire-protocol-versions-are-not-implementation-generations.md`: preserve the current KM wire contract and trace executable ownership instead of changing versioned artifacts for this routing fix.
- `learnings/architecture/2026-07-29_acceptance-fix-plans-must-close-contract-gates-explicitly.md`: capture a real focused RED before implementation and fresh GREEN after it.
- Recall backend: local fallback (`openclaw-fork-learnings` QMD collection absent).

## Available Skills

- `tdd`: implement the behavioral fix test-first and record RED/GREEN proof.
- `openclaw-testing`: choose focused monitor, routing, hook, and dispatch commands.
- `validate-implementation`: verify source ownership and architecture after edits.
- `autoreview`: required fresh pre-commit review after implementation.

## Implementation

1. Add a synchronous typed inbound-event policy hook that receives authenticated provider/account/conversation/parent facts and may require `aggregation: "separate"`. Expose one narrow resolver from `openclaw/plugin-sdk/channel-inbound`; missing hooks retain ordinary behavior, while a match or policy-evaluation error vetoes aggregation.
2. Register the policy from Deliberation for every normalized pipeline source, even when KM processing is disabled, by reusing `matchesSource`. Add it to the plugin manifest's expected hooks and prove configured/unconfigured root and child matching without duplicating route parsing in core or channels.
3. In Discord, resolve the provider source parent before enqueue, carry that prepared fact into preflight/context, and pass the policy result as `allowDebounce` to `shouldDebounceTextInbound`. For `autoThread`, set `conversation.parentId` to the original `messageChannelId` while keeping the created child as `threadId`, reply target, and session target.
4. In Slack, evaluate the same policy after thread timestamp resolution using the channel as source authority, then feed `allowDebounce` into both the pending-key calculation and debouncer callback. Preserve existing DM/thread keys, top-level isolation, media/control-command flush ordering, and ordinary aggregation.
5. Refactor fast abort in `dispatch-from-config.ts` to execute the abort side effect first, retain its result, run `before_dispatch`, and only then emit/return the ordinary abort confirmation when no hook handled the event. Keep successful `inbound_claim` ahead of both paths and keep model, `reply_dispatch`, tool, block, and final output downstream.
6. Replace the mislabeled pure matcher matrix in `extensions/deliberation/src/hooks.test.ts` with real intake outcomes, then compose monitor/dispatch coverage for enabled success, disabled processing, KM failure, empty content, room events, fast abort, and Discord auto-thread; every configured-source case must assert zero ordinary resolver/reply dispatch and exact provider event IDs on intake.
7. Update the Deliberation and hook/channel-inbound docs with the source-parent and one-event/one-intake guarantees. Do not hand-edit the KM mirror: first obtain an owner-authorized contract revision that removes the 60-second multi-message record semantics, then copy its schema/fixtures and refresh provenance together.

## Files to Modify

| Path                                                                                                                                                 | Change                                                                                                                           |
| ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `src/plugins/hook-types.ts`, `src/plugins/hooks.ts`, `src/plugins/wired-hooks-*.test.ts`                                                             | Define and run the synchronous inbound aggregation policy.                                                                       |
| `src/plugin-sdk/channel-inbound.ts`, `src/plugin-sdk/channel-inbound.test.ts`                                                                        | Export/test the narrow active-policy resolver.                                                                                   |
| `extensions/deliberation/index.ts`, `extensions/deliberation/openclaw.plugin.json`, `extensions/deliberation/src/{intake,hooks.test,plugin.test}.ts` | Register source ownership before debounce and prove all intake/suppression outcomes.                                             |
| `extensions/discord/src/monitor/{message-handler,message-handler.context}.ts`                                                                        | Carry source-parent facts, bypass aggregation only for matched sources, and preserve parent through auto-thread.                 |
| `extensions/discord/src/monitor/{message-handler.queue,message-handler.process,monitor.threading-utils}.test.ts`                                     | Prove separate IDs/intakes, ordinary debounce, auto-thread identity, and zero ordinary dispatch.                                 |
| `extensions/slack/src/monitor/message-handler.ts`, `extensions/slack/src/monitor/message-handler.test.ts`                                            | Bypass configured-source aggregation after thread resolution and retain ordinary behavior.                                       |
| `src/auto-reply/reply/dispatch-from-config.ts`, `src/auto-reply/reply/{dispatch-from-config,dispatch-from-config.acp-abort}.test.ts`                 | Gate fast-abort confirmation before every ordinary output/model path without losing the abort side effect.                       |
| `docs/plugins/{hooks,sdk-channel-inbound}.md`, `docs/plugins/reference/deliberation.md`                                                              | Document the additive policy and source ownership guarantees.                                                                    |
| `extensions/deliberation/contracts/{km-wire-v1.json,cutover-controls-v1.json,provenance.json}`, `extensions/deliberation/src/contract.test.ts`       | Update only from the matching accepted KM-owner handoff; remove burst/multi-message semantics and validate one event per record. |

## TDD

Implement the RED/GREEN cycle with `skill:tdd`; record evidence in `plans/checkpoints/quick-peak-4528.red-green-proof.md`.

**Primary test file:** `src/auto-reply/reply/dispatch-from-config.test.ts`  
**Run command:** `pnpm test src/auto-reply/reply/dispatch-from-config.test.ts`  
**Edit location:** append inside `describe("before_dispatch hook")`.

```ts
it("suppresses fast-abort confirmation when before_dispatch claims the source", async () => {
  mocks.tryFastAbortFromMessage.mockResolvedValue({ handled: true, aborted: true });
  hookMocks.runner.runBeforeDispatch.mockResolvedValue({ handled: true });
  const dispatcher = createDispatcher();
  const replyResolver = vi.fn(async () => ({ text: "ordinary reply" }) as ReplyPayload);

  const result = await dispatchReplyFromConfig({
    ctx: createHookCtx({ Body: "/stop", BodyForCommands: "/stop" }),
    cfg: emptyConfig,
    dispatcher,
    replyResolver,
  });

  expect(mocks.tryFastAbortFromMessage).toHaveBeenCalledOnce();
  expect(hookMocks.runner.runBeforeDispatch).toHaveBeenCalledOnce();
  expect(mocks.routeReply).not.toHaveBeenCalled(); // RED: currently sends before the hook.
  expect(dispatcher.sendFinalReply).not.toHaveBeenCalled();
  expect(replyResolver).not.toHaveBeenCalled();
  expect(result.queuedFinal).toBe(false);
});
```

| Test                                                | RED                                                                | GREEN                                                                                                |
| --------------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| Fast abort on a configured source                   | Abort confirmation is routed and `before_dispatch` is skipped.     | Abort side effect occurs, hook claims, no confirmation/model/reply is emitted.                       |
| Discord/Slack same-window configured events         | One synthetic dispatch/intake retains only the final `MessageSid`. | Two dispatches/intakes retain their own provider IDs; history/batch metadata is not intake identity. |
| Unconfigured same-window events                     | Existing tests continue to aggregate.                              | Existing debounce and auto-thread behavior remains unchanged.                                        |
| Disabled/failed/empty/room/auto-thread source paths | At least one path reaches ordinary output/model work.              | Every path terminates silently; accepted intake is the only KM call.                                 |

## Verification

1. `pnpm test src/plugins/wired-hooks-inbound-event-policy.test.ts src/plugin-sdk/channel-inbound.test.ts src/auto-reply/reply/dispatch-from-config.test.ts src/auto-reply/reply/dispatch-from-config.acp-abort.test.ts`
2. `pnpm test extensions/deliberation/src/route-match.test.ts extensions/deliberation/src/hooks.test.ts extensions/deliberation/src/plugin.test.ts extensions/deliberation/src/contract.test.ts`
3. `pnpm test extensions/discord/src/monitor/message-handler.queue.test.ts extensions/discord/src/monitor/message-handler.process.test.ts extensions/discord/src/monitor/monitor.threading-utils.test.ts extensions/slack/src/monitor/message-handler.test.ts extensions/slack/src/monitor/message-handler.debounce-key.test.ts`
4. `pnpm build`
5. `pnpm check:docs`
6. Run `skill:validate-implementation`, then fresh `skill:autoreview`; resolve all actionable findings.
