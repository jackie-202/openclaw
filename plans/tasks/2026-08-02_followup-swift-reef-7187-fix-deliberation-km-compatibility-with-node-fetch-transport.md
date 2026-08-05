# [acceptance-fix] Fix Deliberation KM compatibility with Node fetch transport headers: goal-001: The characterized Node `fetch` transport-header request no longer rece

Auto-created by the monitor because the original task `swift-peak-4405` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-001: The characterized Node `fetch` transport-header request no longer receives HTTP 400 solely because of standard automatic transport metadata.
- goal-004: Focused tests and the Deliberation extension typecheck/build gate pass.

### [BLOCKING] finding-001 - required_tdd_proof_missing / evidence

**Scope:** `goal-001`, `goal-004`
**Claim:** The caller-required TDD proof is incomplete because it contains no GREEN implementation proof.

**Observed**
The artifact labels GREEN as BLOCKED and says the passing commands prove only the unchanged baseline, not acceptance of sec-fetch-mode: cors; its RED is task-supplied live diagnostic evidence rather than the planned focused repository test run before production behavior changed.

**Why this matters**
With tddRequired true, a blocked RED-only characterization plus unchanged-baseline checks does not establish the required RED/GREEN cycle for the compatibility behavior.

**Required action**
Provide a valid focused RED followed by GREEN evidence for the delivered compatibility seam, without exposing credential material.

**Evidence**

- artifact: `plans/checkpoints/swift-peak-4405.red-green-proof.md`
- plan: `plans/2026-08-02_swift-peak-4405_fix-deliberation-km-compatibility-with-node-fetch-transport.md`
- file: `plans/checkpoints/acceptance-runs/swift-peak-4405-acceptance-001/manifest.json:36`

### [BLOCKING] finding-002 - required_implementation_missing / correctness

**Scope:** `goal-001`
**Claim:** The required Node fetch transport-header compatibility behavior was not delivered.

**Observed**
The supplied plan, checkpoint, and RED/GREEN proof all state that no OpenClaw product or contract change was made and that the listener still requires a KM-owned Sec-Fetch-Mode transport allowlist change.

**Why this matters**
Goal 001 requires the characterized request to stop receiving HTTP 400, but the supplied evidence explicitly leaves that behavior RED and blocked rather than implemented.

**Required action**
Deliver the authoritative transport-header contract/listener change and repository synchronization that makes supported Node fetch metadata accepted without weakening the closed application-header boundary.

**Evidence**

- plan: `plans/2026-08-02_swift-peak-4405_fix-deliberation-km-compatibility-with-node-fetch-transport.md`
- artifact: `plans/checkpoints/swift-peak-4405.checkpoint.md`
- artifact: `plans/checkpoints/swift-peak-4405.red-green-proof.md`

## Context

- Original task: `swift-peak-4405`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Use the concrete goals and findings above to repair the untrustworthy task outcome. Make the minimum implementation and test changes needed, and verify the repaired behavior.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-08-02_swift-peak-4405_fix-deliberation-km-compatibility-with-node-fetch-transport.md` for full context. Focus only on the unmet goals listed above.

## Previous attempt: acceptance context

**Already done (do NOT redo):**

- goal-002: Unknown or unauthorized application headers remain rejected by the documented contract.
- goal-003: Authentication, protocol version, media type, SecretRef handling, and fail-closed behavior remain covered and unchanged.
- goal-005: Final note identifies the exact compatibility seam changed and provides verification evidence.

## Recent learnings from previous attempt

### 2026-08-02_external-listener-gates-require-external-green-proof.md

```
---
title: "Passing consumer tests do not close an external listener contract gate"
date: 2026-08-02
category: architecture
component: shared
tags: [external-contract, verification, node-fetch, deliberation]
file_type: rules
---

# Passing consumer tests do not close an external listener contract gate

When a failure occurs at an externally owned HTTP listener, a green consumer suite proves only the unchanged local baseline. It does not prove the reported integration is fixed if mocked fetch tests cannot observe runtime-generated headers and the external listener has not changed.

For Delibera
```

## Implementation session log excerpt (last 50 lines)

```
ist.
- Accept Node’s emitted value `cors`.
- Preserve authentication, protocol/media checks, and exact application headers.
- Continue rejecting unknown headers such as `X-Deliberation-Unknown`.
- Supply updated canonical artifact and listener regression evidence.

Artifacts created:

- `plans/checkpoints/swift-peak-4405.checkpoint.md`
- `plans/checkpoints/swift-peak-4405.red-green-proof.md`
- `learnings/architecture/2026-08-02_external-listener-gates-require-external-green-proof.md`

Verification:

- Focused tests: 24/24 passed.
- Deliberation extension suite: 52/52 passed.
- `node scripts/run-tsgo.mjs -p extensions/deliberation/tsconfig.json`: passed.
- `pnpm docs:list`: passed.

These results establish the unchanged OpenClaw baseline, not resolution of the external listener’s HTTP 400.

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
