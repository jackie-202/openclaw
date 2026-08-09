# OpenClaw account-aware Deliberation producer admission

## Goal

Update the existing `extensions/deliberation/` inbound producer so every admitted Discord source event carries the accepted versioned provider/account/channel identity and forbidden routes stop before any KM request.

## Existing foundation to preserve

- `createInboundClaimHandler`, configured source/processing route matching, silent terminal claim and authenticated KM client already exist.
- Earlier task `quick-dune-1263` correctly implemented the former account-less `discord:channel:<id>` contract; this task deliberately supersedes only that identity shape.
- KM remains the canonical spool/orchestration owner. Mission Control remains read-only.

## Required behavior

- Consume the canonical identity grammar and fixtures defined by the preceding KM task; implement the TypeScript encoder/parser against that shared specification rather than creating a second wire contract.
- Encode the configured Discord `provider + account + channel` identity in every accepted producer request.
- Reject processing identity, wrong configured account, unsupported provider/event/kind, missing provider event id and ambiguous or malformed routes before invoking the KM client.
- Preserve silent terminal handling for all Deliberation-claimed source events and preserve fail-closed behavior when KM is unavailable or rejects the request.
- Add bot/self rejection only where the canonical hook payload carries authoritative bot/self evidence; do not infer it from display text or unstable heuristics. Document any upstream hook invariant on which the check depends.
- Keep the declared event vocabulary aligned between hook registration, producer schema and KM contract fixtures.

## Acceptance

- Same channel id under two configured Discord accounts produces two distinct canonical identities and requests.
- Two channels under one account remain distinct.
- Source route is accepted exactly once; processing, wrong-account, unsupported, missing-id and ambiguous routes cause zero KM requests.
- Producer fixtures round-trip against the KM-owned identity contract.
- No ordinary response, V1 path, source-channel send or alternate intake path is introduced.

## Guardrails

- Do not change KM spool/orchestration, Mission Control, final delivery, scheduler or live config in this task.
- Do not create a parallel producer or E2E framework; extend the existing extension and its focused tests.
- No live Discord send. No legacy fallback. Preserve fail-closed behavior.

## Verification

Run focused `extensions/deliberation` contract, route and hook tests plus the producer-focused portion of the existing KM-owned E2E harness. Include exact commands and results in the task note. Tests must use local fixtures and make zero live Discord sends.

## Context

**Proposal:** `proposal-20260805-092115-174a6c` — Deliberation v2: live workflow recovery and activation  
**Section:** `slice-1-canonical-source-identity-admission`  
**Investigation:** `/Users/michal/.openclaw/workspace/km-system/plans/investigations/deliberation-v2/01-intake-channel-isolation.md`  
**Batch:** `deliberation-v2-activation-remediation-2026-08-06`

This task follows the KM contract task and precedes the existing context/drafting work. The later KM-owned E2E task proves zero-KM-request admission behavior and cross-account isolation through the real producer seam.
