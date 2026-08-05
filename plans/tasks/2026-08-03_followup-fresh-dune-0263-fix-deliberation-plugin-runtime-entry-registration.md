# [acceptance-fix] Fix Deliberation plugin runtime entry registration: goal-001: `openclaw plugins list --json` against the built checkout reports Deli

Auto-created by the monitor because the original task `swift-brook-0038` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-001: `openclaw plugins list --json` against the built checkout reports Deliberation with expected hooks (not `hookCount: 0`).
- goal-003: Composed pilot-channel ingress produces a canonical KM intake request and remains terminal/fail-closed.
- goal-004: Existing Deliberation tests and relevant loader/runtime tests pass.
- goal-005: Final note specifies exact build and Gateway restart steps needed to activate the fix.

### [BLOCKING] finding-001 - verification_evidence_missing / evidence

**Scope:** `goal-001`
**Claim:** The required built-checkout plugin inventory result is not demonstrated.

**Observed**
The supplied materials contain a checkpoint assertion that a list smoke ran, but no command result or artifact showing Deliberation's built-checkout plugins-list record with four hook names and a nonzero hookCount.

**Why this matters**
Goal 001 explicitly requires the built checkout's JSON inventory behavior; the registration TDD proof exercises the runtime registry instead and does not establish the CLI inventory result.

**Required action**
Supply canonical evidence from the built checkout showing openclaw plugins list --json reports Deliberation with all four expected hooks and hookCount 4.

**Evidence**

- artifact: `plans/checkpoints/swift-brook-0038.checkpoint.md`
- artifact: `plans/checkpoints/swift-brook-0038.red-green-proof.md`

### [BLOCKING] finding-002 - verification_evidence_missing / evidence

**Scope:** `goal-003`
**Claim:** Canonical terminal and fail-closed pilot-channel ingress behavior is not demonstrated by the supplied material.

**Observed**
No supplied implementation diff or explicit artifact shows a composed Discord pilot-channel event producing sourceTarget discord:channel:<channelId>, stopping ordinary dispatch after durable intake, and remaining fail-closed on KM failure.

**Why this matters**
The built-loader RED/GREEN proof establishes hook registration only; it does not exercise or prove the composed ingress behavior required by goal 003.

**Required action**
Supply the canonical composed-ingress evidence demonstrating canonical KM intake, terminal handling after successful durable intake, and fail-closed behavior on intake failure.

**Evidence**

- artifact: `plans/checkpoints/swift-brook-0038.red-green-proof.md`
- plan: `plans/2026-08-03_swift-brook-0038_fix-deliberation-plugin-runtime-entry-registration.md`

### [BLOCKING] finding-003 - verification_evidence_missing / evidence

**Scope:** `goal-004`
**Claim:** Passing Deliberation and relevant loader/runtime test evidence is absent.

**Observed**
The canonical Test Gate status is not run and has no evidence; the only supplied executable proof is the focused built-plugin singleton command, not the existing Deliberation and relevant loader/runtime test set.

**Why this matters**
Goal 004 explicitly requires those tests to pass, and no supplied canonical Test Gate reference or equivalent artifact establishes that result.

**Required action**
Provide canonical Test Gate evidence that the required existing Deliberation and relevant loader/runtime tests pass.

**Evidence**

- test-gate: `not-run`
- artifact: `plans/checkpoints/swift-brook-0038.red-green-proof.md`

### [BLOCKING] finding-004 - required_artifact_missing / correctness

**Scope:** `goal-005`
**Claim:** The required final activation note is missing.

**Observed**
The supplied plan proposes pnpm build, pnpm openclaw gateway restart, and pnpm openclaw gateway status --deep, but no final implementation note supplies those exact activation steps or the warning that rebuilding without restart leaves the process-stable registry unchanged.

**Why this matters**
Goal 005 requires these instructions in the final note; a draft plan is not the required final deliverable, and the supplied completion checkpoint does not contain them.

**Required action**
Add a final implementation note specifying pnpm build, pnpm openclaw gateway restart, pnpm openclaw gateway status --deep, and that a restart is required to activate the rebuilt plugin registry.

**Evidence**

- plan: `plans/2026-08-03_swift-brook-0038_fix-deliberation-plugin-runtime-entry-registration.md`
- artifact: `plans/checkpoints/swift-brook-0038.checkpoint.md`

## Context

- Original task: `swift-brook-0038`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Use the concrete goals and findings above to repair the untrustworthy task outcome. Make the minimum implementation and test changes needed, and verify the repaired behavior.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-08-03_swift-brook-0038_fix-deliberation-plugin-runtime-entry-registration.md` for full context. Focus only on the unmet goals listed above.

## Previous attempt: acceptance context

**Already done (do NOT redo):**

- goal-002: A test loading `dist/extensions/deliberation/index.js` via the runtime loader proves registration runs.

## Recent learnings from previous attempt

### swift-brook-0038-separate-plugin-inventory-from-runtime-proof.md

```
---
title: "Separate plugin inventory metadata from runtime activation proof"
date: 2026-08-03
category: architecture
component: tooling
tags: [plugins, manifest, runtime, activation, testing]
file_type: rules
---

# Separate plugin inventory metadata from runtime activation proof

`openclaw plugins list --json` uses the manifest-only snapshot path in `src/plugins/status-snapshot.ts`. It deliberately does not import plugin runtime modules, so empty runtime-derived fields such as `hookCount` do not prove that a plugin's `register(api)` failed.

For hook-only bundled plugins, verify three surfac
```

## Implementation session log excerpt (last 50 lines)

````
tup, loader, status, manifest, and ingress regression coverage.
- Isolated `plugins list --json` reported `hookCount: 4` with all expected names.

Verification passed:

- Focused tests: 396 tests across four shards.
- `pnpm build`
- `pnpm test:build:singleton`
- `pnpm tsgo:core`
- `pnpm tsgo:core:test`
- Core/scripts/docs lint and MDX checks.
- RED/GREEN proof: `plans/checkpoints/swift-brook-0038.red-green-proof.md`
- Learning: `learnings/architecture/swift-brook-0038-separate-plugin-inventory-from-runtime-proof.md`

To activate in the managed Gateway:

```bash
pnpm build
pnpm openclaw gateway restart
pnpm openclaw gateway status --deep
````

Rebuilding without restarting leaves the process-stable plugin registry unchanged.

Manifest documentation: https://docs.openclaw.ai/plugins/manifest

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
```
