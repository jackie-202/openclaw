# [acceptance-fix] Investigation: Opakovaný gateway crash — WhatsApp unhandled rejection (RERUN): Inspect crash logs via bash and collect evidence

Auto-created by the monitor because the original task `fresh-mist-4301` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- Inspect crash logs via bash and collect evidence
- Check whether upstream already fixed this
- Create final investigation artifact `plans/investigations/wild-reef-6230_whatsapp-408-unhandled-rejection.md`
- Update checkpoint `plans/checkpoints/wild-reef-6230.checkpoint.md`
- [P1] Required investigation artifact missing (plans/investigations/wild-reef-6230_whatsapp-408-unhandled-rejection.md) -> Create the required investigation report with root cause, log evidence, 408 explanation, recommended fix, upstream status, and guard-test recommendation.
- [P1] Diff is unrelated to requested WhatsApp crash investigation (scripts/bench/queued-file-writer-burst.ts) -> Replace unrelated benchmark changes with the required investigation/checkpoint artifacts for the WhatsApp 408 crash task.
- [P1] Wrong checkpoint updated (plans/checkpoints/wild-reef-6230.checkpoint.md) -> Update the checkpoint named in the plan, not `fresh-mist-4301`.

## Context

- Original task: `fresh-mist-4301`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Implement the remaining primary goals above first, then handle any listed cleanup items. The original implementation is committed —
build on it, do not revert or redo completed work.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-05-04-2_investigation-opakovany-gateway-crash-whatsapp-unhandled-rej.md` for full context. Focus only on the unmet goals listed above.

## Previous attempt: acceptance context

**Why incomplete:** The supplied evidence partially identifies the unsafe dereference and 408 flow, but the required report and checkpoint are missing, upstream/log evidence is not shown, and the diff contains unrelated benchmark files.

**Already done (do NOT redo):**

- Find unsafe `result.error` dereference in `extensions/whatsapp/src/`
- Trace the WhatsApp 408 path through session/controller/normalization

## Recent learnings from previous attempt

### source-only-bundled-plugin-crash-investigations.md

```
---
title: "Source-only investigation reports for bundled plugin crashes"
date: 2026-05-04
category: tooling
component: tooling
tags: [investigation, plugins, whatsapp, baileys]
file_type: checklist
---

# Source-only investigation reports for bundled plugin crashes

When a crash report points at a built `dist/server.impl-*.js:<line>` bundle but the task forbids external logs and says the bundle may not exist, keep the investigation source-only and map behavior through the plugin source instead of chasing generated output.

## Pattern

- Start with exact source greps for the suspect expression
```

## Implementation session log excerpt (last 50 lines)

```
ations.md
[0m
[0m⚙ [0mapply_patch Success. Updated the following files:
M plans/checkpoints/wild-reef-6230.checkpoint.md
Implemented the investigation-only task.

- Created report: `plans/investigations/wild-reef-6230_whatsapp-408-unhandled-rejection.md`
- Updated checkpoints:
  - `plans/checkpoints/fresh-mist-4301.checkpoint.md`
  - `plans/checkpoints/wild-reef-6230.checkpoint.md`
- Saved learning: `learnings/tooling/source-only-bundled-plugin-crash-investigations.md`

Verification:
- `git diff --check` passed.
- Targeted test `pnpm test extensions/whatsapp/src/login.coverage.test.ts` could not start because an unrelated local heavy-check lock was already held by pid `54924`.
- No build/lint gate was run because this was diagnostic-only markdown/checkpoint work with no source changes.

```
