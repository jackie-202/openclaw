# Plan 2026-08-21: Complete Deliberation source ownership acceptance

Finish the preserved implementation without repeating completed hook, monitor, or routing work, and regenerate trustworthy task-scoped acceptance evidence.

_Status: DRAFT_
_Created: 2026-08-21_

## Progress

- [x] Phase 0: Config + Init
- [x] Phase 1: Research
- [x] Phase 2: Knowledge
- [x] Phase 3: Synthesis

## Analysis

### Codebase Context

- Preserve the existing implementation in `src/plugins/{hook-types,hooks}.ts`, `src/plugin-sdk/channel-inbound.ts`, `extensions/deliberation/{index.ts,src/intake.ts}`, and the Discord/Slack monitors: it already registers synchronous source ownership, disables debounce per configured event, retains Discord parent identity through `autoThread`, and delays fast-abort confirmation until `before_dispatch`.
- Close the remaining ordering gap in `src/auto-reply/reply/dispatch-from-config.ts`: plugin-owned binding handlers and notices at lines 1781-1895 can emit before the broadcast Deliberation claim and source guard at lines 1899-2157.
- Existing tests prove individual seams, but configured-source binding suppression and composed channel-to-intake outcomes remain uncovered. Extend the existing dispatch, Discord process/queue, Slack monitor, and Deliberation hook suites rather than creating parallel harnesses.
- The acceptance run at `plans/checkpoints/acceptance-runs/quick-peak-4528-acceptance-001/result.json` evaluated a stale task-scoped snapshot; the current proof file contains GREEN, but the follow-up must produce fresh task-scoped evidence.

### Relevant Documentation

- `plans/tasks/2026-08-21_deliberation-preserve-source-ownership-and-one-intake-per-pr.md` defines the required zero-output and per-event acceptance matrix.
- `docs/plugins/{hooks,sdk-channel-inbound}.md` and `docs/plugins/reference/deliberation.md` already describe the new policy; update only if the final gate semantics change the public contract.
- `docs/reference/test.md` requires focused `pnpm test <paths>` commands and extension lanes, not raw Vitest.

### Knowledge Base

- `learnings/architecture/quick-wave-9858-source-ownership-precedes-inbound-transforms.md`: decide ownership before debounce, auto-threading, command shortcuts, and every output path; prove it from provider event through dispatch.
- `learnings/architecture/2026-08-21_discord-thread-parent-identity-before-debounce.md`: resolve Discord parent metadata before policy evaluation and retain separate event IDs.
- `learnings/tooling/2026-08-21_acceptance-green-must-match-historical-red-command.md`: link the genuine historical RED, then capture fresh GREEN with the exact same command.
- `learnings/tooling/2026-08-21_evidence-only-tdd-followups-fail-closed-on-missing-red-provenance.md`: never fabricate RED after implementation; report a lineage gap if exact provenance cannot be recovered.
- Recall used local fallback because QMD collection `openclaw-fork-learnings` was absent; most auto-extracted matches were empty, while activation proof and wire-version guidance reinforce preserving current hook registration and KM contracts.

## Available Skills

- `task-evidence`: recover exact parent-task command/outcome provenance before editing proof.
- `tdd`: record the acceptance-fix RED/GREEN cycle without manufacturing a post-implementation RED.
- `openclaw-testing`: choose the narrow local suites and broader Testbox gate.
- `validate-implementation`: verify ownership boundaries and acceptance coverage.
- `autoreview`: mandatory fresh pre-handoff code review.
- `save-learning`: mandatory final implementation-session action.

## Implementation

1. Preserve and include the existing `quick-peak-4528` runtime edits in the follow-up task scope; do not rewrite the working synchronous hook, Discord/Slack debounce bypass, auto-thread parent projection, intake registration, or fast-abort confirmation guard.
2. Extend `PluginHookInboundEventPolicyResult` with the closed mode `ownership: "exclusive"`; have Deliberation return it together with `aggregation: "separate"` for every configured pipeline source, including disabled processing.
3. Evaluate that ownership mode from canonical inbound facts before `pluginOwnedBinding` dispatch. For exclusive sources, execute a fast-abort side effect once, skip targeted binding handlers/notices, run the normal broadcast `inbound_claim` once, then terminate silently whether intake succeeds, declines, is disabled, receives empty/room content, or fails. Keep the existing binding-first behavior and later abort path unchanged for ordinary sources.
4. Add composed regressions: configured source plus plugin binding; `/stop` with no confirmation; accepted/disabled/empty/room/KM-failure outcomes with zero targeted binding, reply, or model dispatch; Discord `autoThread` retaining the configured parent; two Discord and two Slack same-window events producing distinct intake IDs; ordinary sources still aggregating and retaining binding precedence.
5. Update hook/channel-inbound docs only for the new exclusive-ownership result semantics. Do not change KM wire schemas or provenance for this acceptance repair.
6. Use `skill:task-evidence` to recover parent lineage. Create `plans/checkpoints/dark-vale-6663.red-green-proof.md` that links the genuine parent RED command/failure and records a fresh successful run of that exact command; never recreate RED by reverting code. Refresh `plans/checkpoints/dark-vale-6663.checkpoint.md` and the task-scoped acceptance input after code and proof are complete.
7. Run `skill:validate-implementation`, fresh `skill:autoreview`, and resolve actionable findings. Run `skill:save-learning` as the final implementation-session action.

## Files to Modify

| Path                                                                                                                             | Change                                                                                              |
| -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `src/plugins/hook-types.ts`, `src/plugins/hooks.ts`, `src/plugins/hooks.sync-only.test.ts`                                       | Add and dispatch the exclusive source-ownership mode without changing ordinary hook behavior.       |
| `src/plugin-sdk/channel-inbound.ts`                                                                                              | Return prepared debounce and ownership facts from the existing policy resolver.                     |
| `extensions/deliberation/src/intake.ts`, `extensions/deliberation/src/hooks.test.ts`                                             | Declare exclusive ownership for configured pipelines and prove enabled/disabled matching.           |
| `src/auto-reply/reply/dispatch-from-config.ts`, `src/auto-reply/reply/dispatch-from-config.test.ts`                              | Gate plugin-bound output and preserve one fast-abort side effect before exclusive intake/silence.   |
| `extensions/discord/src/monitor/message-handler.process.test.ts`, `extensions/discord/src/monitor/message-handler.queue.test.ts` | Compose parent-preserving auto-thread and per-event intake/silence coverage.                        |
| `extensions/slack/src/monitor/message-handler.test.ts`                                                                           | Replace mock-only admission proof with two event IDs reaching distinct intake calls where feasible. |
| `docs/plugins/hooks.md`, `docs/plugins/sdk-channel-inbound.md`, `docs/plugins/reference/deliberation.md`                         | Document exclusive ownership only if the public hook result changes.                                |
| `plans/checkpoints/dark-vale-6663.{red-green-proof,checkpoint}.md`                                                               | Record parent RED provenance, fresh GREEN, and acceptance-fix completion state.                     |

## TDD

Implement the new regression with `skill:tdd`. The historical acceptance cycle must reuse the genuine `quick-peak-4528` RED; the binding-order defect gets its own new RED before implementation.

**Test file:** `src/auto-reply/reply/dispatch-from-config.test.ts`  
**Run command:** `pnpm test src/auto-reply/reply/dispatch-from-config.test.ts`  
**Edit location:** reuse the plugin-binding setup near the existing binding-precedence test.

```ts
// Existing imports/helpers in dispatch-from-config.test.ts are reused.
const createPluginOwnedBinding = (): SessionBindingRecord => ({
  bindingId: "binding-1",
  targetSessionKey: "plugin-binding:test:1",
  targetKind: "session",
  conversation: {
    channel: "discord",
    accountId: "default",
    conversationId: "channel:source",
  },
  status: "active",
  boundAt: 1710000000000,
  metadata: {
    pluginBindingOwner: "plugin",
    pluginId: "bound-plugin",
    pluginRoot: "/tmp/bound-plugin",
    data: { kind: "test-session", version: 1 },
  },
});

it("claims an exclusive source before plugin-bound output", async () => {
  mocks.tryFastAbortFromMessage.mockResolvedValue({ handled: true, aborted: true });
  hookMocks.runner.runInboundEventPolicy.mockReturnValue({
    aggregation: "separate",
    ownership: "exclusive",
  });
  hookMocks.runner.runInboundClaim.mockResolvedValue({ handled: false });
  hookMocks.runner.runInboundClaimForPluginOutcome.mockResolvedValue({
    status: "handled",
    result: { handled: true, reply: { text: "must not send" } },
  });
  sessionBindingMocks.resolveByConversation.mockReturnValue(createPluginOwnedBinding());
  const dispatcher = createDispatcher();
  const replyResolver = vi.fn(async () => ({ text: "must not run" }) satisfies ReplyPayload);

  await dispatchReplyFromConfig({
    ctx: buildTestCtx({
      Provider: "discord",
      AccountId: "default",
      To: "discord:channel:source",
      Body: "/stop",
      BodyForCommands: "/stop",
      MessageSid: "provider-event-1",
    }),
    cfg: emptyConfig,
    dispatcher,
    replyResolver,
  });

  expect(mocks.tryFastAbortFromMessage).toHaveBeenCalledOnce();
  expect(hookMocks.runner.runInboundClaim).toHaveBeenCalledOnce();
  expect(hookMocks.runner.runInboundClaimForPluginOutcome).not.toHaveBeenCalled(); // RED
  expect(mocks.routeReply).not.toHaveBeenCalled();
  expect(dispatcher.sendFinalReply).not.toHaveBeenCalled();
  expect(replyResolver).not.toHaveBeenCalled();
});
```

| Test                                                           | RED                                                              | GREEN                                                                                                      |
| -------------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Exclusive configured source with plugin binding and `/stop`    | Bound plugin handles/emits first and abort is not attempted.     | Abort side effect runs once, broadcast intake runs once, and all binding/reply/model output is suppressed. |
| Enabled, disabled, empty, room, and KM-failure source outcomes | At least one pre-guard path can emit or dispatch.                | Every configured outcome is silent; accepted intake is the only KM call.                                   |
| Discord/Slack same-window events                               | Mock-only or aggregated proof does not establish two intake IDs. | Each provider event reaches one intake with its own ID.                                                    |
| Ordinary plugin-bound source                                   | Exclusive changes accidentally alter global precedence.          | Existing targeted-binding-first and debounce tests remain unchanged.                                       |

**Historical proof command, rerun unchanged for fresh GREEN:**

`pnpm test src/plugins/hooks.sync-only.test.ts extensions/deliberation/src/hooks.test.ts extensions/deliberation/src/plugin.test.ts extensions/discord/src/monitor/message-handler.queue.test.ts extensions/slack/src/monitor/message-handler.test.ts src/auto-reply/reply/dispatch-from-config.test.ts extensions/discord/src/monitor/message-handler.process.test.ts -- --reporter=verbose`

## Verification

1. Run the focused RED/GREEN command above, then the exact historical proof command.
2. Run `pnpm test extensions/deliberation/src/route-match.test.ts extensions/deliberation/src/hooks.test.ts extensions/deliberation/src/plugin.test.ts`.
3. Run `pnpm check:test-types` and focused lint/format checks for touched files.
4. Run `pnpm build` because the public Plugin SDK hook contract changes.
5. If docs change, run `pnpm docs:list` before editing, then `pnpm check:docs`; report only unrelated pre-existing failures with exact paths.
6. Use `skill:openclaw-testing` to select the appropriate Testbox changed gate for the cross-plugin/core diff.

## Dependencies

- Parent proof: `plans/checkpoints/quick-peak-4528.red-green-proof.md`, with behavior-specific RED at the exact historical command.
- Acceptance snapshot: `plans/checkpoints/acceptance-runs/quick-peak-4528-acceptance-001/{manifest,result}.json`; it must not be treated as evidence for the current mutable worktree.
- Existing concurrent worktree changes must remain intact; stage and report only task-owned files when producing the new task-scoped diff.
