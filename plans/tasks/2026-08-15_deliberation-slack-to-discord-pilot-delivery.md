---
title: "Deliberation Slack-to-Discord pilot delivery"
type: implementation
proposal_id: proposal-20260814-203937-cbe1dc
proposal_section: slack-discord-pilot-delivery
---

# Deliberation Slack-to-Discord pilot delivery

Connect a Slack-origin Deliberation result to the existing Discord final-delivery transport using KM's immutable structured destination. This is the pilot path: Slack is source-only and the configured Discord `test-deliberation` route is the sole destination.

## Overall proposal goal

Proposal `proposal-20260814-203937-cbe1dc` adds Slack support while preserving Discord behavior and the Deliberation v2 safety contract: exact provenance, bounded history, fail-closed validation, immutable KM-owned delivery state, deduplication, and exactly one real provider call. Source and destination providers are independent. The first rollout intentionally proves Slack → Discord before Slack-native sending is enabled.

Read the proposal before planning:
`/Users/michal/.openclaw/workspace/docs/proposals/proposal-20260814-203937-cbe1dc_slack-support-for-deliberation-v2.md`

## Scope boundary

Work only in `/Users/michal/Projects/openclaw-fork`. Do not inspect or modify `km-system`. Use the proposal and stable seq 3 contract evidence/fixtures. If the KM wire shape is unavailable or contradictory, report a blocker rather than traversing another repository.

Primary paths:

- `extensions/deliberation/src/config.ts`
- `extensions/deliberation/src/config.test.ts`
- `extensions/deliberation/src/km-client.ts`
- `extensions/deliberation/src/km-client.test.ts`
- `extensions/deliberation/src/final-adapter.ts`
- `extensions/deliberation/src/final-adapter.test.ts`
- `extensions/deliberation/src/plugin.test.ts`
- `extensions/deliberation/src/sole-send.test.ts`
- `extensions/deliberation/src/contract.test.ts`
- existing Discord outbound/provider adapter seam used by the Deliberation plugin; keep changes narrowly within the registered repository.

## Required behavior

1. Parse KM's canonical structured destination `{ provider, accountId, channelId, threadId }` with strict exact-field and bounded-value validation. Do not parse it as source identity.
2. Select final transport from destination `provider`, not the source provider. A Slack-origin record with Discord destination must call only the Discord provider.
3. Preserve the configured route override as explicit operator configuration. For the pilot fixture/config path, Slack source must resolve to the explicit Discord `test-deliberation` account/channel/thread target; do not hard-code environment IDs into generic implementation.
4. Validate the ready target, reservation envelope target, invocation target, and completion target as equal canonical structured values before any provider call.
5. Reserve with KM before sending, mark invoked before the real provider call, then complete with exact receipt/message evidence. Keep one provider attempt ID and existing idempotency semantics.
6. Include Discord thread identity in the provider call when `threadId` is supplied. A target mismatch, unsupported provider, malformed account/channel/thread, or conflicting reservation fails before invocation/send with no fallback to Slack source.
7. Preserve Discord-only behavior and existing failure classification. This slice must not add Slack provider sending.
8. Add focused integration-style tests with mocked KM and Discord provider proving Slack source → Discord target, exact thread routing, one provider call, receipt binding, replay/conflict fencing, malformed-target fail-closed behavior, and ordinary Discord → Discord regressions.
9. Keep the current sole-send ownership check: no intake, hook, or history path may gain a durable send call.

## Characterization-first guardrail

Pin the existing Discord final adapter order (`reserve → invoke → send → complete`) and failure evidence before adapting target shape or provider selection.

## DO NOT

- Do not implement or activate Slack final delivery.
- Do not send real messages or modify live config.
- Do not modify KM or infer its contract by external repository traversal.
- Do not derive destination from Slack source after an explicit target exists.
- Do not infer account from a singleton config.
- Do not hard-code the live `test-deliberation` channel/account/thread IDs in generic source.
- Do not bypass KM reservation/invocation/completion or add a second sender.
- Do not weaken exact target equality, strict schemas, receipt evidence, or fail-closed behavior.
- Do not include git operations.

## Acceptance criteria

- A Slack-origin ready item with a canonical Discord destination makes exactly one Discord send to its configured account/channel/thread.
- Destination provider, not source provider, chooses the adapter.
- KM reservation is durable before send and exact target/receipt evidence is bound through completion.
- Invalid/conflicting targets cause zero provider calls and no source fallback.
- Discord → Discord behavior and sole-send tests remain green.
- Slack-native provider path remains absent or disabled.

## Verification

```bash
pnpm exec vitest run \
  extensions/deliberation/src/config.test.ts \
  extensions/deliberation/src/km-client.test.ts \
  extensions/deliberation/src/final-adapter.test.ts \
  extensions/deliberation/src/plugin.test.ts \
  extensions/deliberation/src/sole-send.test.ts \
  extensions/deliberation/src/contract.test.ts
pnpm exec prettier --check extensions/deliberation/src
```

Run the smallest existing typecheck that includes `extensions/deliberation/src` and record it in the final note.

Canonical registration command (operator only):

```bash
python3 ~/.openclaw/workspace/km-system/scripts/task.py create openclaw-fork /Users/michal/Projects/openclaw-fork/plans/tasks/2026-08-15_deliberation-slack-to-discord-pilot-delivery.md --paused --batch deliberation-slack-support-2026-08-15 --batch-seq 4 --proposal proposal-20260814-203937-cbe1dc --section slack-discord-pilot-delivery
```

## Context

**Proposal:** `proposal-20260814-203937-cbe1dc` — Slack support for Deliberation v2
**Proposal file:** `/Users/michal/.openclaw/workspace/docs/proposals/proposal-20260814-203937-cbe1dc_slack-support-for-deliberation-v2.md`
**Batch:** `deliberation-slack-support-2026-08-15` (seq 4 z 6) — provider-independent Deliberation with a bounded Slack-source/Discord-target pilot.
**Section:** `slack-discord-pilot-delivery`

### Co stavíme jako celek

Slack becomes a first-class Deliberation source and later a destination, but delivery authority remains in KM. The pilot deliberately routes one allowlisted Slack source into Discord `test-deliberation`, proving cross-provider behavior before Slack-native delivery is activated.

### Můj task v sekvenci (seq 4)

**Co dělám:** Consume KM's pinned structured target and deliver Slack-origin output exactly once through Discord.

**Závisí na:** Seq 1 intake/history, seq 2 KM processing, seq 3 structured durable target.

**Co následuje:** Seq 5 adds native Slack transport without changing the KM lifecycle; seq 6 verifies the full matrix and pilot gates.

### Required reading (PŘED začátkem):

1. Proposal `Vision`, `Decisions`, `Implementation decomposition and ownership`, `Slice 4`, and `Rollout`.
2. Section marker `<!-- section:slack-discord-pilot-delivery -->`.
3. Decisions: destination selects provider; explicit account; immutable target; Slack source-only pilot; sole-send; no invalid-target fallback.
4. Prior seq final contract evidence available through batch artifacts; do not traverse `km-system`.
