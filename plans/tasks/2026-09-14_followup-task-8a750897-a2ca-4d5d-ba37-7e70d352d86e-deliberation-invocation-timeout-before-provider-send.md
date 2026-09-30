# [acceptance-fix] Deliberation invocation timeout before provider send: goal-001: Deliberation invocation timeout before provider send

Auto-created by the monitor because the original task `task-190873da-d25c-46f1-87c0-4782fde68765` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-001: Deliberation invocation timeout before provider send

### [BLOCKING] finding-001 - verification_evidence_missing / evidence

**Scope:** `goal-001`  
**Claim:** The required timeout-then-late-authorization no-send characterization is missing.

**Observed**
The supplied km-client delayed-response test gives invoke a 30000 ms budget and observes a successful response at 13000 ms; the final-adapter timeout test only mocks invoke as immediately rejected. No supplied test or proof models a short client abort followed by successful late server authorization/persisted invocation ambiguity while asserting provider.send remains at zero.

**Why this matters**
The characterization-first guardrail explicitly requires this boundary to pin the incident behavior and duplicate-send safety. Successful delayed authorization under the repaired budget and an isolated mocked rejection do not demonstrate the late authorization side effect after the client has already failed closed.

**Required action**
Provide the deterministic fake-time/transport characterization required by the task: exceed the configured short invoke timeout, allow the fake server authorization side effect to complete late, record the resulting authorization ambiguity, and prove provider.send and completion remain uncalled on that path.

**Evidence**

- file: `extensions/deliberation/src/km-client.test.ts:290`
- file: `extensions/deliberation/src/final-adapter.test.ts:382`
- artifact: `plans/checkpoints/task-190873da-d25c-46f1-87c0-4782fde68765.red-green-proof.md`

## Context

- Original task: `task-190873da-d25c-46f1-87c0-4782fde68765`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Treat this as an evidence-only follow-up. Production-code changes are forbidden by default. You must inspect the parent implementation and evidence first, then supply only the missing acceptance evidence. Escalate only if that inspection lets you document a real implementation defect; in that case, make only the minimal fix with tests.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-09-14_task-190873da-d25c-46f1-87c0-4782fde68765_deliberation-invocation-timeout-before-provider-send.md` for full context. Focus only on the unmet goals listed above.

## Recent learnings from previous attempt

### task-190873da-invocation-authorization-timeout.md

```
---
title: "Oddělit timeout autorizace od doručení"
date: 2026-09-14
category: architecture
component: backend
tags: [deliberation, timeout, lease, idempotency]
file_type: rules
---

# Bound authorization separately from delivery

When a KM invocation authorizes a provider send after synchronous freshness I/O, it is a pre-send phase, not provider-delivery evidence. Keep its timeout separate from short health and readiness checks, cap it by the remaining reservation lease, and reject expired leases before transport.

Do not retry after a lost, malformed, mismatched, or timed-out authorization r
```

## Implementation session log excerpt (last 50 lines)

```
 invocation authorization timeout.

- Added `km.invocationTimeoutMs` (100-30,000ms; default/recommended 30,000ms).
- Caps invocation wait by remaining reservation lease; expired leases fail before transport.
- Preserves fail-closed zero-send behavior for authorization timeout/loss.
- Updated manifest, docs, focused coverage, and stale lease test fixtures.
- Saved RED/GREEN proof and checkpoint artifacts.

Verification passed:
- Focused suite: 161 tests
- `pnpm test extensions/deliberation`: 344 tests
- `pnpm lint`
- `pnpm build`
- `git diff --check`

Limitation: local fixtures do not establish a producer authorization-latency SLA. Operators must ensure synchronous authorization completes within the configured budget and current lease; no deployment change or automatic retry was performed.

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
