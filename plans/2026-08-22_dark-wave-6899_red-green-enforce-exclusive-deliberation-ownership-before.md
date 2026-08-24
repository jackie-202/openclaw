# Plan 2026-08-22: Enforce exclusive deliberation ownership before channel side effects

_Status: DRAFT_

## Progress

- [x] Phase 0: Config + init
- [x] Phase 1: Research
- [x] Phase 2: Knowledge
- [x] Phase 3: Synthesis

## Analysis

### Codebase context

- `src/plugins/hooks.ts:1022-1052` returns the first separate policy without owner identity or ambiguity detection; targeted closed outcomes already exist at `src/plugins/hooks.ts:762-815`.
- `src/plugin-sdk/channel-inbound.ts:22-27` reduces policy to `allowDebounce`, dropping `dispatch: "exclusive"` before channel side effects.
- Discord resolves policy before debounce, but starts typing at `extensions/discord/src/monitor/message-handler.ts:221-229`, queues acknowledgement at `extensions/discord/src/monitor/message-handler.process.ts:412-419`, and can create an auto-thread through `extensions/discord/src/monitor/message-handler.context.ts:261-288` before late claim.
- Slack authenticates and classifies by `extensions/slack/src/monitor/message-handler/prepare.ts:1035-1067`, then starts acknowledgement and system-event side effects at `extensions/slack/src/monitor/message-handler/prepare.ts:1069-1137`; normal dispatch begins at `extensions/slack/src/monitor/message-handler/dispatch.ts:1632-1796`.
- Deliberation already authenticates provider/account/route/message/thread/sender and selects one indexed pipeline in `extensions/deliberation/src/route-match.ts:110-223`; `extensions/deliberation/src/intake.ts:64-154` carries immutable pipeline/target data and bounded diagnostics. Do not duplicate this policy in channels.
- Existing Discord loader-backed integration lives in `extensions/discord/src/monitor/message-handler.process.test.ts:574-809`; Slack lacks an equivalent real Deliberation owner-path integration.

### Relevant documentation

- `docs/proposals/proposal-20260820-203458-161e2c_per-source-deliberation-pipelines-with-source-default-delivery.md:61-89,113-135` requires unique source ownership, immutable targets, source silence, no fallback, and root/child coverage.
- `docs/plugins/hooks.md:127-136` documents `inbound_event_policy` and must describe attributed early exclusive ownership rather than broadcast intake.
- `plans/2026-08-22_warm-cove-4137_audit-openclaw-deliberation-remediation-and-rollout-safety.md:23-30` identifies ownership-before-side-effects as the rollout blocker.

### Knowledge base

- `learnings/architecture/quick-wave-9858-source-ownership-precedes-inbound-transforms.md`: decide from authenticated original facts before debounce, auto-thread, session retargeting, and command shortcuts; prove the real channel path.
- `learnings/architecture/2026-07-28_residue-audits-require-activation-proof.md`: verify registration, caller, callee, and runtime activation rather than isolated symbols.
- Recall used deterministic local fallback because QMD collection `openclaw-fork-learnings` was absent; the other returned auto-extracted files contained no additional actionable rules.

## Available Skills

- `tdd`: capture authentic focused RED before production edits and GREEN after the fix.
- `openclaw-testing`: select focused channel/plugin commands and the appropriate broad changed gate.
- `autoreview`: mandatory fresh pre-handoff review until no actionable findings remain.
- `acceptance`: record the caller-owned canonical Test Gate only when its run manifest is supplied; do not relabel local output.
- `save-learning`: run last after implementation and verification.

## Solution

Represent host policy as a closed `ordinary | separate | exclusive(ownerPluginId) | ambiguous` decision. Re-evaluate it from each channel's authenticated preflight facts, then run only the attributed owner's `inbound_claim` before transport feedback; every exclusive or ambiguous outcome terminates the ordinary channel path. Keep Deliberation route authentication, pipeline lookup, immutable target derivation, late `before_dispatch`, and nonexclusive broadcast claims unchanged.

## Implementation

1. Invoke `skill:tdd`. Add all focused owner-path tests before production edits, then capture one authentic RED command in `plans/checkpoints/dark-wave-6899.red-green-proof.md`. Require assertion-level failures showing a real acknowledgement, typing, auto-thread, abort, dispatch, or fallback call; import/setup failures are invalid RED.
2. In `src/plugins/hooks.ts`, scan all synchronous `inbound_event_policy` handlers. Attribute one exclusive result to its `pluginId`; return `ambiguous` for multiple exclusive plugins; preserve `separate` fail-safe behavior for async/error policies. Do not use priority to resolve an ownership conflict.
3. In `src/plugin-sdk/channel-inbound.ts`, preserve the closed policy decision and add one generic targeted-claim helper backed by `runInboundClaimForPluginOutcome`. Return a terminal fail-closed result for ambiguous ownership and for every exclusive outcome (`handled`, `declined`, missing plugin/handler, timeout/error); log only bounded owner/reason metadata.
4. In Discord, keep the pre-debounce policy check only as an aggregation guard, then recompute ownership from `DiscordMessagePreflightContext` after allowlist/sender/thread/event-kind authentication. Carry the decision into processing, suppress prestarted typing for terminal ownership, and run targeted claim before `queueInitialDiscordAckReaction`, process-context construction, auto-thread creation, shared dispatch, and fast abort. Build claim facts from original `messageChannelId`, authenticated `threadParentId`, message ID, sender, and preflight content; never from an auto-threaded delivery target.
5. In Slack, carry the pre-debounce policy hint into `prepareSlackMessage`, recompute ownership after route/sender/thread/content authorization and `inboundEventKind` classification, and claim before `ackReactionPromise` and `enqueueSystemEvent`. Return a distinct terminal prepare outcome so `dispatchPreparedSlackMessage`, status/typing setup, last-route mutation, streaming, and fallback delivery cannot run.
6. Keep `extensions/deliberation/src/route-match.ts` and `intake.ts` canonical. Extend their tests only if owner-path integration exposes a missing assertion; do not add channel-specific Deliberation logic, change pipeline selection, alter KM wire data, activate config, or broaden allowlists.
7. Update `docs/plugins/hooks.md` after `pnpm docs:list`: document attributed exclusive ownership, ambiguity fail-closed behavior, targeted pre-side-effect claim, and the distinction from aggregation-only `separate`.
8. Capture GREEN with the exact RED command, then run the focused host/SDK, Deliberation, Discord, Slack, and dispatch regression groups below. Run `pnpm changed:lanes --json`, `pnpm check:changed`, `pnpm build`, and targeted extension lint. Use `skill:openclaw-testing` to move broad gates to Testbox/Crabbox if needed and record provider/run ID.
9. Run fresh `skill:autoreview` until no actionable findings remain. Submit the registered `cd ~/Projects/openclaw-fork && npm test` command to the caller-owned canonical Test Gate and record its non-`not-run` reference; local output is not a substitute. Run `skill:save-learning` last.

## Files to Modify

| File                                                                                                                    | Change                                                                                                    |
| ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `src/plugins/hooks.ts`, `src/plugins/hook-types.ts`                                                                     | Attribute exclusive policy, detect ambiguity, expose a closed host decision                               |
| `src/plugins/hooks.sync-only.test.ts`                                                                                   | Prove one owner, multiple-owner rejection, and async/error separation                                     |
| `src/plugin-sdk/channel-inbound.ts`, `src/plugin-sdk/channel-inbound.test.ts`                                           | Preserve policy mode/owner and exercise targeted terminal claim outcomes                                  |
| `extensions/discord/src/monitor/message-handler.ts`, `message-handler.preflight.types.ts`, `message-handler.process.ts` | Carry authenticated ownership, suppress typing, and claim before ack/auto-thread/dispatch                 |
| `extensions/discord/src/monitor/message-handler.queue.test.ts`, `message-handler.process.test.ts`                       | Add loader-backed root/child and side-effect RED/GREEN coverage while retaining ordinary-route assertions |
| `extensions/slack/src/monitor/message-handler.ts`, `message-handler/prepare.ts`, `message-handler/types.ts`             | Carry/recheck ownership and terminate before acknowledgement or dispatch setup                            |
| `extensions/slack/src/monitor/message-handler.deliberation.test.ts`                                                     | Add loader-backed root/child positive, failure, and ordinary-route integration coverage                   |
| `src/auto-reply/reply/dispatch-from-config.test.ts`                                                                     | Assert an exclusive source never invokes fast-abort resolution; retain late defense tests                 |
| `docs/plugins/hooks.md`                                                                                                 | Align public hook semantics with attributed early exclusive ownership                                     |
| `plans/checkpoints/dark-wave-6899.red-green-proof.md`                                                                   | Tool-generated authentic RED/GREEN evidence                                                               |

## TDD

Implementace TDD cyklu dle skill:tdd.

**Primary test files:** `extensions/discord/src/monitor/message-handler.process.test.ts`, `extensions/discord/src/monitor/message-handler.queue.test.ts`, `extensions/slack/src/monitor/message-handler.deliberation.test.ts`, `src/plugins/hooks.sync-only.test.ts`, `src/plugin-sdk/channel-inbound.test.ts`  
**Framework:** Vitest through the repository `pnpm test` wrapper  
**Edit hint:** Extend the existing loader-backed Discord helper at `extensions/discord/src/monitor/message-handler.process.test.ts:574`; add the Slack file only because no real owner-path integration exists.

Initial executable RED assertion, using the existing real imports and fixtures in `message-handler.process.test.ts`:

```ts
// Existing imports used by this test:
import {
  loadOpenClawPluginsForTest,
  setBundledPluginsDirOverrideForTest,
} from "openclaw/plugin-sdk/plugin-test-runtime";
import { expect } from "vitest";

// Add immediately after the first configured-source run in
// runDeliberationIntegrationTest(). The current path queues the ordinary ack.
await runProcessDiscordMessage(ctx);
expect(sendMocks.reactMessageDiscord).not.toHaveBeenCalled(); // RED: currently called pre-claim
expect(typingMocks.sendTyping).not.toHaveBeenCalled();
expect(dispatchInboundMessage).not.toHaveBeenCalled();
expect(deliverDiscordReply).not.toHaveBeenCalled();
```

Add the complete matrix before capturing RED:

| Test                                     | RED                                                                | GREEN                                                                                   |
| ---------------------------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| Host one/two exclusive plugins           | Owner ID absent or first plugin silently wins                      | One owner is attributed; two owners return terminal ambiguity and invoke neither claim  |
| Discord root and authenticated child     | Ack/typing can occur before late claim                             | One targeted intake; zero ordinary feedback, thread, dispatch, abort, or fallback calls |
| Discord disabled, KM 503, intake 4xx     | At least ack/typing/auto-thread occurs despite late silence        | Silent terminal result with one bounded diagnostic and no ordinary side effect          |
| Discord `/stop` with auto-thread enabled | Abort resolver or thread creation is reachable                     | Neither abort nor thread creation is invoked                                            |
| Slack root and child                     | `reactSlackMessage`/system event can occur before claim            | One targeted intake and zero ack/status/typing/dispatch/stream/fallback calls           |
| Slack disabled, KM unavailable/rejected  | Ordinary preparation side effects still occur                      | Silent terminal result with bounded diagnostics                                         |
| Ordinary Discord/Slack routes            | Existing debounce, typing, ack, dispatch behavior passes unchanged | Same assertions remain green                                                            |

Use the same command for RED and GREEN:

```bash
TASK_ID=dark-wave-6899 python3 "$HOME/.config/opencode/skills/tdd/scripts/proof-capture.py" red -- pnpm test src/plugins/hooks.sync-only.test.ts src/plugin-sdk/channel-inbound.test.ts extensions/discord/src/monitor/message-handler.queue.test.ts extensions/discord/src/monitor/message-handler.process.test.ts extensions/slack/src/monitor/message-handler.deliberation.test.ts src/auto-reply/reply/dispatch-from-config.test.ts -- --reporter=verbose
```

Replace `red` with `green` without changing the trailing command after implementation. Verify both proof sections exist before broader checks.

Focused regression commands:

```bash
pnpm test extensions/deliberation/src/config.test.ts extensions/deliberation/src/route-match.test.ts extensions/deliberation/src/hooks.test.ts extensions/deliberation/src/plugin.test.ts -- --reporter=verbose
pnpm test extensions/discord/src/monitor/message-handler.queue.test.ts extensions/discord/src/monitor/message-handler.process.test.ts extensions/discord/src/monitor/threading.auto-thread.test.ts -- --reporter=verbose
pnpm test extensions/slack/src/monitor/message-handler.test.ts extensions/slack/src/monitor/message-handler/prepare.test.ts extensions/slack/src/monitor/message-handler/dispatch.preview-fallback.test.ts extensions/slack/src/monitor/message-handler.deliberation.test.ts -- --reporter=verbose
pnpm lint:extensions -- extensions/deliberation extensions/discord extensions/slack
pnpm build
```

## Dependencies

- Existing Deliberation loader fixture and local loopback KM server only; no live credentials or provider sends.
- Current canonical `pipelines[]`, `pipelineBySourceKey`, route authentication, and KM wire contract remain unchanged.
- Caller/monitor supplies the canonical Test Gate workflow/reference; record unavailable or `not-run` as a blocker.
