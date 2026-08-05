# [acceptance-fix] [acceptance-fix] Fix live Discord Deliberation intake source-target canonicalization: goal-001: A configured pilot-chann: goal-001: [acceptance-fix] Fix live Discord Deliberation intake source-target ca

Auto-created by the monitor because the original task `calm-wave-2949` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-001: [acceptance-fix] Fix live Discord Deliberation intake source-target canonicalization: goal-001: A configured pilot-chann

### [BLOCKING] finding-001 - required_implementation_missing / correctness

**Scope:** `goal-001`
**Claim:** The required live Discord Deliberation source-target implementation is absent from the supplied task-scoped changes.

**Observed**
The supplied task-scoped diff contains unrelated architecture-review, trajectory-pointer, diagnostic, and backup material, but no change to extensions/deliberation/src/intake.ts or another owning production path that constructs sourceTarget. Checkpoint and proof narratives state that implementation files were preserved, but the implementation content itself is not present in the supplied diff.

**Why this matters**
Without supplied production implementation showing the live inbound event maps the configured pilot channel to exactly discord:channel:1494265174389948538, semantic review cannot establish that goal-001 was delivered; narrative completion claims are not a substitute for the owning code change.

**Required action**
Supply the task-scoped owning production diff that constructs sourceTarget as discord:channel:<normalized-channel-id> for the configured Discord pilot-channel inbound path.

**Evidence**

- artifact: `caller-supplied task-scoped diff`
- artifact: `plans/checkpoints/calm-wave-2949.checkpoint.md:Context for resume`
- artifact: `plans/checkpoints/calm-wave-2949.red-green-proof.md:GREEN Phase`

## Context

- Original task: `calm-wave-2949`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Use the concrete goals and findings above to repair the untrustworthy task outcome. Make the minimum implementation and test changes needed, and verify the repaired behavior.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-08-03_calm-wave-2949_fix-live-discord-deliberation-intake-source-target.md` for full context. Focus only on the unmet goals listed above.

## Recent learnings from previous attempt

### calm-wave-2949-assert-terminal-hook-outcomes.md

```
---
title: "Composed ingress tests must assert terminal hook outcomes"
date: 2026-08-03
category: test-failures
component: backend
tags: [openclaw, discord, deliberation, inbound-hooks, acceptance]
file_type: rules
---

# Assert terminal hook outcomes at the composed ingress boundary

A loader-backed channel integration can prove payload serialization and downstream suppression while still failing to prove why dispatch stopped. Assertions such as "ordinary dispatch was not called" are compatible with several short-circuit paths.

For terminal inbound hooks, capture the composed hook mock's ret
```

## Implementation session log excerpt (last 50 lines)

```
 normalization coverage added in `extensions/deliberation/src/hooks.test.ts:48`.
- RED/GREEN evidence recorded in `plans/checkpoints/calm-wave-2949.red-green-proof.md`.

Verification:

- `pnpm test extensions/discord/src/monitor/message-handler.process.test.ts -- --reporter=verbose`: 105 passed.
- `pnpm test extensions/deliberation -- --reporter=verbose`: 59 passed.
- `pnpm build`: passed.
- Touched-file `pnpm format:check`: passed.
- `git diff --check`: passed.
- Autoreview: clean after adding the explicit terminal-result assertion.
- `pnpm check:changed`: attempted, but infrastructure-blocked because the required `blacksmith` executable is unavailable.

A built/managed Gateway requires rebuilding and restarting its process to activate this plugin change. No live services were restarted.

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
