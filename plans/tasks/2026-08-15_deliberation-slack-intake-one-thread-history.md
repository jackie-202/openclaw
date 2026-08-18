---
title: "Deliberation Slack intake and one-thread history"
type: implementation
proposal_id: proposal-20260814-203937-cbe1dc
proposal_section: openclaw-contracts
---

# Deliberation Slack intake and one-thread history

Deliver the first vertical Slack slice in the Deliberation extension: an allowlisted Slack root message or reply is admitted with canonical provider/account/channel identity, preserves its child message identity separately from its normalized thread identity, and supplies exactly that conversation thread through the existing bounded `deliberation.history.read` boundary.

## Scope boundary

Work only in `/Users/michal/Projects/openclaw-fork`. Do not inspect or modify `km-system` or other repositories. The proposal is the stable cross-repository contract; if a KM-side requirement is unclear, record it in the final note rather than crossing the repository boundary.

Primary implementation and test paths:

- `extensions/deliberation/src/config.ts`
- `extensions/deliberation/src/config.test.ts`
- `extensions/deliberation/src/route-match.ts`
- `extensions/deliberation/src/route-match.test.ts`
- `extensions/deliberation/src/source-identity.ts`
- `extensions/deliberation/src/source-identity.test.ts`
- `extensions/deliberation/src/history-read.ts`
- `extensions/deliberation/src/history-read.test.ts`
- `extensions/deliberation/src/intake.ts`
- `extensions/deliberation/src/hooks.test.ts`
- `extensions/deliberation/src/contract.test.ts`
- Slack provider seams under `extensions/slack/src/monitor/` only where a repository-local SDK/helper must be reused or exposed; preserve the existing Slack monitor behavior and keep changes narrow.

Relevant Slack behavior already exists around:

- `extensions/slack/src/monitor/message-handler/prepare.ts`
- `extensions/slack/src/monitor/message-handler/prepare-dm-history.ts`
- `extensions/slack/src/monitor/message-handler/preview-finalize.ts`

## Required behavior

1. Generalize Deliberation route/config contracts from Discord-only to the explicit supported provider set `discord | slack`. Keep `accountId` and channel target mandatory and retain canonical identity validation, duplicate detection, processing-source separation, and fail-closed strict schemas.
2. Preserve Discord admission semantics and tests unchanged except for the minimum provider-neutral refactor.
3. Admit Slack only for an explicitly configured source account/channel and established inbound user-message/request kinds. Agreement checks across duplicated provider/account/channel/message/sender fields remain fail closed.
4. Use canonical Slack message identity as `providerEventId`: `message.ts`, with the established `event_ts` fallback only when message timestamp is absent. Never replace a child reply identity with `thread_ts`.
5. Normalize one Slack conversation routing identity as `thread_ts ?? message.ts`. Carry it separately from `providerEventId` and from the channel-scoped source identity `v1:slack:<account>:<channel>`.
6. Extend the closed `deliberation.history.read` handler with a provider-specific Slack reader. Read exactly the admitted event's thread using Slack's `conversations.replies`/`conversations.history` behavior as appropriate; never aggregate unrelated channel threads.
7. Preserve history/freshness bounds, exact provenance, duplicate/conflict checks, stable provider-specific timestamp ordering, pagination progress checks, and `complete` semantics. Slack timestamp comparison must be exact and tested; do not treat it as a Discord snowflake or use arbitrary unvalidated string ordering.
8. Keep the wire response shape compatible with the existing KM boundary. Add focused fixtures/tests covering Slack root messages, replies with child `ts != thread_ts`, account/channel isolation, malformed/conflicting metadata, pagination/bounds, and Discord regressions.
9. The implementation must support any number of explicitly configured Slack sources. Do not encode the pilot's one-channel rollout limit in code.

## Characterization-first guardrail

Before changing production behavior, pin the existing Discord route admission and history/freshness behavior with focused tests where current coverage is insufficient. Preserve the public Deliberation method name and existing Discord wire contract.

## DO NOT

- Do not modify KM code, task/pipeline state, deployment config, or live Slack/Discord configuration.
- Do not enable a Slack source or send a real provider message.
- Do not add Slack final delivery; this task ends at the existing KM boundary.
- Do not encode `thread_ts` into the channel-scoped `sourceTarget`.
- Do not aggregate all messages or all threads in a configured Slack channel.
- Do not weaken strict schema validation, provenance matching, bounds, or fail-closed rejection to make Slack fixtures pass.
- Do not infer an account from a single configured account.
- Do not refactor unrelated Discord or Slack monitor code.
- Do not include git operations in implementation steps or the final note.

## Acceptance criteria

- A configured Slack root and a reply are admitted with `providerEventId` equal to the actual message timestamp and a normalized thread identity equal to `thread_ts ?? message.ts`.
- The history reader returns only that thread, with canonical `v1:slack:<account>:<channel>` provenance and existing message/byte bounds.
- Conflicting, malformed, unconfigured, cross-account, or cross-channel Slack metadata fails closed.
- Existing Discord route, history, freshness, and contract tests still pass.
- Focused tests prove exact Slack timestamp validation/ordering and distinguish child-message identity from thread identity.
- Final note records exact commands/results and any stable wire-contract detail needed by the following KM task.

## Verification

Run at minimum:

```bash
pnpm exec vitest run \
  extensions/deliberation/src/config.test.ts \
  extensions/deliberation/src/route-match.test.ts \
  extensions/deliberation/src/source-identity.test.ts \
  extensions/deliberation/src/history-read.test.ts \
  extensions/deliberation/src/hooks.test.ts \
  extensions/deliberation/src/contract.test.ts
pnpm exec prettier --check extensions/deliberation/src
pnpm exec tsc --noEmit -p extensions/deliberation/tsconfig.json
```

If the extension has no repository-local `tsconfig.json`, use the smallest existing OpenClaw typecheck command that includes `extensions/deliberation/src` and record the substituted command.

Canonical registration command (operator context only; do not execute from the coding task):

```bash
python3 ~/.openclaw/workspace/km-system/scripts/task.py create openclaw-fork /Users/michal/Projects/openclaw-fork/plans/tasks/2026-08-15_deliberation-slack-intake-one-thread-history.md --paused --batch deliberation-slack-support-2026-08-15 --batch-seq 1 --proposal proposal-20260814-203937-cbe1dc --section openclaw-contracts
```

## Context

**Proposal:** `proposal-20260814-203937-cbe1dc` — Slack support for Deliberation v2
**Proposal file:** `/Users/michal/.openclaw/workspace/docs/proposals/proposal-20260814-203937-cbe1dc_slack-support-for-deliberation-v2.md`
**Batch:** `deliberation-slack-support-2026-08-15` (seq 1 z 6) — adds provider-independent Slack support while preserving Discord and KM safety contracts.
**Section:** `openclaw-contracts`

### Co stavíme jako celek

Deliberation v2 gains Slack as a source and destination without coupling source provider to delivery provider. The first rollout admits one allowlisted Slack source but pins final output to Discord `test-deliberation`; Slack-native delivery remains disabled until a later decision.

### Můj task v sekvenci (seq 1)

**Co dělám:** Slack intake plus exact one-thread history/freshness through the existing OpenClaw-to-KM boundary.

**Závisí na (předchozí seq):** — (first task)

**Co následuje po mně:** Seq 2 consumes this wire contract in KM with provider-specific validation; seq 3 then introduces the structured durable delivery target.

### Required reading (PŘED začátkem):

1. Proposal sections `## Vision`, `## Decisions`, `## Implementation decomposition and ownership`, and `## Slice 1: Slack intake and one-thread history`.
2. Your section marker: `<!-- section:openclaw-contracts -->`.
3. Decisions to honor: one run = one thread; `thread_ts ?? message.ts` is routing identity; child message identity stays separate; Discord parity is default; account is always explicit; all malformed ambiguity fails closed.
4. Previous seq tasks in batch: none.
