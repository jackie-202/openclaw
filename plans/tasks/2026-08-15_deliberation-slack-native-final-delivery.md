---
title: "Deliberation Slack-native final delivery adapter"
type: implementation
proposal_id: proposal-20260814-203937-cbe1dc
proposal_section: slack-delivery
---

# Deliberation Slack-native final delivery adapter

Add Slack as a final-delivery transport behind the same KM reservation/invocation/completion lifecycle used by Discord. Complete symmetric Slack → Slack and Discord → Slack implementation, but do not enable Slack-native delivery in live rollout configuration.

## Overall proposal goal

Proposal `proposal-20260814-203937-cbe1dc` makes Deliberation v2 provider-independent while retaining Discord parity, immutable KM-owned delivery state, fail-closed validation, provenance, deduplication, bounded history, and exactly one real provider call. The initial pilot remains Slack source → Discord `test-deliberation`; this task lands dormant Slack-native capability for later controlled activation.

Read the proposal before planning:
`/Users/michal/.openclaw/workspace/docs/proposals/proposal-20260814-203937-cbe1dc_slack-support-for-deliberation-v2.md`

## Scope boundary

Work only in `/Users/michal/Projects/openclaw-fork`. Do not inspect or modify `km-system` or live OpenClaw configuration. Reuse repository-local Slack outbound seams and seq 3–4 stable contracts.

Primary paths:

- `extensions/deliberation/src/final-adapter.ts`
- `extensions/deliberation/src/final-adapter.test.ts`
- `extensions/deliberation/src/plugin.test.ts`
- `extensions/deliberation/src/sole-send.test.ts`
- `extensions/deliberation/src/km-client.ts` and test only if the provider adapter interface needs a narrow generalization
- `extensions/slack/src/send.ts`
- `extensions/slack/src/send.runtime.ts`
- `extensions/slack/src/send.blocks.test.ts` or a smaller existing Slack send test file
- a new Deliberation-owned Slack provider adapter/test file if that keeps dependency direction clearer than importing monitor internals

## Required behavior

1. Dispatch final delivery by the pinned destination `provider`. Support `discord` and `slack` explicitly; unsupported providers fail before durable invocation or provider call.
2. Adapt the canonical destination fields to Slack's outbound API: explicit `accountId`, `channelId`, and `threadId`. Preserve `thread_ts` exactly and send into that thread; never substitute a child event timestamp or infer account.
3. Reuse the established repository-local Slack send helper/client and account resolution. Do not add an ad-hoc raw Slack HTTP client.
4. Keep the order `KM reserve → KM invoke → exactly one selected provider send → KM complete`. Do not retry the real provider call inside Deliberation after invocation.
5. Return bounded provider receipt/message IDs and bind them to KM completion. Preserve destination target equality across ready/reservation/invocation/completion.
6. Classify Slack failures deterministically into the existing KM classes. Rate limit and transient transport/timeouts may be retry-class evidence according to the existing contract; missing scope, not-in-channel, inaccessible/deleted target, authentication, and provider rejection are terminal classes. Never expose secrets or unbounded provider payloads in evidence.
7. Preserve Discord adapter behavior unchanged and prove no cross-provider double-send: Slack destination calls only Slack, Discord destination calls only Discord.
8. Keep Slack-native delivery rollout-disabled. Generic implementation may support configured routes, but this task must not add/modify a live route or feature activation.
9. Add focused tests for Slack → Slack, Discord → Slack, same channel with different thread, explicit account selection, receipt binding, failure classes, target conflict, unsupported provider, and sole-send ownership.

## Characterization-first guardrail

Before adding provider dispatch, pin the seq 4 Discord path and Slack send-helper thread/account semantics. Generalization must not change Discord call order or Slack's existing outbound behavior.

## DO NOT

- Do not enable Slack-native delivery in live config or change pilot routing.
- Do not send real Slack/Discord messages.
- Do not modify KM or bypass its durable lifecycle.
- Do not import Slack monitor message-handler internals when a stable outbound helper exists.
- Do not use source provider to select the destination adapter.
- Do not infer account, channel, or thread; do not default an invalid explicit target.
- Do not retry a real provider call in a way that can duplicate delivery.
- Do not broaden Slack scopes or permissions as part of this task.
- Do not include git operations.

## Acceptance criteria

- Canonical Slack destinations send once through the established Slack transport to exact account/channel/thread.
- Both Slack → Slack and Discord → Slack work through destination-based dispatch.
- Discord targets still use only Discord and all seq 4 regressions pass.
- Provider receipts and bounded failure evidence are completed through KM without target drift.
- Unsupported/malformed/conflicting destinations produce no provider call.
- No live config enables Slack-native delivery.

## Verification

```bash
pnpm exec vitest run \
  extensions/deliberation/src/final-adapter.test.ts \
  extensions/deliberation/src/plugin.test.ts \
  extensions/deliberation/src/sole-send.test.ts \
  extensions/slack/src/send.blocks.test.ts
pnpm exec prettier --check extensions/deliberation/src
```

Run the smallest existing typecheck that covers Deliberation and the touched Slack files and record it.

Canonical registration command (operator only):

```bash
python3 ~/.openclaw/workspace/km-system/scripts/task.py create openclaw-fork /Users/michal/Projects/openclaw-fork/plans/tasks/2026-08-15_deliberation-slack-native-final-delivery.md --paused --batch deliberation-slack-support-2026-08-15 --batch-seq 5 --proposal proposal-20260814-203937-cbe1dc --section slack-delivery
```

## Context

**Proposal:** `proposal-20260814-203937-cbe1dc` — Slack support for Deliberation v2
**Proposal file:** `/Users/michal/.openclaw/workspace/docs/proposals/proposal-20260814-203937-cbe1dc_slack-support-for-deliberation-v2.md`
**Batch:** `deliberation-slack-support-2026-08-15` (seq 5 z 6) — provider-independent Slack support with a Discord-targeted pilot and dormant Slack-native transport.
**Section:** `slack-delivery`

### Co stavíme jako celek

Slack gains source and destination capability without weakening the KM delivery authority or Discord behavior. Rollout remains deliberately asymmetric: first prove Slack → Discord, while the native Slack adapter lands disabled for a later activation decision.

### Můj task v sekvenci (seq 5)

**Co dělám:** Add destination-selected Slack final transport with exact thread/account routing and provider evidence.

**Závisí na:** Seq 3 structured KM destination; seq 4 destination-selected Discord pilot path.

**Co následuje:** Seq 6 audits and tests cross-provider behavior, regressions, replay fencing, and pilot readiness.

### Required reading (PŘED začátkem):

1. Proposal `Vision`, `Decisions`, `Implementation decomposition and ownership`, `Slice 5`, and `Rollout`.
2. Section marker `<!-- section:slack-delivery -->`.
3. Decisions: destination-provider dispatch; `thread_ts ?? message.ts`; explicit account; KM sole-send lifecycle; native Slack delivery disabled for pilot.
4. Prior seq task files/final evidence available in this repository and pipeline artifacts.
