# [acceptance-fix] [acceptance-fix] RED-GREEN: ship and verify the doctor migration artifact: goal-008: Build, focused doctor/config suites: goal-001: [acceptance-fix] RED-GREEN: ship and verify the doctor migration artif

Auto-created by the monitor because the original task `swift-reef-2433` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-001: [acceptance-fix] RED-GREEN: ship and verify the doctor migration artifact: goal-008: Build, focused doctor/config suites

### [BLOCKING] finding-001 - verification_evidence_missing / evidence

**Scope:** `goal-001`  
**Claim:** The required canonical Test Gate pass is not evidenced.

**Observed**
The caller-supplied canonical Test Gate status is 'not run' with no Test Gate evidence, and the supplied swift-reef-2433 gate artifact is BLOCKED before runner allocation and explicitly states that npm test did not execute.

**Why this matters**
The acceptance-fix goal exists specifically to supply the missing canonical Test Gate pass. Historical focused suites, build, package, lint, format, and RED/GREEN proof do not substitute for the absent caller-owned canonical run reference and passing result.

**Required action**
Run npm test through the caller-owned canonical Test Gate infrastructure and supply a durable provider/run reference with a passing result.

**Evidence**

- test-gate: `canonical Test Gate reference: not run`
- artifact: `plans/checkpoints/swift-reef-2433.test-gate.md:1-34`
- artifact: `plans/checkpoints/swift-reef-2433.checkpoint.md:3-8`

## Context

- Original task: `swift-reef-2433`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Treat this as an evidence-only follow-up. Production-code changes are forbidden by default. You must inspect the parent implementation and evidence first, then supply only the missing acceptance evidence. Escalate only if that inspection lets you document a real implementation defect; in that case, make only the minimal fix with tests.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-08-23_swift-reef-2433_red-green-ship-and-verify-the-doctor-migration-artifact.md` for full context. Focus only on the unmet goals listed above.

## Recent learnings from previous attempt

### swift-reef-2433-provider-preflight-before-canonical-gate.md

```
---
title: "Kanonický gate vyžaduje preflight každého poskytovatele"
date: 2026-08-23
category: tooling
component: ci-cd
tags: [acceptance, test-gate, crabbox, testbox, provenance]
file_type: checklist
---

# Preflight every canonical gate provider before promising a run reference

For evidence-only acceptance retries, verify runner allocation prerequisites before starting the expensive canonical command. OpenClaw can expose three owner-routed paths with distinct failure modes:

- Blacksmith Testbox requires the `blacksmith` executable before Crabbox can allocate a `tbx_...` session.
- Azure C
```

## Implementation session log excerpt (last 50 lines)

```
er-preflight-learning.md" --output "learnings/tooling/swift-reef-2433-provider-preflight-before-canonical-gate.md"
✓ Learning saved to learnings/tooling/swift-reef-2433-provider-preflight-before-canonical-gate.md
[0m
Canonical Test Gate remains blocked before execution:

- Blacksmith: missing `blacksmith` CLI, no `tbx_...` ID.
- Azure: missing Azure CLI/subscription.
- AWS: no usable credentials, no `cbx_...` ID.
- No production or test code changed.
- Evidence: `plans/checkpoints/swift-reef-2433.test-gate.md`
- Checkpoint: `plans/checkpoints/swift-reef-2433.checkpoint.md`
- Learning saved: `learnings/tooling/swift-reef-2433-provider-preflight-before-canonical-gate.md`

An authenticated caller-owned runner must execute `npm test` and provide its durable run reference to satisfy goal-008.

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
