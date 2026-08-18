---
title: Fix Deliberation READY_TO_SEND records not reaching sole-send delivery
type: implementation
---

# Fix Deliberation READY_TO_SEND records not reaching sole-send delivery

## Context

A real production-style Discord test on 2026-08-18 proved that intake, drafting, detached result ingestion, review, and rewrite work, but final delivery never starts.

Observed record:

- source message: `Jsi tu?`
- source provider message ID: `1539339283742335018`
- source target: `v1:discord:default:1494265174389948538`
- record: `786951effe8b9f7eb035954671b80daafca7e6355dff846d53232761dacc24c7`
- initial draft completed and review requested rewrite
- rewrite draft: `Ano — a tentokrát rovnou poslouchám.`
- second review produced `REVIEW_SEND`
- record reached `READY_TO_SEND` at `2026-08-18T18:36:00.115854Z`
- at inspection after 20:44 Europe/Prague it remained `READY_TO_SEND`, version 16
- `delivery_attempts` had no row for this record
- no reply appeared in the source Discord channel
- listener status was healthy, gateway was reachable, plugin inspect reported Deliberation loaded

The final sender belongs to the OpenClaw Deliberation plugin; do not add delivery to the km-system listener/runner.

A currently running upstream-sync task `calm-dune-8916` in batch `stage-a7-family13-adaptation-20260818` is restoring `expectedHooks` activation enforcement. It may reveal or repair a missing `message_sending`/activation condition. Before implementing, inspect current task/batch state and the resulting active fork state to avoid overlapping edits or duplicating that fix. If that task fully fixes this bug, verify the real record can be claimed exactly once after deployment through the documented rollout path rather than adding redundant code.

## Objective

Restore the canonical sole-send transition so a reviewed `READY_TO_SEND` record is reserved and delivered exactly once by the OpenClaw Deliberation plugin, with fail-closed reconciliation and without any manual send or second sender.

## Requirements

1. Characterize why the loaded plugin did not reserve record `786951...` after `REVIEW_SEND` despite healthy gateway/listener state.
2. Check the four expected typed hooks and runtime activation, especially the send-side hook, using canonical plugin inspection/runtime evidence.
3. Coordinate with `calm-dune-8916`; do not edit files currently owned by its live runtime or recreate its expected-hook enforcement work.
4. Add focused RED/GREEN coverage for the actual missing transition/activation condition before behavior changes.
5. Preserve sole-send ownership, delivery reservation, idempotency, provider receipt recording, stale-attempt reconciliation, and duplicate prevention.
6. Do not manually send the pending text, mutate the production SQLite spool, add a poller/sender, or weaken fail-closed behavior.
7. Do not deploy broad km-system state. If an OpenClaw build/link/restart is required, record that rollout requirement and use the documented OpenClaw deployment procedure only after the implementation task has passed its gates.
8. Protect unrelated dirty files and current batch work.

## Scope boundary

Primary project is the OpenClaw fork/upstream-sync checkout selected by current project registry and active batch ownership. Read-only evidence may include the named km-system record and task artifacts above. Do not modify km-system production state or other repositories.

## Verification

- Focused tests proving an eligible `READY_TO_SEND` record is claimed and delivered once.
- Test that absent/inactive/missing expected send hook fails visibly rather than silently leaving a loaded-looking plugin.
- Existing Deliberation hook, delivery reservation, reconciliation, and duplicate-prevention tests.
- Build and built-plugin singleton/runtime verification required by the OpenClaw project.
- After documented rollout, canonical deploy verifier must pass.
- Real live test must reach `SENT` with exactly one `delivery_attempts` row and one Discord provider message ID. Do not manufacture this evidence with a manual send.

## Acceptance

- Root cause of the stuck `READY_TO_SEND` state is documented.
- Plugin runtime exposes and activates every required Deliberation hook.
- An eligible reviewed record reaches `SENT` through the canonical sole sender.
- Exactly one delivery reservation and provider message result are recorded.
- No second sender, raw spool mutation, or duplicate Discord message is introduced.
- Final note lists changed files, tests/build results, rollout evidence, and live message/record IDs.
