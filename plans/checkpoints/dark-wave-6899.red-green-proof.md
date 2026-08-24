# TDD Red-Green Proof: dark-wave-6899

<!-- proof-capture-metadata: {"version":1,"task_id":"dark-wave-6899","command":["pnpm","test","src/plugins/hooks.sync-only.test.ts","src/plugin-sdk/channel-inbound.test.ts","extensions/discord/src/monitor/message-handler.queue.test.ts","extensions/discord/src/monitor/message-handler.process.test.ts","extensions/slack/src/monitor/message-handler.deliberation.test.ts","src/auto-reply/reply/dispatch-from-config.test.ts","--","--reporter=verbose"],"command_sha256":"8cc7f016cc1b7619ddd07a19f71bfc1fc9a8220064edee2b4c12339c8ec29db9"} -->

## RED Phase

- **Timestamp:** 2026-08-22T21:57:10.312973+00:00
- **Test command:** `pnpm test src/plugins/hooks.sync-only.test.ts src/plugin-sdk/channel-inbound.test.ts extensions/discord/src/monitor/message-handler.queue.test.ts extensions/discord/src/monitor/message-handler.process.test.ts extensions/slack/src/monitor/message-handler.deliberation.test.ts src/auto-reply/reply/dispatch-from-config.test.ts -- --reporter=verbose`
- **Exit code:** 1

### Standard Output

```text

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

 ✓ |plugin-sdk| src/plugin-sdk/channel-inbound.test.ts > channel-inbound public helpers > builds inbound event kind into message context 3ms
 × |plugin-sdk| src/plugin-sdk/channel-inbound.test.ts > channel-inbound public helpers > preserves the closed inbound ownership decision 3ms
   → expected { allowDebounce: true } to deeply equal { kind: 'separate' }

 Test Files  1 failed (1)
      Tests  1 failed | 1 passed (2)
   Start at  23:57:07
   Duration  3.16s (transform 1.91s, setup 87ms, import 2.99s, tests 7ms, environment 0ms)

[ELIFECYCLE] Test failed. See above for more details.
```

### Standard Error

```text
$ node scripts/test-projects.mjs src/plugins/hooks.sync-only.test.ts src/plugin-sdk/channel-inbound.test.ts extensions/discord/src/monitor/message-handler.queue.test.ts extensions/discord/src/monitor/message-handler.process.test.ts extensions/slack/src/monitor/message-handler.deliberation.test.ts src/auto-reply/reply/dispatch-from-config.test.ts -- --reporter=verbose
[test] starting test/vitest/vitest.plugin-sdk.config.ts

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  |plugin-sdk| src/plugin-sdk/channel-inbound.test.ts > channel-inbound public helpers > preserves the closed inbound ownership decision
AssertionError: expected { allowDebounce: true } to deeply equal { kind: 'separate' }

- Expected
+ Received

  {
-   "kind": "separate",
+   "allowDebounce": true,
  }

 ❯ src/plugin-sdk/channel-inbound.test.ts:61:53
     59|
     60|     runInboundEventPolicy.mockReturnValueOnce({ kind: "separate" });
     61|     expect(resolveChannelInboundEventPolicy(event)).toEqual({ kind: "s…
       |                                                     ^
     62|
     63|     runInboundEventPolicy.mockReturnValueOnce({

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯

[test] failed 1 Vitest shard in 6.26s
```

## GREEN Phase

- **Timestamp:** 2026-08-22T22:17:32.700985+00:00
- **Test command:** `pnpm test src/plugins/hooks.sync-only.test.ts src/plugin-sdk/channel-inbound.test.ts extensions/discord/src/monitor/message-handler.queue.test.ts extensions/discord/src/monitor/message-handler.process.test.ts extensions/slack/src/monitor/message-handler.deliberation.test.ts src/auto-reply/reply/dispatch-from-config.test.ts -- --reporter=verbose`
- **Exit code:** 0

### Standard Output

```text

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

 ✓ |plugin-sdk| src/plugin-sdk/channel-inbound.test.ts > channel-inbound public helpers > builds inbound event kind into message context 3ms
 ✓ |plugin-sdk| src/plugin-sdk/channel-inbound.test.ts > channel-inbound public helpers > preserves the closed inbound ownership decision 1ms
 ✓ |plugin-sdk| src/plugin-sdk/channel-inbound.test.ts > channel-inbound public helpers > terminates exclusive ownership after { status: 'handled', result: { handled: true } } 1ms
 ✓ |plugin-sdk| src/plugin-sdk/channel-inbound.test.ts > channel-inbound public helpers > terminates exclusive ownership after { status: 'declined' } 0ms
 ✓ |plugin-sdk| src/plugin-sdk/channel-inbound.test.ts > channel-inbound public helpers > terminates exclusive ownership after { status: 'missing_plugin' } 0ms
 ✓ |plugin-sdk| src/plugin-sdk/channel-inbound.test.ts > channel-inbound public helpers > terminates exclusive ownership after { status: 'no_handler' } 0ms
 ✓ |plugin-sdk| src/plugin-sdk/channel-inbound.test.ts > channel-inbound public helpers > terminates exclusive ownership after { status: 'error', error: 'secret detail' } 0ms
 ✓ |plugin-sdk| src/plugin-sdk/channel-inbound.test.ts > channel-inbound public helpers > fails ambiguous ownership closed without invoking a claimant 0ms

 Test Files  1 passed (1)
      Tests  8 passed (8)
   Start at  00:14:15
   Duration  2.43s (transform 1.37s, setup 77ms, import 2.27s, tests 6ms, environment 0ms)


 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > loads runtime plugins before reading inbound hook state 8ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > returns session metadata changes marked during reply resolution 1ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > notifies session metadata changes before later dispatch errors 2ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > skips pre-dispatch admission when the caller already aborted 1ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > skips a Telegram topic heartbeat turn while a reply operation is active 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > does not route when Provider matches OriginatingChannel (even if Surface is missing) 1ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > records routed Slack thread id on dispatch-owned reply operations 1ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > lets a different Slack DM routed thread reach reply resolution while another thread is active 1ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > keeps non-Slack routed direct turns behind the active reply operation 1005ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > routes when OriginatingChannel differs from Provider 5ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > routes exec-event replies using persisted session delivery context when current turn has no originating route 19ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > routes sessions_send internal webchat handoffs through persisted external delivery context 3ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > routes exec-event replies using last route fields when delivery context is missing 2ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > honors sendPolicy deny for recovered exec-event delivery channel 2ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > falls back to thread-scoped session key when current ctx has no MessageThreadId 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > uses Slack DM TransportThreadId when ReplyToId is the current message 2ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > does not resurrect a cleared route thread from origin metadata 2ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > forces suppressTyping when routing to a different originating channel 1ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > forces suppressTyping for internal webchat turns 1ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > routes when provider is webchat but surface carries originating channel metadata 1ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > routes Feishu replies when provider is webchat and origin metadata points to Feishu 1ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > does not route when provider already matches originating channel 1ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > does not route external origin replies when current surface is internal webchat without explicit delivery 1ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > routes external origin replies for internal webchat turns when explicit delivery is set 1ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > routes media-only tool results when summaries are suppressed 2ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > provides onToolResult in DM sessions 1ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > does not synthesize hidden text-only tool summaries into TTS media 2ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > suppresses late text-only tool results after final delivery starts 1ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > suppresses group tool summaries but still forwards tool media 1ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > keeps group tool summaries suppressed when the channel omits the quiet-default flag 1ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > allows group tool summaries when session verbose is enabled without a channel quiet-default flag 1ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > allows group tool summaries when the agent verbose default is enabled 1ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > keeps group tool summaries suppressed when session verbose is disabled 1ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > allows group tool summaries when verbose is enabled during the run 1ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > keeps tool-error fallbacks available when verbose is disabled during the run 1ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > forwards channel-owned group progress callbacks while verbose is off 1ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > forwards channel-owned group progress callbacks while source delivery is suppressed 1ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > suppresses channel-owned room-event progress callbacks while source delivery is suppressed 1ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > exposes live tool-summary state to reply_dispatch hooks 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > forwards direct native progress callbacks while verbose is off 1ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > suppresses direct native progress callbacks when send policy denies delivery 1ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > normalizes tool-result media before delivery and drops blocked file URLs 1ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > delivers tool summaries in forum topic sessions when verbose is enabled 1ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > delivers deterministic exec approval tool payloads in groups 1ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > sends tool results via dispatcher in DM sessions 1ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > delivers native tool summaries and tool media 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > bypasses final TTS for status notices 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > renders the first plan update as a status notice without generic working statuses 1ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > sends only one plan status notice per reply run 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > suppresses generic patch working statuses when verbose is enabled 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > delivers Slack non-DM verbose progress when verbose is enabled 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > suppresses plan notices when session verbose is off 1ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > refreshes verbose progress with session entry snapshots 1ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > suppresses text-only tool summaries when preview tool-progress suppression is enabled 4ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > keeps failed tools compact when preview tool-progress suppression is enabled 1ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > keeps message-tool-only failed tool output compact in normal verbose mode 1ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > keeps terminal tool-error fallbacks available when message-tool-only error text is hidden 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > allows message-tool-only failed tool output in verbose full mode 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > suppresses terminal tool-error fallbacks when regular verbose progress is visible 1ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > suppresses terminal tool-error fallbacks in group sessions when verbose progress is visible 1ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > keeps terminal tool-error fallbacks available when verbose turns on after a quiet failure 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > does not pre-latch terminal tool-error suppression when diagnostics are disabled 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > keeps terminal tool-error fallbacks available in verbose full mode 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > delivers text-only tool summaries when verbose overrides preview suppression 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > delivers plan status when verbose overrides preview suppression 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > delivers verbose tool summaries despite message-tool-only source suppression 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > keeps verbose tool summaries suppressed for room events 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > delivers verbose tool summaries for Discord channel message-tool-only turns 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > still delivers media-only tool payloads when preview tool-progress suppression is enabled 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > delivers deterministic exec approval tool payloads for native commands with progress suppression 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > fast-aborts without calling the reply resolver 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > fast-abort reply includes stopped subagent count when provided 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > routes ACP sessions through the runtime branch and streams block replies 5ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > emits lifecycle end for ACP turns using the current run id 1ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > emits lifecycle error for ACP turn failures using the current run id 1ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > posts a one-time resolved-session-id notice in thread after the first ACP turn 1ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > posts resolved-session-id notice when ACP session is bound even without MessageThreadId 1ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > honors the configured default account when resolving plugin-owned binding fallbacks 1ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > retargets reply_dispatch to a bound generic ACP session before model fallback 2ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > coalesces tiny ACP token deltas into normal Discord text spacing 1ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > generates final-mode TTS audio after ACP block streaming completes 1ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > normalizes accumulated block TTS-only media before final delivery 1ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > closes oneshot ACP sessions after the turn completes 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > deduplicates inbound messages by MessageSid and origin 1ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > keeps message-tool-only delivery mode on duplicate inbound returns 1ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > does not mark duplicate inbound returns as tool-only when message is unavailable 1ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > keeps local discord exec approval tool prompts when the native runtime is inactive 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > suppresses local discord exec approval tool prompts when the native runtime is active 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > keeps local signal exec approval tool prompts when the native runtime is inactive 1ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > suppresses local signal exec approval tool prompts when the native runtime is active 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > keeps local signal exec approval tool prompts when top-level exec approvals are disabled 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > deduplicates same-agent inbound replies across main and direct session keys 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > emits message_received hook with originating channel metadata 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > broadcasts inbound claims and short-circuits when a plugin claims 1ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > emits internal message:received hook when a session key is available 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > skips internal message:received hook when session key is unavailable 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > falls back to CommandTargetSessionKey for internal hook when SessionKey is empty 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > routes native-command-redirect replies using the redirect target sessionKey for outbound delivery 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > routes non-native (text) command replies using the inbound sessionKey for outbound delivery 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > emits diagnostics when enabled 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > carries the session store UUID on interactive diagnostic events 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > does not stamp a command target's UUID under the source session key 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > marks diagnostic progress for real reply events but not reply start callbacks 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > forwards non-answer progress callbacks when source replies are suppressed 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > routes plugin-owned bindings to the owning plugin before generic inbound claim broadcast 1ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > lets an exclusive inbound source owner claim before plugin-bound output 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > routes Discord thread plugin-owned bindings by raw thread id 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > does not run plugin-owned binding delivery when the caller already aborted 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > lets authorized plugin-owned binding commands fall through to command processing 3ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > keeps authorized unknown slash text in a plugin-owned binding routed to the bound plugin 1ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > keeps unauthorized plugin-owned binding slash replies suppressed while routed to the bound plugin 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > delivers plugin-owned binding replies returned by the owning inbound claim hook 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > routes plugin-owned Discord DM bindings to the owning plugin before generic inbound claim broadcast 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > falls back to OpenClaw once per startup when a bound plugin is missing 1ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > falls back to OpenClaw when the bound plugin is loaded but has no inbound_claim handler 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > notifies the user when a bound plugin declines the turn and keeps the binding attached 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > notifies the user when a bound plugin errors and keeps raw details out of the reply 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > marks diagnostics skipped for duplicate inbound messages 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > keeps duplicate skip diagnostics inside the active inbound trace 1ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > releases inbound dedupe when dispatch fails before completion 1ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > poisons inbound dedupe when dispatch fails after a block reply 1ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > poisons inbound dedupe when dispatch fails after a suppressed tool result 1ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > passes the loaded config plus configOverride patch to replyResolver when provided 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > passes the already loaded config to replyResolver when configOverride is not provided 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > suppresses isReasoning payloads from final replies (WhatsApp channel) 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > suppresses isReasoning payloads from block replies (generic dispatch path) 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > strips split TTS directives from streamed block text before delivery 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > forwards generated-media block replies in WhatsApp group sessions 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > signals block boundaries before async block delivery is queued 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > does not wait for same-channel block dispatcher delivery before resolving block replies 2ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > waits for pending same-channel block delivery before completing block-only dispatch 1ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > waits for pending same-channel block delivery before forwarding tool progress 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > does not synthesize tool-start capability while ordering item progress 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > dispatchReplyFromConfig > forwards payload metadata into onBlockReplyQueued context 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > before_dispatch hook > skips model dispatch when hook returns handled 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > before_dispatch hook > silently short-circuits when hook returns handled without text 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > before_dispatch hook > runs source suppression before emitting a fast-abort confirmation 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > before_dispatch hook > uses canonical hook metadata and shared routed final delivery 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > before_dispatch hook > passes inbound reply metadata to before_dispatch event and context 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > before_dispatch hook > passes the canonical parent conversation to before_dispatch 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > before_dispatch hook > suppresses before_dispatch handled reply when sendPolicy is deny 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > before_dispatch hook > continues default dispatch when hook returns not handled 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > sendPolicy deny — suppress delivery, not processing (#53328) > still calls the replyResolver when sendPolicy is deny 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > sendPolicy deny — suppress delivery, not processing (#53328) > passes suppressUserDelivery to tail reply_dispatch when sendPolicy is deny 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > sendPolicy deny — suppress delivery, not processing (#53328) > suppresses final reply delivery when sendPolicy is deny 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > sendPolicy deny — suppress delivery, not processing (#53328) > does not mark allowed group silence eligible for no-visible fallback 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > sendPolicy deny — suppress delivery, not processing (#53328) > marks disallowed group silence eligible for no-visible fallback 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > sendPolicy deny — suppress delivery, not processing (#53328) > suppresses tool result delivery when sendPolicy is deny 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > sendPolicy deny — suppress delivery, not processing (#53328) > suppresses block reply delivery when sendPolicy is deny 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > sendPolicy deny — suppress delivery, not processing (#53328) > delivers replies normally when sendPolicy is allow 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > sendPolicy deny — suppress delivery, not processing (#53328) > delivers provider conversation-state runner payloads as outbound channel replies 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > sendPolicy deny — suppress delivery, not processing (#53328) > delivers replies normally when sendPolicy is unset (defaults to allow) 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > sendPolicy deny — suppress delivery, not processing (#53328) > suppresses the fast-abort reply under sendPolicy deny 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > sendPolicy deny — suppress delivery, not processing (#53328) > delivers the fast-abort reply normally when sendPolicy is allow (regression guard) 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > sendPolicy deny — suppress delivery, not processing (#53328) > skips plugin-bound claim hook under deny and falls through to suppressed agent dispatch 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > sendPolicy deny — suppress delivery, not processing (#53328) > routes plugin-owned bindings under message-tool-only source delivery: 'handled without a plugin reply' 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > sendPolicy deny — suppress delivery, not processing (#53328) > routes plugin-owned bindings under message-tool-only source delivery: 'handled with a plugin reply' 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > sendPolicy deny — suppress delivery, not processing (#53328) > routes plugin-owned bindings under message-tool-only source delivery: 'suppresses ambient room_event plugin …' 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > sendPolicy deny — suppress delivery, not processing (#53328) > keeps unmentioned plugin-bound fallback from ordinary group agent dispatch 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > sendPolicy deny — suppress delivery, not processing (#53328) > lets authorized control commands without CommandSource escape plugin-bound fallback 1ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > sendPolicy deny — suppress delivery, not processing (#53328) > keeps unauthorized native commands on the plugin-bound claim path 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > sendPolicy deny — suppress delivery, not processing (#53328) > keeps structured normal command turns on the plugin-bound claim path 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > sendPolicy deny — suppress delivery, not processing (#53328) > keeps message-tool-only source delivery private while still processing the turn 1ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > sendPolicy deny — suppress delivery, not processing (#53328) > treats message-tool-only observed delivery as visible for fallback eligibility 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > sendPolicy deny — suppress delivery, not processing (#53328) > preserves hook-blocked metadata when source delivery is message-tool-only 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > sendPolicy deny — suppress delivery, not processing (#53328) > delivers verbose tool progress in message-tool-only mode 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > sendPolicy deny — suppress delivery, not processing (#53328) > delivers marked runtime failure notices in message-tool-only mode 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > sendPolicy deny — suppress delivery, not processing (#53328) > suppresses marked runtime failure notices for room events 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > sendPolicy deny — suppress delivery, not processing (#53328) > delivers marked explicit command terminal replies in room events (#87107) 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > sendPolicy deny — suppress delivery, not processing (#53328) > delivers marked /compact reply in room event when CommandSource is undefined (#87107) 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > sendPolicy deny — suppress delivery, not processing (#53328) > mirrors internal source reply payloads into the active transcript 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > sendPolicy deny — suppress delivery, not processing (#53328) > mirrors post-hook internal source reply payloads into the active transcript 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > sendPolicy deny — suppress delivery, not processing (#53328) > does not mirror internal source replies cancelled by dispatcher hooks 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > sendPolicy deny — suppress delivery, not processing (#53328) > keeps internal source reply metadata on TTS-cloned final payloads 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > sendPolicy deny — suppress delivery, not processing (#53328) > does not deliver marked runtime failure notices when sendPolicy denies delivery 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > sendPolicy deny — suppress delivery, not processing (#53328) > keeps opted-in group/channel final replies private when message-tool-only events miss the message tool 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > sendPolicy deny — suppress delivery, not processing (#53328) > keeps same-provider group/channel final replies private in message-tool-only mode 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > sendPolicy deny — suppress delivery, not processing (#53328) > keeps ambient room-event group/channel finals private without a message tool send 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > sendPolicy deny — suppress delivery, not processing (#53328) > delivers internal WebChat room-event final replies automatically 5ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > sendPolicy deny — suppress delivery, not processing (#53328) > preserves configured message-tool delivery for internal WebChat direct replies 1ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > sendPolicy deny — suppress delivery, not processing (#53328) > keeps default direct source delivery automatic 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > sendPolicy deny — suppress delivery, not processing (#53328) > keeps Codex direct source delivery message-tool-only when config is unset 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > sendPolicy deny — suppress delivery, not processing (#53328) > uses Codex direct source delivery defaults before a session entry exists 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > sendPolicy deny — suppress delivery, not processing (#53328) > uses modelByChannel for first-turn delivery defaults 109ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > sendPolicy deny — suppress delivery, not processing (#53328) > does not treat supplemental runtime profiles as model overrides 1ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > sendPolicy deny — suppress delivery, not processing (#53328) > uses configured defaults before cached Codex runtime metadata 52ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > sendPolicy deny — suppress delivery, not processing (#53328) > lets config restore automatic Codex direct source delivery 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > sendPolicy deny — suppress delivery, not processing (#53328) > honors model overrides before cached Codex direct source delivery defaults 42ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > sendPolicy deny — suppress delivery, not processing (#53328) > honors parent model overrides before Codex direct source delivery defaults 45ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > sendPolicy deny — suppress delivery, not processing (#53328) > honors heartbeat model overrides before Codex direct source delivery defaults 40ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > sendPolicy deny — suppress delivery, not processing (#53328) > preserves non-Codex harness direct source delivery defaults 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > sendPolicy deny — suppress delivery, not processing (#53328) > falls back to automatic group/channel delivery when the message tool is unavailable 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > sendPolicy deny — suppress delivery, not processing (#53328) > falls back to automatic group/channel delivery when group tools remove the message tool 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > sendPolicy deny — suppress delivery, not processing (#53328) > falls back when a channel precomputed message-tool-only delivery but the message tool is unavailable 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > sendPolicy deny — suppress delivery, not processing (#53328) > keeps native command replies visible in group/channel events 0ms
 ✓ |auto-reply| src/auto-reply/reply/dispatch-from-config.test.ts > sendPolicy deny — suppress delivery, not processing (#53328) > keeps default group/channel source delivery automatic 0ms

 Test Files  1 passed (1)
      Tests  196 passed (196)
   Start at  00:14:19
   Duration  3.78s (transform 1.30s, setup 72ms, import 358ms, tests 3.27s, environment 0ms)


 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

 ✓ |plugins| src/plugins/hooks.sync-only.test.ts > sync-only plugin hooks > keeps inbound events separate when an ownership policy claims the source 18ms
 ✓ |plugins| src/plugins/hooks.sync-only.test.ts > sync-only plugin hooks > fails closed when multiple plugins claim exclusive ownership 1ms
 ✓ |plugins| src/plugins/hooks.sync-only.test.ts > sync-only plugin hooks > fails safe to separate events when an inbound ownership policy is async 0ms
 ✓ |plugins| src/plugins/hooks.sync-only.test.ts > sync-only plugin hooks > warns and ignores accidental async tool_result_persist handlers 0ms
 ✓ |plugins| src/plugins/hooks.sync-only.test.ts > sync-only plugin hooks > warns and ignores accidental async before_message_write handlers 0ms

 Test Files  1 passed (1)
      Tests  5 passed (5)
   Start at  00:14:24
   Duration  169ms (transform 84ms, setup 69ms, import 16ms, tests 21ms, environment 0ms)


 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.queue.test.ts > createDiscordMessageHandler queue behavior > dispatches configured source events separately inside one debounce window 5ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.queue.test.ts > createDiscordMessageHandler queue behavior > dispatches configured child-thread events separately using the authenticated parent 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.queue.test.ts > createDiscordMessageHandler queue behavior > keeps provider events separate when Discord channel identity cannot be resolved 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.queue.test.ts > createDiscordMessageHandler queue behavior > preserves ordinary Discord debounce aggregation 2ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.queue.test.ts > createDiscordMessageHandler queue behavior > starts accepted DM typing feedback before queued processing starts 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.queue.test.ts > createDiscordMessageHandler queue behavior > does not start accepted typing for an exclusively owned source 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.queue.test.ts > createDiscordMessageHandler queue behavior > keeps accepted DM dispatch running when accepted typing feedback fails 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.queue.test.ts > createDiscordMessageHandler queue behavior > does not start accepted typing feedback when preflight rejects the message 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.queue.test.ts > createDiscordMessageHandler queue behavior > does not start accepted typing feedback when typing mode is message 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.queue.test.ts > createDiscordMessageHandler queue behavior > does not start accepted typing feedback when typing mode is thinking 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.queue.test.ts > createDiscordMessageHandler queue behavior > does not start accepted typing feedback when typing mode is never 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.queue.test.ts > createDiscordMessageHandler queue behavior > does not start default accepted typing feedback for unmentioned guild replies 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.queue.test.ts > createDiscordMessageHandler queue behavior > starts accepted typing feedback for message-tool-only guild replies 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.queue.test.ts > createDiscordMessageHandler queue behavior > deduplicates accepted typing feedback while same-session runs are queued 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.queue.test.ts > createDiscordMessageHandler queue behavior > resets busy counters when the handler is created 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.queue.test.ts > createDiscordMessageHandler queue behavior > returns immediately and tracks busy status while queued runs execute 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.queue.test.ts > createDiscordMessageHandler queue behavior > drops duplicate inbound message deliveries before they reach preflight 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.queue.test.ts > createDiscordMessageHandler queue behavior > retries duplicate deliveries after an explicit retryable worker failure 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.queue.test.ts > createDiscordMessageHandler queue behavior > keeps replay committed after a non-retryable worker failure 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.queue.test.ts > createDiscordMessageHandler queue behavior > does not abort long queued runs with a Discord-owned channel timeout 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.queue.test.ts > createDiscordMessageHandler queue behavior > refreshes run activity while active runs are in progress 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.queue.test.ts > createDiscordMessageHandler queue behavior > stops status publishing after lifecycle abort 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.queue.test.ts > createDiscordMessageHandler queue behavior > stops status publishing after handler deactivation 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.queue.test.ts > createDiscordMessageHandler queue behavior > skips queued runs that have not started yet after deactivation 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.queue.test.ts > createDiscordMessageHandler queue behavior > preserves non-debounced message ordering by awaiting debouncer enqueue 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.queue.test.ts > createDiscordMessageHandler queue behavior > recovers queue progress after a run failure without leaving busy state stuck 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage reply runtime wiring > uses the host-owned narrow dispatch facade 10ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage ack reactions > drops bot-loop-suppressed messages before Discord side effects 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage ack reactions > skips ack reactions for group-mentions when mentions are not required 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage ack reactions > sends ack reactions for mention-gated guild messages when mentioned 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage ack reactions > uses preflight-resolved messageChannelId when message.channelId is missing 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage ack reactions > uses separate REST clients for feedback and reply delivery 2ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage ack reactions > reuses accepted typing feedback through reply dispatch 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage ack reactions > restarts stale carried typing feedback before dispatch 2ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage ack reactions > debounces intermediate phase reactions and jumps to done for short runs 2ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage ack reactions > marks automatic visible replies as failed when final Discord delivery fails 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage ack reactions > can bind status reactions to an explicitly tracked reaction target 2ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage ack reactions > resolves tracked reaction to targets like the Discord reaction action 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage ack reactions > shows stall emojis for long no-progress runs 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage ack reactions > applies status reaction emoji/timing overrides from config 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage ack reactions > falls back to plain ack when status reactions are disabled 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage ack reactions > shows compacting reaction during auto-compaction and resumes thinking 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage ack reactions > clears status reactions when dispatch aborts and removeAckAfterReply is enabled 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage ack reactions > removes the plain ack reaction when status reactions are disabled and removeAckAfterReply is enabled 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage session routing > prefers the resolved sender identity and falls back to the Discord author 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage session routing > carries preflight audio transcript into dispatch context and marks media transcribed 19ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage session routing > does not attach referenced reply media when reply context is hidden 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage session routing > does not inject the bot's previous message body when users reply to it 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage session routing > stores DM lastRoute with user target for direct-session continuity 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage session routing > pins Discord text DM main-route updates to the single configured DM owner 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage session routing > stores group lastRoute with channel target 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage session routing > marks explicit message-tool guild replies as message-tool-only and disables source streaming 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage session routing > sends the configured ack while suppressing automatic status reactions for always-on guild replies 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage session routing > honors explicit status reactions for always-on guild replies 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage session routing > suppresses Discord reactions for room events even when status reactions are explicit 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage session routing > records Discord room events in history while source replies are tool-only 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage session routing > clears Discord room event history after a visible action send succeeds 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage session routing > clears Discord group DM room event history after a visible action send succeeds 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage session routing > clears Discord room event history after a queued core send succeeds 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage session routing > uses PluralKit original ids for inbound dedupe while preserving the Discord message id 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage session routing > resolves guild source delivery from default, explicit, and room-event modes 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage session routing > prefers bound session keys and sets MessageThreadId for bound thread messages 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage session routing > passes Discord thread parent only for model inheritance when transcript inheritance is off 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage session routing > preserves the configured source parent when autoThread retargets dispatch 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage session routing > omits thread starter context when the effective thread session already exists 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > finalizes via preview edit when final fits one chunk 4ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > delivers a fresh message instead of a preview edit when the final reply resolves a mention alias 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > delivers a fresh message instead of a preview edit for a literal user mention in the final reply 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > still finalizes via preview edit when an unaliased handle stays plain text 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > still finalizes via preview edit for broadcast mentions like @everyone 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > still finalizes via preview edit when a targeted mention is mixed with @everyone 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > accepts streaming=true alias for partial preview mode 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > defaults unset Discord preview streaming to progress mode without drafting text-only turns 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > streams Discord tool progress by default when streaming is unset 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > does not update Discord progress drafts after final answer delivery 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > does not update Discord progress drafts while final answer delivery is pending 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > streams Discord tool progress for coding-profile message-tool-only guild replies 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > keeps Discord preview streaming off when explicitly disabled 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > falls back to standard send when final needs multiple chunks 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > uses transcript-backed final text when progress final text is truncated 2ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > clears partial drafts when fallback final delivery fails before completion 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > uses root discord maxLinesPerMessage for preview finalization when runtime config omits it 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > falls back to standard delivery for explicit reply-tag finals 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > does not flush draft previews for media finals before normal delivery 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > keeps the preview and sends media-only for TTS supplement finals 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > falls back with visible text when TTS supplement preview finalization fails 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > keeps already-delivered TTS supplement fallback audio-only 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > does not flush draft previews for error finals before normal delivery 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > drops later tool warning finals after preview final replies 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > drops earlier tool warning finals when recovered replies arrive 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > suppresses pure tool warning finals when no recovered reply is available 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > suppresses tool warning finals when the recovered reply fails to send 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > suppresses mutating tool warning finals after successful-looking replies 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > suppresses reasoning payload delivery to Discord 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > suppresses reasoning-tagged final payload delivery to Discord 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > delivers non-reasoning block payloads to Discord 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > streams block previews using draft chunking 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > keeps canonical block mode on the Discord draft preview path 2ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > keeps progress label visible when Discord tool progress lines are disabled 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > hides Discord commentary progress when commentary is unset 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > hides Discord commentary progress when commentary is false 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > shows opt-in Discord commentary progress independently from tool progress 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > keeps Discord progress drafts usable after the last commentary line becomes silent 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > does not update Discord commentary progress after final answer delivery starts 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > does not start Discord progress drafts for text-only accepted turns 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > keeps Discord progress drafts instead of delivering text-only interim blocks after work expands 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > drops later tool warning finals after progress preview final replies 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > uses raw tool-progress detail in Discord progress drafts 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > can hide raw command progress text in Discord progress drafts by config 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > keeps Discord progress lines below the configured label 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > skips empty apply_patch starts and renders the patch summary 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > shows reasoning text instead of a bare Reasoning progress line 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > accumulates reasoning deltas in Discord progress drafts 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > preserves raw reasoning content that starts with Thinking 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > preserves raw reasoning content that starts with Thinking colon 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > preserves raw reasoning content that starts with Reasoning colon 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > strips legacy Reasoning newline wrappers from progress snapshots 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > strips legacy Thinking ellipsis display wrappers from progress snapshots 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > preserves raw reasoning content that starts with a Thinking line 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > appends raw reasoning chunks that start with Thinking 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > appends raw reasoning chunks that start with Thinking ellipsis 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > appends raw reasoning chunks that start with Reasoning colon 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > keeps reasoning italics balanced when progress lines truncate 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > replaces reasoning snapshots instead of appending duplicates 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > keeps Discord progress lines across assistant boundaries 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > suppresses standalone Discord tool progress when partial preview lines are disabled 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > strips reply tags from preview partials 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > forces new preview messages on assistant boundaries in block mode 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > strips reasoning tags from partial stream updates 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > skips pure-reasoning partial updates without updating draft 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage deliver-lambda abort logging > emits logVerbose with formatDiscordReplySkip when deliver fires on a pre-aborted signal 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage Deliberation integration > intakes a configured Discord source through the production dispatch path 93523ms

 Test Files  2 passed (2)
      Tests  132 passed (132)
   Start at  00:14:26
   Duration  96.60s (transform 3.41s, setup 173ms, import 5.40s, tests 93.78s, environment 0ms)


 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

 ✓ |extension-slack| extensions/slack/src/monitor/message-handler.deliberation.test.ts > Slack deliberation owner path > claims configured root and child sources before Slack side effects 84140ms
 ✓ |extension-slack| extensions/slack/src/monitor/message-handler.deliberation.test.ts > Slack deliberation owner path > keeps disabled processing silent 53ms
 ✓ |extension-slack| extensions/slack/src/monitor/message-handler.deliberation.test.ts > Slack deliberation owner path > keeps unavailable KM silent 3ms
 ✓ |extension-slack| extensions/slack/src/monitor/message-handler.deliberation.test.ts > Slack deliberation owner path > keeps rejected intake silent 2ms
 ✓ |extension-slack| extensions/slack/src/monitor/message-handler.deliberation.test.ts > Slack deliberation owner path > retains ordinary Slack preparation outside configured sources 20ms

 Test Files  1 passed (1)
      Tests  5 passed (5)
   Start at  00:16:04
   Duration  88.10s (transform 2.26s, setup 13ms, import 3.78s, tests 84.22s, environment 0ms)

```

### Standard Error

```text
$ node scripts/test-projects.mjs src/plugins/hooks.sync-only.test.ts src/plugin-sdk/channel-inbound.test.ts extensions/discord/src/monitor/message-handler.queue.test.ts extensions/discord/src/monitor/message-handler.process.test.ts extensions/slack/src/monitor/message-handler.deliberation.test.ts src/auto-reply/reply/dispatch-from-config.test.ts -- --reporter=verbose
[test] starting test/vitest/vitest.plugin-sdk.config.ts
[test] starting test/vitest/vitest.auto-reply.config.ts
[test] starting test/vitest/vitest.plugins.config.ts
[test] starting test/vitest/vitest.extension-discord.config.ts
[vitest] still running with no output for 30000ms (test/vitest/vitest.extension-discord.config.ts).
[vitest] still running with no output for 60000ms (test/vitest/vitest.extension-discord.config.ts).
[vitest] still running with no output for 90000ms (test/vitest/vitest.extension-discord.config.ts).
[test] starting test/vitest/vitest.extension-slack.config.ts
[vitest] still running with no output for 30000ms (test/vitest/vitest.extension-slack.config.ts).
[vitest] still running with no output for 60000ms (test/vitest/vitest.extension-slack.config.ts).
[test] passed 5 Vitest shards in 199.90s
```
