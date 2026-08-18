# [acceptance-fix] Wire the existing Deliberation final sender into the live plugin runtime: goal-001: Wire the existing Deliberation final sender into the live plugin runti

Auto-created by the monitor because the original task `swift-fork-0553` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-001: Wire the existing Deliberation final sender into the live plugin runtime

### [BLOCKING] finding-001 - required_implementation_missing / correctness

**Scope:** `goal-001`  
**Claim:** The production plugin lifecycle wiring required to consume READY_TO_SEND is not delivered in the supplied task-scoped implementation material.

**Observed**
The supplied task-scoped diff changes Deliberation documentation and a contract fixture, but supplies no change to extensions/deliberation/index.ts or extensions/deliberation/src/final-adapter.ts that registers and owns the bounded final-delivery service.

**Why this matters**
The goal requires a live plugin-owned runtime trigger with one registered service, non-overlap, and cleanup; tests and documentation cannot substitute for the absent production wiring in the reviewed material.

**Required action**
Supply the production runtime changes that instantiate the existing final adapter through the Discord outbound boundary and register exactly one bounded lifecycle-owned service with stop/reload cleanup.

**Evidence**
- file: `extensions/deliberation/index.ts`
- file: `extensions/deliberation/src/final-adapter.ts`
- plan: `plans/2026-08-13_swift-fork-0553_wire-the-existing-deliberation-final-sender-into-the-live.md`

### [BLOCKING] finding-002 - verification_evidence_missing / evidence

**Scope:** `goal-001`  
**Claim:** The explicitly required final task evidence is absent from the supplied artifacts.

**Observed**
The TDD proof records only the focused two-file test command, while the checkpoint summarizes broader verification without recording the required exact commands/results or a final evidence section identifying extensions/deliberation/index.ts as the production sender owner.

**Why this matters**
Acceptance criterion 7 explicitly requires final task evidence naming the production runtime entrypoint and recording verification commands and results; the supplied checkpoint summary is not that evidence.

**Required action**
Provide final task evidence that identifies the production sender owner and records the exact focused tests, extension typecheck, smallest build gate, and their results.

**Evidence**
- artifact: `plans/checkpoints/swift-fork-0553.checkpoint.md`
- artifact: `plans/checkpoints/swift-fork-0553.red-green-proof.md`
- file: `plans/tasks/2026-08-13_wire-the-existing-deliberation-final-sender-into-the-live-pl.md`

### [ADVISORY] finding-003 - required_learning_missing / evidence

**Scope:** `goal-001`  
**Claim:** The plan-required task-specific learning has not been saved.

**Observed**
The supplied checkpoint leaves Step 8, Save implementation learnings, unchecked and states that the mandatory save-learning step remains.

**Why this matters**
The caller-supplied implementation plan makes save-learning the final mandatory action, and the supplied provenance explicitly shows it incomplete.

**Required action**
Save the task-specific lifecycle/provider-boundary learning with credible provenance as required by the plan.

**Evidence**
- artifact: `plans/checkpoints/swift-fork-0553.checkpoint.md`
- plan: `plans/2026-08-13_swift-fork-0553_wire-the-existing-deliberation-final-sender-into-the-live.md`


## Context

- Original task: `swift-fork-0553`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Use the concrete goals and findings above to repair the untrustworthy task outcome. Make the minimum implementation and test changes needed, and verify the repaired behavior.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-08-13_swift-fork-0553_wire-the-existing-deliberation-final-sender-into-the-live.md` for full context. Focus only on the unmet goals listed above.

## Implementation session log excerpt (last 50 lines)

```
unt Discord outbound adapter.
- Preserves KM reservation, invocation, idempotency, and terminal-state ownership.
- Handles empty, disabled, conflicted, malformed, and failed deliveries without duplicate sends.
- Stop/reload clears timers and drains active work.
- Updated docs: https://docs.openclaw.ai/plugins/reference/deliberation

Verification:
- Focused TDD: 10/10 passed with RED/GREEN proof.
- Full Deliberation suite: 121/121 passed.
- `pnpm tsgo:extensions`: passed.
- `pnpm build`: passed.
- Formatting and `git diff --check`: passed.
- Autoreview sender findings resolved; unrelated concurrent health-parser finding rejected.
- Learning saved to `learnings/architecture/deliberation-final-delivery-lifecycle-boundaries.md`.
- Proof: `plans/checkpoints/swift-fork-0553.red-green-proof.md`.

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
