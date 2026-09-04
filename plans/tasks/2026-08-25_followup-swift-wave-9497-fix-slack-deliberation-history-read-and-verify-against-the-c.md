# [acceptance-fix] Fix Slack Deliberation history read and verify against the configured channel: goal-002: Existing focused Slack action, monitor/history, and Deliberation histo

Auto-created by the monitor because the original task `swift-dune-6107` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-002: Existing focused Slack action, monitor/history, and Deliberation history tests pass.
- goal-005: Final note records commands, deterministic results, live-read result, files changed, and any remaining operator permission action.

### [BLOCKING] finding-001 - verification_evidence_missing / evidence

**Scope:** `goal-002`, `goal-005`  
**Claim:** The required final verification note is absent from the supplied artifacts.

**Observed**
The supplied RED/GREEN proof records only pnpm test extensions/slack/src/monitor/provider.allowlist.test.ts, while the checkpoint states that focused verification completed without listing the exact Slack action, monitor/history, Deliberation history commands and deterministic outcomes; no supplied final note records those commands, the complete files-changed list, or remaining operator permission action.

**Why this matters**
Goal 002 explicitly requires the existing focused Slack and Deliberation test sets to pass, and goal 005 explicitly requires a final note containing commands, deterministic results, live-read result, files changed, and any operator action. A checkpoint summary and one-file TDD proof do not supply that required durable evidence.

**Required action**
Supply the task final note with exact focused verification commands and deterministic outcomes, the bounded sanitized live-read result, the task files changed, and an explicit remaining operator permission action or none.

**Evidence**

- artifact: `plans/checkpoints/swift-dune-6107.red-green-proof.md`
- artifact: `plans/checkpoints/swift-dune-6107.checkpoint.md`
- file: `plans/tasks/2026-08-25_fix-slack-deliberation-history-read-and-verify-against-the-c.md`

## Context

- Original task: `swift-dune-6107`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Treat this as an evidence-only follow-up. Production-code changes are forbidden by default. You must inspect the parent implementation and evidence first, then supply only the missing acceptance evidence. Escalate only if that inspection lets you document a real implementation defect; in that case, make only the minimal fix with tests.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-08-25_swift-dune-6107_fix-slack-deliberation-history-read-and-verify-against-the.md` for full context. Focus only on the unmet goals listed above.

## Previous attempt: acceptance context

**Already done (do NOT redo):**

- goal-001: A regression test fails before the fix and passes afterward for the configured allowlist/default-account shape.
- goal-003: The configured real channel/root is read successfully through the fixed method, or a precise sanitized external permission blocker is proven without claiming success.
- goal-004: No provider writes and no config/spool/cron mutation occur.

## Recent learnings from previous attempt

### gateway-channel-runtime-context-registry-identity.md

```
---
title: "Gateway channel runtime registries must share identity"
date: 2026-08-25
category: architecture
component: backend
tags: [gateway, plugins, channel-runtime, slack, deliberation, lifecycle]
file_type: rules
---

# Runtime context registries must be shared by identity

Channel runtime contexts are process-local registrations, not discoverable metadata. A channel monitor can successfully register an account-scoped capability while another plugin still sees it as unavailable if the two components received separately constructed `PluginRuntime.channel` objects.

## Failure pattern

Slac
```

## Implementation session log excerpt (last 50 lines)

```
o:extensions:test`: passed.
- Task-scoped formatting and oxlint: passed.
- `pnpm build`: passed.
- Autoreview found two runtime lifecycle omissions; both were fixed. Its final remaining finding concerned unrelated concurrent `delivery-probe.ts` work and was not modified.
- Broader changed gate was blocked by unrelated existing issues: an unpinned Deliberation `zod` dependency and separate core test typing failures.

**Live Read**
The final read-only `deliberation.history.read` call returned:

- Source: `v1:slack:default:C0BJW0FALSC`
- Root/cutoff: `1787683185.523829`
- Provenance: Slack / `default` / `C0BJW0FALSC`
- Root correlated: `true`
- Complete: `true`
- Watermark: `1787687812.510349`
- Provider writes or config/spool/cron mutations: none
- Remaining operator permission action: none

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
