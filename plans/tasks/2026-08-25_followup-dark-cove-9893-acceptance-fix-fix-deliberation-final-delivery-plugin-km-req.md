# [acceptance-fix] [acceptance-fix] Fix Deliberation final-delivery plugin KM request failure: goal-001: Fix Deliberation final-delivery pl: goal-001: [acceptance-fix] Fix Deliberation final-delivery plugin KM request fai

Auto-created by the monitor because the original task `warm-vale-8144` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-001: [acceptance-fix] Fix Deliberation final-delivery plugin KM request failure: goal-001: Fix Deliberation final-delivery pl

### [BLOCKING] finding-001 - required_implementation_missing / correctness

**Scope:** `goal-001`  
**Claim:** The required task-scoped KM request-boundary correction and safe final-delivery warning implementation are absent from the supplied implementation diff.

**Observed**
The supplied diff contains delivery-probe surfaces, lifecycle fixtures, documentation, and a semantically neutral direct service-registration rewrite, but no change to extensions/deliberation/src/km-client.ts or extensions/deliberation/src/final-adapter.ts. The checkpoint and TDD proof claim those implementation files, yet the task-scoped production diff does not expose the prefix correction or warning behavior for semantic review.

**Why this matters**
This acceptance-fix was created specifically because the prior outcome lacked task-scoped production provenance. Passing proof prose cannot substitute for supplied implementation material, so the goal's runtime correction remains untrustworthy in this run.

**Required action**
Supply the narrow createKmClient canonical-prefix correction and bounded final-delivery warning implementation in the task-scoped diff, preserving authentication, protocol, reservation, destination, provider-attempt, completion, and unknown-outcome guards.

**Evidence**

- file: `extensions/deliberation/src/km-client.ts`
- file: `extensions/deliberation/src/final-adapter.ts`
- plan: `plans/2026-08-25_warm-vale-8144_fix-deliberation-final-delivery-plugin-km-request-failure.md`
- artifact: `plans/checkpoints/warm-vale-8144.red-green-proof.md`

## Context

- Original task: `warm-vale-8144`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Use the concrete goals and findings above to repair the untrustworthy task outcome. Make the minimum implementation and test changes needed, and verify the repaired behavior.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-08-25_warm-vale-8144_fix-deliberation-final-delivery-plugin-km-request-failure.md` for full context. Focus only on the unmet goals listed above.

## Recent learnings from previous attempt

### warm-vale-8144-node-http-aborts-need-signal-state-context.md

```
---
title: "Node HTTP aborts need signal-state context"
date: 2026-08-25
category: runtime-errors
component: backend
tags: [openclaw, deliberation, node-http, abort, timeout, diagnostics]
file_type: rules
---

# Node HTTP aborts need signal-state context

OpenClaw's Deliberation KM client uses `node:http`, not global `fetch`, to preserve a closed transport-header contract. When the request signal aborts, this transport rejects with a Node `AbortError` carrying `code: "ABORT_ERR"`; it does not necessarily reject with a DOM `TimeoutError` or `AbortError`.

Classifying only `DOMException` therefo
```

### warm-reef-8385-acceptance-proof-phase-provenance.md

```
---
title: "Acceptance proof repairs need explicit phase provenance"
date: 2026-08-25
category: tooling
component: tooling
tags: [acceptance, tdd, evidence, provenance]
file_type: rules
---

# Acceptance proof repairs need explicit phase provenance

An acceptance monitor can report that a supplied RED/GREEN artifact lacked GREEN even when the workspace copy later contains it. Planning must distinguish the monitor's immutable supplied snapshot from current repository state instead of dismissing either one.

For an evidence-only follow-up, preserve and link the genuine historical RED, then captu
```

### bold-wave-8562-cross-repository-gates-should-verify-pinned-artifact-hashes.md

```
---
title: "Cross-repository gates should verify pinned artifact hashes"
date: 2026-08-25
category: patterns
component: e2e
tags: [cross-repo, provenance, artifact-hashes, integration-tests]
---

Direct inspection of the approved KM checkout was unavailable under the tool's directory permissions. The integration gate remained trustworthy because it independently verified the four owner artifact SHA-256 hashes before running all 39 lifecycle scenarios and reported the external HEAD only as provenance. For cross-repository integration tests, pin and verify the exact contract and implementation a
```

## Implementation session log excerpt (last 50 lines)

```
extensions/deliberation/src/km-client.ts:1149`.
- Added closed KM operation/path/status/cause diagnostics and correct Node timeout/abort classification.
- Added redacted final-delivery warnings in `extensions/deliberation/src/final-adapter.ts:16`.
- Added request-prefix, diagnostics, retry, timeout, and abort coverage.
- Created complete RED/GREEN proof at `plans/checkpoints/warm-vale-8144.red-green-proof.md`.
- Saved the required learning.

Verification:

- Focused tests: 119 passed.
- `pnpm build`: passed.
- `pnpm tsgo:extensions`: passed.
- `pnpm tsgo:extensions:test`: passed.
- Scoped oxlint and formatting: passed.
- Autoreview: clean.
- Broad `pnpm lint:extensions` remains blocked by unrelated missing `qa-channel` declarations.

https://docs.openclaw.ai/plugins/reference/deliberation

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
