# [acceptance-fix] Deliberation Slack-to-Discord pilot delivery: goal-001: A Slack-origin ready item with a canonical Discord destination makes e

Auto-created by the monitor because the original task `bold-fork-3487` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-001: A Slack-origin ready item with a canonical Discord destination makes exactly one Discord send to its configured account/channel/thread.
- goal-002: Destination provider, not source provider, chooses the adapter.
- goal-003: KM reservation is durable before send and exact target/receipt evidence is bound through completion.
- goal-004: Invalid/conflicting targets cause zero provider calls and no source fallback.

### [BLOCKING] finding-001 - required_implementation_missing / correctness

**Scope:** `goal-001`, `goal-002`, `goal-003`, `goal-004`  
**Claim:** The Slack-origin to structured Discord-destination delivery behavior was not implemented.

**Observed**
The supplied task-scoped diff contains no changes to the Deliberation final adapter, KM client, configuration, plugin runtime, or focused tests, and the supplied checkpoint marks the structured-target tests, implementation, and GREEN verification incomplete because the repository-local contract still uses string targets without threadId.

**Why this matters**
Without structured destination parsing and equality fencing, destination-selected provider dispatch, exact account/channel/thread routing, and lifecycle evidence binding, the required cross-provider pilot and fail-closed target behavior are absent.

**Required action**
Implement the owner-authored structured target contract and the required destination-selected Discord delivery lifecycle, including exact target comparisons and zero-send rejection for malformed, unsupported, or conflicting targets.

**Evidence**
- plan: `/Users/michal/Projects/openclaw-fork/plans/2026-08-16_bold-fork-3487_deliberation-slack-to-discord-pilot-delivery.md:Progress and Blocker Resolution`
- artifact: `/Users/michal/Projects/openclaw-fork/plans/checkpoints/bold-fork-3487.checkpoint.md:Steps and Last completed`

### [BLOCKING] finding-002 - required_tdd_proof_missing / evidence

**Scope:** cross-cutting  
**Claim:** The caller-required RED/GREEN TDD proof is absent.

**Observed**
The manifest declares tddRequired true, the caller supplies no TDD proof, and the checkpoint shows the RED, implementation, and GREEN steps incomplete.

**Why this matters**
The mandatory TDD process cannot be established from the supplied materials.

**Required action**
Supply valid run-scoped RED/GREEN proof for the required implementation after the structured target contract gate is resolved.

**Evidence**
- file: `/Users/michal/Projects/openclaw-fork/plans/checkpoints/acceptance-runs/bold-fork-3487-acceptance-001/manifest.json:40`
- artifact: `/Users/michal/Projects/openclaw-fork/plans/checkpoints/bold-fork-3487.checkpoint.md:Steps`


## Context

- Original task: `bold-fork-3487`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Use the concrete goals and findings above to repair the untrustworthy task outcome. Make the minimum implementation and test changes needed, and verify the repaired behavior.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-08-16_bold-fork-3487_deliberation-slack-to-discord-pilot-delivery.md` for full context. Focus only on the unmet goals listed above.

## Previous attempt: acceptance context


**Already done (do NOT redo):**
- goal-005: Discord → Discord behavior and sole-send tests remain green.
- goal-006: Slack-native provider path remains absent or disabled.

## Recent learnings from previous attempt


### deliberation-provenance-pass-can-still-block-future-wire-shape.md

```
---
title: "Deliberation: passing provenance does not satisfy a future wire shape"
date: 2026-08-16
category: architecture
component: backend
tags: [deliberation, contract, provenance, tdd, cross-provider]
file_type: rules
---

# Cross-provider delivery planning must verify target-shape provenance

A task description can name a future structured destination while the registered repository still pins an older target representation. For Deliberation, the current accepted fixture and parser use a `v1:<provider>:<account>:<channel>` string, while the pilot task expects `{ provider, accountId, chan
```

## Implementation session log excerpt (last 50 lines)

```
ocation/completion targets remain strings at `extensions/deliberation/contracts/km-wire-v1.json:134`, `extensions/deliberation/contracts/km-wire-v1.json:161`, and `extensions/deliberation/contracts/km-wire-v1.json:291`.
- No accepted contract schema defines `threadId`, structured-field bounds, or lifecycle placement.
- The proposal file was inaccessible due workspace permissions.

Per plan lines 48 and 159-163, I did not infer the contract, modify production code, or fabricate RED/GREEN evidence.

Verification: `node scripts/run-vitest.mjs extensions/deliberation/src/contract.test.ts` passed 6 tests.

Checkpoint updated at `plans/checkpoints/bold-fork-3487.checkpoint.md`. Required learning saved at `learnings/architecture/deliberation-provenance-pass-can-still-block-future-wire-shape.md`.

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
