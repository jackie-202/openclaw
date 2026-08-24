# [acceptance-fix] [acceptance-fix] Fix compaction OpenAI OAuth/bridge provider-auth validation: goal-006: Relevant focused tests and the s: goal-001: [acceptance-fix] Fix compaction OpenAI OAuth/bridge provider-auth vali

Auto-created by the monitor because the original task `fresh-reef-7050` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-001: [acceptance-fix] Fix compaction OpenAI OAuth/bridge provider-auth validation: goal-006: Relevant focused tests and the s

### [BLOCKING] finding-001 - verification_evidence_missing / evidence

**Scope:** `goal-001`  
**Claim:** The required focused and smallest suitable broader-suite passing verification is not established by canonical Test Gate evidence.

**Observed**
The supplied Test Gate status is not run and no canonical Test Gate evidence exists. The checkpoint reports local Vitest summaries, but the task and supplied guidance require a caller-owned non-not-run Test Gate reference for this goal.

**Why this matters**
Goal-001 carries the original goal-006 requirement for focused and broader-suite passing verification. Acceptance may recognize these execution results only through the supplied canonical Test Gate reference.

**Required action**
Provide caller-owned canonical Test Gate evidence with a non-not-run run reference and passing results for the required focused and five-file broader Vitest commands.

**Evidence**

- test-gate: `canonical Test Gate reference: status not run; no evidence`
- artifact: `plans/checkpoints/fresh-reef-7050.checkpoint.md`
- plan: `plans/2026-08-20_fresh-reef-7050_fix-compaction-openai-oauth-bridge-provider-auth-validation.md`

## Context

- Original task: `fresh-reef-7050`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Treat this as an evidence-only follow-up. Production-code changes are forbidden by default. You must inspect the parent implementation and evidence first, then supply only the missing acceptance evidence. Escalate only if that inspection lets you document a real implementation defect; in that case, make only the minimal fix with tests.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-08-20_fresh-reef-7050_fix-compaction-openai-oauth-bridge-provider-auth-validation.md` for full context. Focus only on the unmet goals listed above.

## Recent learnings from previous attempt

### fresh-reef-7050-narrow-auth-compaction-verification.md

```
---
title: "Omezene overeni opravy auth a compaction"
date: 2026-08-20
category: tooling
component: ci-cd
tags: [vitest, auth, compaction, verification, oxlint]
file_type: checklist
---

# Narrow Auth Repair Verification

For an auth/compaction repair, the explicit regression file proves the resolver
contract, while the smallest useful broader suite should include the related
model-auth and compaction runtime-context tests. This preserves a cheap,
reviewable gate even when unrelated repository changes make `check:changed`
expand to every lane.

If the core Oxlint wrapper is blocked in its exte
```

## Implementation session log excerpt (last 50 lines)

```
on.md
[0m
**Verification Complete**

Changed implementation files:
- `src/agents/model-auth.ts`
- `src/agents/model-auth.profiles.test.ts`
- `src/agents/embedded-agent-runner/compact.hooks.harness.ts`
- `src/agents/embedded-agent-runner/compact.hooks.test.ts`

Passed:
- Focused auth test: 72 tests
- Focused auth/compaction tests: 126 tests
- Broader five-file auth/compaction suite: 234 tests
- `pnpm tsgo:core`
- `pnpm tsgo:core:test`
- Scoped Oxlint
- `pnpm build`
- `git diff --check`

`pnpm lint:core` remains blocked by unrelated Slack DTS failure: missing `primeChannelOutboundSendMock` export.

Post-deployment: restart Gateway, run `/compact` with local bridge plus OAuth, send `AUTH_OK`, and confirm sanitized request evidence contains neither OAuth token nor `custom-local` bearer auth.

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
