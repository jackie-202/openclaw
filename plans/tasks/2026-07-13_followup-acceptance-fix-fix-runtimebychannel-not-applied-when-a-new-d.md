# [acceptance-fix] [acceptance-fix] Fix runtimeByChannel not applied when a new Discord channel session starts: Provide a genuine captured RED and subsequent GREEN TDD cycle for the new implem: Run `acceptance-checks` against the primary goal.

Auto-created by the monitor because the original task `calm-reef-1872` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- Run `acceptance-checks` against the primary goal.
- Run `save-learning` and record an evidence-repair learning as the final implementation-session action.

## Context

- Original task: `calm-reef-1872`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Use the concrete goals and findings above to repair the untrustworthy task outcome. Make the minimum implementation and test changes needed, and verify the repaired behavior.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-07-13_calm-reef-1872_fix-runtimebychannel-not-applied-when-a-new-discord-channel.md` for full context. Focus only on the unmet goals listed above.

## Previous attempt: acceptance context

**Why incomplete:** Core TDD provenance and fresh GREEN verification are complete and trustworthy, but required acceptance-check and final learning evidence are missing.

**Already done (do NOT redo):**

- Verify and cite genuine historical RED provenance from parent task `bold-peak-9726`.
- Capture a fresh GREEN run using the exact historical regression command.
- Create `plans/checkpoints/calm-reef-1872.red-green-proof.md` with task linkage and complete RED/GREEN metadata.
- Preserve the completed implementation without making follow-up production or regression-test changes when verification passes.

## Recent learnings from previous attempt

### acceptance-followups-reuse-historical-red-evidence.md

```
---
title: "Acceptance follow-ups reuse genuine historical RED evidence"
date: 2026-07-13
category: tooling
component: ci-cd
tags: [tdd, red-green, acceptance, evidence, provenance]
file_type: rules
---

# Reuse historical RED evidence for acceptance follow-ups

When an acceptance follow-up starts after the implementation already exists, rerunning a RED phase would create artificial evidence. Preserve the original helper-captured RED checkpoint as immutable provenance, cite its task ID, command identity, timestamp, exit code, and expected failures, then run the identical command against the pr
```

## Implementation session log excerpt (last 50 lines)

```
torical-red-evidence.md"
✓ Learning saved to learnings/tooling/acceptance-followups-reuse-historical-red-evidence.md
[0m
Implemented the acceptance repair for `calm-reef-1872`.

- Added required RED/GREEN evidence at `plans/checkpoints/calm-reef-1872.red-green-proof.md`.
- Linked genuine historical RED: 3 failures, 43 passes.
- Captured fresh post-correction GREEN: 55/55 tests passed.
- Removed an unsupported, unused `channelRuntimeProfile` command argument.
- `pnpm build`: passed.
- `git diff --check`: passed.
- Autoreview: clean.
- Acceptance checks: passed.
- Saved the required learning.

`pnpm lint:core` progressed past the corrected type error but remains blocked by an unrelated missing `primeChannelOutboundSendMock` export in `extensions/slack/src/outbound-payload.test-harness.ts`.

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
