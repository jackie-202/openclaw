# [acceptance-fix] [acceptance-fix] Fix WhatsApp 408 unhandled rejection in login.ts: Add RED/GREEN malformed-result coverage with direct mocks in `extensions/whatsap: Provide TDD RED/GREEN proof at the task proof path with concrete output.

Auto-created by the monitor because the original task `dark-crag-3320` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- Provide TDD RED/GREEN proof at the task proof path with concrete output.
- Run broader login regression coverage.
- Run formatting check for touched files.
- Run build proof or record unrelated build failure.
- [P1] Required task-id TDD proof is missing concrete RED evidence (plans/checkpoints/dark-crag-3320.red-green-proof.md) -> Provide the required `dark-crag-3320` proof file with actual RED failing output and GREEN passing output, not expected-output prose.
- [P1] Planned login regression command evidence is missing (extensions/whatsapp/src/login.malformed-result.test.ts) -> Provide evidence for the planned combined login regression test command or explain a concrete blocker with relevant output.
- [P1] Planned format/build evidence is missing (plans/checkpoints/dark-crag-3320.red-green-proof.md) -> Add the planned formatter and build proof output, or exact unrelated build-failure evidence.

## Additional cleanup (suite-wide)

- [P2] Provided broad test output is unrelated to WhatsApp login acceptance (src/cli/update-cli.test.ts) -> Track separately; it does not block this task unless it is the only claimed verification evidence.

## Context

- Original task: `dark-crag-3320`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Implement the remaining primary goals above first, then handle any listed cleanup items. The original implementation is committed —
build on it, do not revert or redo completed work.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-05-04_dark-crag-3320_fix-whatsapp-408-unhandled-rejection-in-login-ts-add-red.md` for full context. Focus only on the unmet goals listed above.

## Previous attempt: acceptance context

**Why incomplete:** Core WhatsApp login implementation and focused malformed-result tests appear aligned with the plan, but acceptance evidence is incomplete: the required task-id TDD proof is missing concrete RED output, and planned regression, format, and build proofs are absent.

**Already done (do NOT redo):**

- Add dedicated `loginWeb(false)` malformed-result regression test file.
- Assert malformed `waitForWhatsAppLoginResult` values throw fallback `Error`, not `TypeError`.
- Assert well-formed failed result preserves message and cause.
- Update production login handling only if the new login-flow test exposes a gap.
- Run targeted GREEN test for malformed-result file.
- Save focused learning.

## Recent learnings from previous attempt

### dark-crag-3320-isolated-test-proof-when-local-wrapper-is-locked.md

```
---
title: "Acceptance Fix: Isolated Test Proof When Local Wrapper Is Locked"
date: 2026-05-04
category: tooling
component: tooling
tags: [acceptance-fix, vitest, test-lock, tdd-proof]
file_type: rules
---

# Acceptance Fix: Isolated Test Proof When Local Wrapper Is Locked

When an acceptance-fix task starts after production code has already been committed, missing RED/GREEN proof cannot always be regenerated honestly from the current tree without temporarily undoing completed work. Preserve the completed implementation and make the proof file explicit about which evidence is reconstructed fro
```

## Implementation session log excerpt (last 50 lines)

```
isolated-test-proof-when-local-wrapper-is-locked.md`.

Validation:
- Passed: `node scripts/run-vitest.mjs ... extensions/whatsapp/src/login.malformed-result.test.ts` → 4 tests passed.
- Passed: grouped WhatsApp login tests → 13 tests passed.
- Passed: `pnpm build`.
- Passed: targeted oxlint on WhatsApp login files.
- Passed: `oxfmt --check` on touched files.

Notes:
- `pnpm test <file>` was blocked by another active local heavy-check lock, so I used the repo Vitest wrapper with an isolated cache.
- `extensions/whatsapp/package.json` has no plugin-local `build` script; root `pnpm build` is the available build proof.
- Broad `pnpm tsgo:extensions:test` and `pnpm lint:extensions` still fail in existing WhatsApp auto-reply group activation/gating files, unrelated to this login acceptance fix.

```
