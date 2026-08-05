# [acceptance-fix] [acceptance-fix] Fix Deliberation KM compatibility with Node fetch transport headers: goal-001: The characterized Node `: goal-001: [acceptance-fix] Fix Deliberation KM compatibility with Node fetch tra

Auto-created by the monitor because the original task `swift-reef-7187` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-001: [acceptance-fix] Fix Deliberation KM compatibility with Node fetch transport headers: goal-001: The characterized Node `

### [BLOCKING] finding-001 - required_implementation_missing / correctness

**Scope:** `goal-001`
**Claim:** The authoritative KM listener compatibility behavior was not delivered.

**Observed**
The task checkpoint and TDD proof state that the KM authority was not patched and that an authenticated Node global-fetch health probe against the running listener still received HTTP 400; the supplied diff changes only the OpenClaw mirror, provenance, and consumer tests.

**Why this matters**
Goal 001 requires the characterized Node fetch request to stop receiving HTTP 400 solely because of standard automatic transport metadata, but the listener that enforces the header contract remains unchanged and exhibits the rejected behavior.

**Required action**
Update the KM-owned listener and canonical contract to accept only the supported Sec-Fetch-Mode: cors transport metadata while preserving unknown application-header rejection, then synchronize the consumer mirror from that authority.

**Evidence**

- artifact: `plans/checkpoints/swift-reef-7187.checkpoint.md`
- artifact: `plans/checkpoints/swift-reef-7187.red-green-proof.md`
- file: `extensions/deliberation/contracts/km-wire-v1.json`

### [BLOCKING] finding-002 - required_tdd_proof_missing / evidence

**Scope:** `goal-001`
**Claim:** The caller-required TDD proof lacks a valid GREEN for the delivered compatibility seam.

**Observed**
The proof records a genuine RED and a passing repository loopback test after editing the mirrored allowlist, but its External Listener Verification explicitly reports that the authenticated Node global-fetch request still receives HTTP 400 and says the focused GREEN is not production listener GREEN evidence.

**Why this matters**
With tddRequired true, a fake listener derived from the edited consumer mirror proves mirror synchronization only; it does not provide the required RED-to-GREEN evidence that the authoritative listener now accepts the characterized Node transport metadata.

**Required action**
Preserve the historical RED and capture fresh GREEN evidence from the changed KM listener using Node global fetch, together with the unknown-application-header rejection control, without exposing credentials.

**Evidence**

- artifact: `plans/checkpoints/swift-reef-7187.red-green-proof.md`
- artifact: `plans/checkpoints/swift-peak-4405.red-green-proof.md`
- artifact: `learnings/tooling/swift-reef-7187-mirror-green-is-not-listener-green.md`

## Context

- Original task: `swift-reef-7187`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Use the concrete goals and findings above to repair the untrustworthy task outcome. Make the minimum implementation and test changes needed, and verify the repaired behavior.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-08-02_swift-reef-7187_fix-deliberation-km-compatibility-with-node-fetch-transport.md` for full context. Focus only on the unmet goals listed above.

## Recent learnings from previous attempt

### swift-reef-7187-mirror-green-is-not-listener-green.md

```
---
title: "Mirror GREEN is not listener GREEN"
date: 2026-08-02
category: tooling
component: shared
tags: [external-contract, tdd, live-verification, autoreview]
file_type: rules
---

# Mirror GREEN Is Not Listener GREEN

For a hash-pinned mirror of an externally owned HTTP contract, a focused test that builds its fake listener from the edited mirror is only synchronization proof. It cannot prove the owner listener implements the same allowlist.

Before accepting a transport compatibility fix:

1. Patch and test the owner listener first.
2. Run the real supported client transport against that
```

## Implementation session log excerpt (last 50 lines)

```
ng"
Implementation is blocked by denied access to the KM authority at `~/.openclaw/workspace/km-system`.

- Focused RED/GREEN proof exists: `plans/checkpoints/swift-reef-7187.red-green-proof.md`
- Focused tests: 9/9 passed
- Deliberation suite: 53/53 passed
- TypeScript gate and `pnpm build`: passed
- Formatting and `git diff --check`: passed
- Live authenticated Node fetch probe: still HTTP 400
- Autoreview correctly rejected the locally self-authorized contract mirror
- Lint wrapper was blocked by an unrelated Slack boundary type error
- Learning saved: `learnings/tooling/swift-reef-7187-mirror-green-is-not-listener-green.md`

The checkpoint records the blocker. External-directory access is required to patch and test the authoritative listener before this task can be completed honestly.

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
