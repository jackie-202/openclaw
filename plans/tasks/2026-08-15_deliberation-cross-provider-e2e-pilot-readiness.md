---
title: "Deliberation cross-provider E2E and Slack pilot readiness"
type: implementation
proposal_id: proposal-20260814-203937-cbe1dc
proposal_section: integration-verification
---

# Deliberation cross-provider E2E and Slack pilot readiness

Add the final repository-local verification harness and evidence for Deliberation's provider-independent Slack support. Prove the pilot path Slack root/reply → KM contract → Discord target, cover the wider destination matrix with fakes, and produce a fail-closed readiness verdict and bounded smoke/rollback runbook. Do not activate live rollout.

## Overall proposal goal

Proposal `proposal-20260814-203937-cbe1dc` adds Slack as a Deliberation source and destination while preserving existing Discord behavior, strict validation, bounded one-thread history, immutable KM-owned delivery state, provenance, deduplication, replay fencing, and sole-send ownership. The first rollout is intentionally Slack source-only with an explicit immutable Discord `test-deliberation` destination; Slack-native output remains off until separately approved.

Read the proposal before planning:
`/Users/michal/.openclaw/workspace/docs/proposals/proposal-20260814-203937-cbe1dc_slack-support-for-deliberation-v2.md`

## Scope boundary

Work only in `/Users/michal/Projects/openclaw-fork`. Do not inspect or modify `km-system`, live config, credentials, or external services. Use stable fixtures and contract evidence produced by seq 1–5. If cross-repository evidence is absent, report `NOT READY` with the exact missing artifact rather than traversing the other repository.

Primary paths:

- `extensions/deliberation/src/contract.test.ts`
- `extensions/deliberation/src/hooks.test.ts`
- `extensions/deliberation/src/history-read.test.ts`
- `extensions/deliberation/src/km-client.test.ts`
- `extensions/deliberation/src/final-adapter.test.ts`
- `extensions/deliberation/src/sole-send.test.ts`
- a new focused repository-local E2E/contract test under `extensions/deliberation/src/` if needed
- `extensions/deliberation/README.md` or the nearest existing Deliberation operator documentation for the smoke/rollback runbook; do not create a duplicate documentation system

## Required behavior and scenarios

1. Build a deterministic repository-local end-to-end harness using faked Slack history, KM HTTP responses, and provider transports. It must exercise public Deliberation seams rather than duplicating implementation logic in the test.
2. Prove Slack root source → exact bounded one-thread history → KM intake/freshness → structured Discord destination → one Discord send to configured account/channel/thread → KM completion receipt.
3. Repeat for a Slack child reply where `providerEventId = message.ts` and routing thread is `thread_ts`; prove unrelated channel threads are absent.
4. Prove cross-provider destination selection with fixtures for Slack → Discord and Discord → Slack, plus same-provider Discord → Discord and Slack → Slack regression paths. Native Slack fixtures do not activate live rollout.
5. Prove malformed/conflicting explicit target, provider/account/channel/thread drift, stale replay, duplicate reservation, provenance mismatch, incomplete history, timestamp boundary violation, and unsupported provider all fail closed with zero unintended provider calls.
6. Prove retry/replay fencing and sole-send: one KM invocation corresponds to at most one real selected-provider call and exact receipt binding. No intake/history/hook path may send durably.
7. Keep all history/byte bounds and exact Slack timestamp precision represented in the test corpus.
8. Verify existing Discord contract tests and relevant Slack outbound tests remain green.
9. Add a concise pilot runbook describing prerequisites, explicit one-channel allowlist, Slack source-only configuration, immutable Discord `test-deliberation` target, bounded smoke cases, evidence to inspect, abort criteria, rollback/disable steps, and confirmation that Slack-native delivery remains disabled. Use placeholders/config keys rather than credentials or hard-coded secrets.
10. The task's final note must give an explicit `READY` or `NOT READY` verdict. `READY` requires all mandatory tests plus stable contract evidence from seq 1–5. Missing/contradictory evidence means `NOT READY`; do not paper over it.

## Characterization-first guardrail

Treat existing Discord tests as a baseline. Add test orchestration around public seams; do not rewrite production behavior merely to simplify the E2E harness.

## DO NOT

- Do not enable/start the batch's live rollout, edit live OpenClaw config, or send a real message.
- Do not access Slack/Discord credentials or external APIs.
- Do not modify KM or reconstruct its internals in OpenClaw tests.
- Do not claim full E2E from tests that bypass public intake/history/KM-client/final-adapter seams.
- Do not weaken assertions, skip failure cases, or mark readiness when required evidence is missing.
- Do not activate Slack-native delivery.
- Do not add a remote image/runtime asset or external URL dependency.
- Do not include git operations.

## Acceptance criteria

- Deterministic E2E coverage proves Slack root and reply inputs reach only the explicit Discord target with correct identity separation and one provider call.
- Provider matrix and fail-closed scenarios are covered without external services.
- Existing Discord and relevant Slack outbound suites pass.
- Runbook is bounded, actionable, secret-free, and preserves Slack source-only pilot rules.
- Final note includes test evidence and an explicit `READY`/`NOT READY` verdict.

## Verification

Run focused E2E plus all affected Deliberation tests, for example:

```bash
pnpm exec vitest run extensions/deliberation/src
pnpm exec vitest run \
  extensions/slack/src/send.blocks.test.ts \
  extensions/slack/src/outbound-adapter.test.ts
pnpm exec prettier --check extensions/deliberation/src extensions/deliberation/README.md
```

Run the smallest existing typecheck covering touched files. If the documentation path differs, use the nearest existing Deliberation operator document and record the path.

Canonical registration command (operator only):

```bash
python3 ~/.openclaw/workspace/km-system/scripts/task.py create openclaw-fork /Users/michal/Projects/openclaw-fork/plans/tasks/2026-08-15_deliberation-cross-provider-e2e-pilot-readiness.md --paused --batch deliberation-slack-support-2026-08-15 --batch-seq 6 --proposal proposal-20260814-203937-cbe1dc --section integration-verification
```

## Context

**Proposal:** `proposal-20260814-203937-cbe1dc` — Slack support for Deliberation v2
**Proposal file:** `/Users/michal/.openclaw/workspace/docs/proposals/proposal-20260814-203937-cbe1dc_slack-support-for-deliberation-v2.md`
**Batch:** `deliberation-slack-support-2026-08-15` (seq 6 z 6) — complete provider-independent Slack implementation and prove the bounded Slack-source/Discord-target pilot is safe to activate later.
**Section:** `integration-verification`

### Co stavíme jako celek

The batch adds Slack intake, KM validation, structured cross-provider delivery, Discord pilot routing, and dormant Slack-native transport without sacrificing existing Discord or durable safety contracts. Rollout is a separate explicit action after this task's evidence.

### Můj task v sekvenci (seq 6)

**Co dělám:** Final cross-provider E2E, regression/failure matrix, and pilot readiness runbook/verdict.

**Závisí na:** Seq 1–5 and their stable contract/test evidence.

**Co následuje:** No implementation task. A later explicit operator decision may configure one Slack source and run the bounded Slack → Discord smoke test; this task must not do that.

### Required reading (PŘED začátkem):

1. Entire proposal, especially `Vision`, `Decisions`, all six slices, `Rollout`, and `Out of scope`.
2. Section marker `<!-- section:integration-verification -->`.
3. Decisions: one run = one thread; child/message vs thread identity; structured explicit destination; independent providers; immutable target; sole-send; source-only pilot; fail closed.
4. All prior seq task files and final evidence available in this repository/pipeline artifacts. Missing evidence is a readiness failure, not permission to traverse `km-system`.
