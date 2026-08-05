# TDD Red-Green Proof: bright-mist-1370

<!-- proof-capture-metadata: {"version":1,"task_id":"bright-mist-1370","command":["pnpm","test","extensions/discord/src/monitor/message-handler.process.test.ts","--","--reporter=verbose"],"command_sha256":"3268d9992f17669824fbfbe2e4db3a610d395872e6d06df9820c9785ded213d0"} -->

## RED Phase

- **Timestamp:** 2026-08-02T14:03:52.186127+00:00
- **Test command:** `pnpm test extensions/discord/src/monitor/message-handler.process.test.ts -- --reporter=verbose`
- **Exit code:** 1

### Standard Output

```text

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

 × |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage reply runtime wiring > uses the host-owned narrow dispatch facade 16ms
   → expected "vi.fn()" to be called 1 times, but got 0 times
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
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage ack reactions > applies status reaction emoji/timing overrides from config 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage ack reactions > falls back to plain ack when status reactions are disabled 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage ack reactions > shows compacting reaction during auto-compaction and resumes thinking 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage ack reactions > clears status reactions when dispatch aborts and removeAckAfterReply is enabled 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage ack reactions > removes the plain ack reaction when status reactions are disabled and removeAckAfterReply is enabled 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage session routing > carries preflight audio transcript into dispatch context and marks media transcribed 25ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage session routing > does not attach referenced reply media when reply context is hidden 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage session routing > does not inject the bot's previous message body when users reply to it 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage session routing > stores DM lastRoute with user target for direct-session continuity 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage session routing > pins Discord text DM main-route updates to the single configured DM owner 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage session routing > stores group lastRoute with channel target 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage session routing > marks explicit message-tool guild replies as message-tool-only and disables source streaming 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage session routing > sends the configured ack while suppressing automatic status reactions for always-on guild replies 0ms
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
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > suppresses reasoning payload delivery to Discord 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > suppresses reasoning-tagged final payload delivery to Discord 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > delivers non-reasoning block payloads to Discord 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > streams block previews using draft chunking 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > keeps canonical block mode on the Discord draft preview path 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > keeps progress label visible when Discord tool progress lines are disabled 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > hides Discord commentary progress when commentary is unset 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > hides Discord commentary progress when commentary is false 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > shows opt-in Discord commentary progress independently from tool progress 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > keeps Discord progress drafts usable after the last commentary line becomes silent 4ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > does not update Discord commentary progress after final answer delivery starts 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > does not start Discord progress drafts for text-only accepted turns 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > keeps Discord progress drafts instead of delivering text-only interim blocks after work expands 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > drops later tool warning finals after progress preview final replies 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > uses raw tool-progress detail in Discord progress drafts 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > can hide raw command progress text in Discord progress drafts by config 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > keeps Discord progress lines below the configured label 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > skips empty apply_patch starts and renders the patch summary 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > shows reasoning text instead of a bare Reasoning progress line 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > accumulates reasoning deltas in Discord progress drafts 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > preserves raw reasoning content that starts with Thinking 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > preserves raw reasoning content that starts with Thinking colon 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > preserves raw reasoning content that starts with Reasoning colon 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > strips legacy Reasoning newline wrappers from progress snapshots 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > strips legacy Thinking ellipsis display wrappers from progress snapshots 0ms
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
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage deliver-lambda abort logging > emits logVerbose with formatDiscordReplySkip when deliver fires on a pre-aborted signal 0ms

 Test Files  1 failed (1)
      Tests  1 failed | 102 passed (103)
   Start at  16:03:44
   Duration  7.55s (transform 5.86s, setup 181ms, import 6.72s, tests 566ms, environment 0ms)

[ELIFECYCLE] Test failed. See above for more details.
```

### Standard Error

```text
$ node scripts/test-projects.mjs extensions/discord/src/monitor/message-handler.process.test.ts -- --reporter=verbose
[test] starting test/vitest/vitest.extension-discord.config.ts

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage reply runtime wiring > uses the host-owned narrow dispatch facade
AssertionError: expected "vi.fn()" to be called 1 times, but got 0 times
 ❯ extensions/discord/src/monitor/message-handler.process.test.ts:543:46
    541|     await runProcessDiscordMessage(await createBaseContext());
    542|
    543|     expect(replyRuntimeMocks.narrowDispatch).toHaveBeenCalledTimes(1);
       |                                              ^
    544|     expect(replyRuntimeMocks.broadDispatch).not.toHaveBeenCalled();
    545|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯

[test] failed 1 Vitest shard in 10.32s
```

## GREEN Phase

- **Timestamp:** 2026-08-02T14:04:16.784710+00:00
- **Test command:** `pnpm test extensions/discord/src/monitor/message-handler.process.test.ts -- --reporter=verbose`
- **Exit code:** 0

### Standard Output

```text

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage reply runtime wiring > uses the host-owned narrow dispatch facade 11ms
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
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage ack reactions > applies status reaction emoji/timing overrides from config 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage ack reactions > falls back to plain ack when status reactions are disabled 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage ack reactions > shows compacting reaction during auto-compaction and resumes thinking 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage ack reactions > clears status reactions when dispatch aborts and removeAckAfterReply is enabled 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage ack reactions > removes the plain ack reaction when status reactions are disabled and removeAckAfterReply is enabled 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage session routing > carries preflight audio transcript into dispatch context and marks media transcribed 21ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage session routing > does not attach referenced reply media when reply context is hidden 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage session routing > does not inject the bot's previous message body when users reply to it 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage session routing > stores DM lastRoute with user target for direct-session continuity 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage session routing > pins Discord text DM main-route updates to the single configured DM owner 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage session routing > stores group lastRoute with channel target 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage session routing > marks explicit message-tool guild replies as message-tool-only and disables source streaming 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage session routing > sends the configured ack while suppressing automatic status reactions for always-on guild replies 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage session routing > honors explicit status reactions for always-on guild replies 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage session routing > suppresses Discord reactions for room events even when status reactions are explicit 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage session routing > records Discord room events in history while source replies are tool-only 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage session routing > clears Discord room event history after a visible action send succeeds 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage session routing > clears Discord group DM room event history after a visible action send succeeds 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage session routing > clears Discord room event history after a queued core send succeeds 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage session routing > uses PluralKit original ids for inbound dedupe while preserving the Discord message id 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage session routing > resolves guild source delivery from default, explicit, and room-event modes 2ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage session routing > prefers bound session keys and sets MessageThreadId for bound thread messages 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage session routing > passes Discord thread parent only for model inheritance when transcript inheritance is off 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage session routing > omits thread starter context when the effective thread session already exists 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > finalizes via preview edit when final fits one chunk 4ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > delivers a fresh message instead of a preview edit when the final reply resolves a mention alias 2ms
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
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > keeps canonical block mode on the Discord draft preview path 1ms
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
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > can hide raw command progress text in Discord progress drafts by config 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > keeps Discord progress lines below the configured label 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > skips empty apply_patch starts and renders the patch summary 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > shows reasoning text instead of a bare Reasoning progress line 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > accumulates reasoning deltas in Discord progress drafts 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > preserves raw reasoning content that starts with Thinking 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > preserves raw reasoning content that starts with Thinking colon 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > preserves raw reasoning content that starts with Reasoning colon 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > strips legacy Reasoning newline wrappers from progress snapshots 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > strips legacy Thinking ellipsis display wrappers from progress snapshots 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > preserves raw reasoning content that starts with a Thinking line 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > appends raw reasoning chunks that start with Thinking 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > appends raw reasoning chunks that start with Thinking ellipsis 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > appends raw reasoning chunks that start with Reasoning colon 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > keeps reasoning italics balanced when progress lines truncate 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > replaces reasoning snapshots instead of appending duplicates 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > keeps Discord progress lines across assistant boundaries 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > suppresses standalone Discord tool progress when partial preview lines are disabled 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > strips reply tags from preview partials 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > forces new preview messages on assistant boundaries in block mode 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > strips reasoning tags from partial stream updates 1ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage draft streaming > skips pure-reasoning partial updates without updating draft 0ms
 ✓ |extension-discord| extensions/discord/src/monitor/message-handler.process.test.ts > processDiscordMessage deliver-lambda abort logging > emits logVerbose with formatDiscordReplySkip when deliver fires on a pre-aborted signal 1ms

 Test Files  1 passed (1)
      Tests  103 passed (103)
   Start at  16:04:14
   Duration  2.61s (transform 1.28s, setup 67ms, import 2.20s, tests 283ms, environment 0ms)

```

### Standard Error

```text
$ node scripts/test-projects.mjs extensions/discord/src/monitor/message-handler.process.test.ts -- --reporter=verbose
[test] starting test/vitest/vitest.extension-discord.config.ts
[test] passed 1 Vitest shard in 5.26s
```
