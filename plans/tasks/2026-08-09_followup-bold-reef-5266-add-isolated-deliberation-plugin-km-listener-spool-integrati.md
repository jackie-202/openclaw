# [acceptance-fix] Add isolated Deliberation plugin → KM listener → spool integration harness: goal-008: Existing Deliberation TypeScript tests and focused KM listener/wire/sp

Auto-created by the monitor because the original task `cool-vale-3921` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- goal-008: Existing Deliberation TypeScript tests and focused KM listener/wire/spool tests remain green.

### [BLOCKING] finding-001 - verification_evidence_missing / evidence

**Scope:** `goal-008`  
**Claim:** Canonical evidence is required that the existing Deliberation TypeScript tests and focused KM listener/wire/spool tests remain green.

**Observed**
The caller states that Test Gate was not run and that no canonical Test Gate evidence exists; the supplied checkpoint contains only agent-authored verification prose.

**Why this matters**
Goal 008 is an explicit test-artifact goal, and the caller limits its assessment to supplied artifacts plus the canonical Test Gate reference. Without canonical Test Gate evidence, the required unchanged-suite validation is unproven.

**Required action**
Provide canonical Test Gate evidence for the existing Deliberation TypeScript tests and focused KM listener/wire/spool tests.

**Evidence**

- test-gate: `caller-supplied status: not run; no Test Gate evidence exists`
- artifact: `plans/checkpoints/cool-vale-3921.checkpoint.md`

## Context

- Original task: `cool-vale-3921`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Treat this as an evidence-only follow-up. Production-code changes are forbidden by default. You must inspect the parent implementation and evidence first, then supply only the missing acceptance evidence. Escalate only if that inspection lets you document a real implementation defect; in that case, make only the minimal fix with tests.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-08-09_cool-vale-3921_add-isolated-deliberation-plugin-km-listener-spool.md` for full context. Focus only on the unmet goals listed above.

## Previous attempt: acceptance context

**Already done (do NOT redo):**

- goal-001: One command starts no full Gateway and contacts no Discord/provider.
- goal-002: The real TypeScript intake serializer/client talks to the real Python HTTP listener and writes the real spool implementation.
- goal-003: The concrete `.252Z` case succeeds and persists `.252000Z` canonically.
- goal-004: Duplicate submission remains one record.
- goal-005: Malformed input fails without spool mutation.
- goal-006: A production-path attempt is rejected before SQLite open; production spool remains byte/mtime unchanged.
- goal-007: Listener process and temporary files are cleaned after pass and fail paths.

## Recent learnings from previous attempt

### cross-repository-spool-tests-guard-every-constructor.md

```
---
title: "Cross-repository spool tests need guards at every constructor boundary"
date: 2026-08-09
category: architecture
component: e2e
tags: [deliberation, integration-tests, sqlite, process-cleanup, path-isolation]
file_type: checklist
---

# Cross-repository spool tests need guards at every constructor boundary

An integration listener can reject production paths correctly while a test-only setup or inspection probe still opens the production database first. Any helper that constructs `DeliberationSpool(root)` must independently validate the resolved test root, sentinel, containment, and
```

## Implementation session log excerpt (last 50 lines)

```
cool-vale-3921.red-green-proof.md`
- Saved learning at `learnings/architecture/cross-repository-spool-tests-guard-every-constructor.md`

**Verification**
- Integration command: 4 passed
- KM listener/wire/spool: 90 passed
- Deliberation typecheck: passed
- `pnpm build`: passed
- Formatting: passed
- Missing KM checkout: actionable nonzero `plugin:` failure
- Scoped autoreview: clean, no actionable findings
- Deliberation suite: 103 passed, 2 unrelated existing reservation-schema failures
- Extension lint: blocked by unrelated Slack `primeChannelOutboundSendMock` export error

The harness verifies `.252Z` to `.252000Z`, authenticated loopback HTTP, exact spool contents, duplicate suppression, malformed-request immutability, production-spool rejection, and cleanup after success and failure.

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
