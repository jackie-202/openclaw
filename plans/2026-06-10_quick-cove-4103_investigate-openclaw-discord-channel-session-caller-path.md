# Plan 2026-06-10: Investigate Discord Channel Session Caller Path

Diagnostic-only investigation of Discord inbound turns and Gateway `sessions.send` dispatch.

## Problem

Identify whether the production caller paths for Discord channel messages and Mission Control Ask Jackie `sessions.send` turns run through embedded-runner incomplete-turn policy or raw `packages/agent-core` loop semantics.

## Analysis

### Codebase Context

- Start Discord inbound trace at `extensions/discord/src/monitor/listeners.ts:36` (`DiscordMessageListener.handle`) and `extensions/discord/src/monitor/message-handler.ts:123` (`createDiscordMessageHandler`).
- Continue Discord trace through `extensions/discord/src/monitor/message-run-queue.ts:96` (`createDiscordMessageRunQueue`) and `extensions/discord/src/monitor/message-handler.process.ts:943` (`dispatchChannelInboundReply`).
- Continue shared channel trace through `src/channels/turn/kernel.ts:363` (`dispatchAssembledChannelTurn`) and `src/channels/turn/kernel.ts:381` (`dispatchReplyWithBufferedBlockDispatcher`).
- Continue shared auto-reply trace through `src/auto-reply/dispatch.ts:476` (`dispatchInboundMessage`) and `src/auto-reply/reply/get-reply-run.ts` / `src/auto-reply/reply/followup-runner.ts:961` (`runEmbeddedAgent`).
- Start `sessions.send` trace at `src/gateway/server-methods/sessions.ts:1882`, then `handleSessionSend` at `src/gateway/server-methods/sessions.ts:756`, then `chatHandlers["chat.send"]` at `src/gateway/server-methods/sessions.ts:858`.
- Continue Gateway dispatch through `src/gateway/server-methods/chat.ts:2949` (`chat.send`) and `src/gateway/server-methods/chat.ts:3760` (`dispatchInboundMessage`).
- Compare terminal behavior against `src/agents/embedded-agent-runner/run.ts:496` (`runEmbeddedAgent`), `src/agents/embedded-agent-runner/run.ts:3271` incomplete-turn handling, and `packages/agent-core/src/agent-loop.ts:163` / `packages/agent-core/src/agent-loop.ts:389` raw loop finalization.

### Relevant Documentation

- Read scoped rules before verdict: `extensions/AGENTS.md`, `src/channels/AGENTS.md`, `src/gateway/AGENTS.md`, `src/gateway/server-methods/AGENTS.md`, `src/agents/AGENTS.md`, `src/agents/embedded-agent-runner/run/AGENTS.md`.
- Keep plugin/core boundary intact: Discord plugin code must not import core internals; Gateway hot paths must avoid broad bundled plugin runtime loads.

### Knowledge Base

- `learnings/architecture/agent-loop-policy-vs-prompt-overlays.md`: separate prompt guidance, raw loop semantics, and product runner policy; do not conflate Gateway `sessions.send` with model tool `sessions_send`.
- QMD collection `openclaw-fork-learnings` was unavailable; grep found the relevant learning above.

## Available Skills

- `compound-plan`: already used for this plan.
- `recall-knowledge`: used for prior investigation learning.
- `openclaw-testing`: use only after investigation if proposing focused tests.
- `code-review` or `autoreview`: use only if the follow-up task becomes implementation.
- `save-learning`: mandatory final action after this planning task.

## Solutions

- Reproduce: inspect existing focused tests and logs for Discord `#tech-debt` / Ask Jackie shape without live config mutation.
- Trace: build two call-chain maps with exact file/function/line references.
- Diagnose: mark each path as embedded-runner policy, raw `agent-core`, CLI harness, or blocked/unknown with evidence.
- Write report: produce a concise investigation note under `plans/investigations/`.

## Implementation

### Pre-Investigation Checklist

- [ ] Do not change source code, config, credentials, or live channel state.
- [ ] Do not run Git commands; derive branch/SHA by reading `.git/HEAD` and its referenced ref file, or record the no-git constraint if unavailable.
- [ ] Do not repeat broad prompt-overlay comparison from `quick-wave-8890`.
- [ ] Treat `sessions.send` and model tool `sessions_send` as separate contracts.

### Investigation Steps

1. Reproduce: read nearest tests for Discord inbound and Gateway `sessions.send`, especially `extensions/discord/src/*inbound*.test.ts`, `extensions/discord/src/*message*.test.ts`, `src/gateway/server.chat.gateway-server-chat.test.ts`, `src/gateway/server-methods/sessions.send-followup-status.test.ts`, and `src/agents/embedded-agent-runner/run.incomplete-turn.test.ts`.
2. Reproduce: identify whether any existing test simulates promise-only final assistant text for the exact Discord or `sessions.send` path; record exact test names or the missing-test gap.
3. Trace Discord inbound: follow `DiscordMessageListener.handle` -> `createDiscordMessageHandler` -> debounce/preflight -> `createDiscordMessageRunQueue` -> `processDiscordMessage` -> `dispatchChannelInboundReply` -> channel turn kernel -> `dispatchInboundMessage` -> reply runner -> `runEmbeddedAgent` or alternate runtime branch.
4. Trace Gateway `sessions.send`: follow `sessionsHandlers["sessions.send"]` -> `handleSessionSend` -> `chatHandlers["chat.send"]` -> `chat.send` context construction -> `dispatchInboundMessage` -> reply runner -> `runEmbeddedAgent`, CLI harness, or raw agent-core.
5. Diagnose embedded-runner coverage: for each path, cite where `runEmbeddedAgent` is called, where incomplete-turn policy runs, and whether any provider/runtime branch bypasses it.
6. Diagnose raw `agent-core` exposure: inspect every direct `runAgentLoop`, `runAgentLoopContinue`, `new Agent`, or package `agent-core` caller reachable from the two traced paths; state whether raw final text without tool evidence can exit as success.
7. Diagnose final Discord delivery contract: inspect `chat.send` `deliver` handling and Discord session delivery context; state whether MC must explicitly post final result or whether OpenClaw channel session delivery owns it. Do not assume `sessions.send` accepts `deliver`.
8. If a bypass exists, identify the smallest safe fix location by owner boundary: prefer shared auto-reply/embedded-runner policy seam over Discord plugin special-case; avoid adding Gateway plugin runtime loads.
9. If no bypass exists, identify remaining likely cause with evidence: CLI runtime branch, delivery suppression, missing `deliver` route, session targeting, or stale observed behavior.
10. Before the final investigation report step, prefer the local path helper when it exists: `python3 scripts/investigation-path.py --task-id quick-cove-4103 --project . --touch`.
11. If `scripts/investigation-path.py` is missing, do not block report writing: create `plans/investigations/` if needed, derive a lowercase ASCII slug from the task title, and write `plans/investigations/quick-cove-4103_investigate-openclaw-discord-channel-session-caller-path.md`.
12. Write the final report under `plans/investigations/` with Discord call-chain map, Gateway `sessions.send` call-chain map, embedded-runner vs raw agent-core verdict, branch/SHA inspected, tests covering the path, minimal missing test, and minimal fix task if needed.

## Files to Modify

| File                                         | Change                           |
| -------------------------------------------- | -------------------------------- |
| `plans/investigations/<canonical-report>.md` | Final investigation report only. |

## TDD: skip

Diagnostic planning/report task only; no code behavior is implemented in this task.

## Dependencies

- Local source checkout with readable `.git/HEAD` metadata.
- Existing tests are used as evidence; add tests only in a separate implementation task unless investigation finds a trivially local covered fix.

---

_Created: 2026-06-10_
_Status: DRAFT_
