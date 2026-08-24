# [acceptance-fix] Fix compaction OpenAI OAuth/bridge provider-auth validation: goal-006: Relevant focused tests and the smallest suitable broader test suite pa

Auto-created by the monitor because the original task `bold-brook-8179` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-006: Relevant focused tests and the smallest suitable broader test suite pass.
- goal-007: The final note lists changed files, exact verification commands/results, and any residual runtime verification required after deployment.

### [BLOCKING] finding-001 - verification_evidence_missing / evidence

**Scope:** `goal-006`  
**Claim:** Required focused and broader-suite passing verification is not established by canonical Test Gate evidence.

**Observed**
The caller states that Test Gate status is not run and that no Test Gate evidence exists; the supplied TDD proof covers only pnpm test src/agents/model-auth.profiles.test.ts, while goal-006 also requires the smallest suitable broader suite.

**Why this matters**
Goal-006 explicitly requires passing focused tests and a suitable broader suite, and Acceptance may recognize that execution result only through the caller-supplied canonical Test Gate reference.

**Required action**
Provide canonical Test Gate evidence establishing the required focused and smallest suitable broader test suite results.

**Evidence**

- test-gate: `canonical Test Gate reference: status not run; no evidence`
- artifact: `plans/checkpoints/bold-brook-8179.red-green-proof.md`

### [BLOCKING] finding-002 - required_artifact_missing / correctness

**Scope:** `goal-007`  
**Claim:** The required final note is absent from the supplied task artifacts.

**Observed**
The supplied checkpoint only states broad completion and blockers; it does not list changed files, exact verification commands with their results, or the residual post-deployment runtime verification. The plan contains intended files and verification steps, but it is a draft plan rather than the required final note.

**Why this matters**
Goal-007 makes the final note itself a deliverable with specific contents, and none of the caller-supplied artifacts fulfills that deliverable.

**Required action**
Provide a final note listing the actual changed files, exact verification commands and results, and any residual runtime verification required after deployment.

**Evidence**

- file: `plans/tasks/fix-compaction-openai-oauth-bridge-auth-validation.md`
- artifact: `plans/checkpoints/bold-brook-8179.checkpoint.md`
- plan: `plans/2026-08-20_bold-brook-8179_fix-compaction-openai-oauth-bridge-provider-auth-validation.md`

## Context

- Original task: `bold-brook-8179`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Use the concrete goals and findings above to repair the untrustworthy task outcome. Make the minimum implementation and test changes needed, and verify the repaired behavior.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-08-20_bold-brook-8179_fix-compaction-openai-oauth-bridge-provider-auth-validation.md` for full context. Focus only on the unmet goals listed above.

## Previous attempt: acceptance context

**Already done (do NOT redo):**

- goal-001: Compaction no longer raises the quoted OAuth-vs-API-key error for the supported local bridge/OAuth arrangement.
- goal-002: Normal OpenAI provider initialization and compaction use one coherent auth-compatibility policy.
- goal-003: Direct API-key authentication remains valid.
- goal-004: Unsupported auth/provider combinations remain rejected before network use.
- goal-005: Tests prove the placeholder cannot become an upstream credential.

## Recent learnings from previous attempt

### synthetic-auth-marker-must-match-header-clearing-transport.md

```
---
title: "Synteticky auth marker musi odpovidat transportu, ktery maze hlavicku"
date: 2026-08-20
category: security-issues
component: backend
tags: [oauth, openai, provider-auth, compaction, credential-leakage, request-headers]
file_type: rules
---

# Synteticky auth marker musi odpovidat transportu, ktery maze hlavicku

Synthetic local authentication is safe only when the selected transport has a request-boundary rule that removes the SDK-generated credential header. A local `baseUrl` and a no-key provider configuration are not sufficient by themselves.

For OpenAI-compatible models in Ope
```

## Implementation session log excerpt (last 50 lines)

```
m tsgo:core`: passed.
- `pnpm tsgo:core:test`: passed.
- Targeted type-aware Oxlint: passed.
- `pnpm build`: passed.
- `.agents/skills/autoreview/scripts/autoreview --mode local`: clean after one accepted boundary finding was fixed.

`pnpm check:changed` could not complete: Testbox delegation lacked the `blacksmith` executable, and local fallback failed because `corepack` was unavailable. The broad lint wrapper also encountered an unrelated existing Slack boundary DTS error; touched-file lint passed.

**Runtime Follow-up**
After deployment, restart the Gateway, run `/compact` with the same OpenAI OAuth/local-bridge arrangement, rerun the ordinary `AUTH_OK` probe, and verify sanitized bridge/upstream evidence contains neither the OAuth access token nor `custom-local` as bearer credentials.

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
