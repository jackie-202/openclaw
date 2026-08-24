# Plan 2026-08-22: Audit OpenClaw deliberation remediation and rollout safety

Read-only investigation plan for a strict repository-local rollout verdict.

_Status: DRAFT_
_Created: 2026-08-22_

---

## Progress

- [x] Phase 0: Config + Init
- [x] Phase 1: Research
- [x] Phase 2: Knowledge
- [x] Phase 3: Synthesis

## Problem

Establish whether every repository-local blocker from the prior deliberation audit is directly closed, while separating live KM, configuration, and pilot facts as external unknowns.

## Analysis

### Codebase Context

- Prior blocker ledger: `plans/investigations/quick-wave-9858_audit-openclaw-deliberation-pipeline-routing-and-delivery-safety.md`.
- Intake ownership path: `extensions/deliberation/src/intake.ts`, provider monitors, and `src/auto-reply/reply/dispatch-from-config.ts`; verify ownership before debounce, auto-threading, fast abort, and dispatch.
- Delivery path: `extensions/deliberation/src/final-adapter.ts`, `extensions/deliberation/index.ts`, Discord/Slack outbound adapters and native send helpers; count feature calls, adapter calls, and native attempts separately.
- Routing/history/lifecycle path: `route-match.ts`, `history-read.ts`, `thread-identity-store.ts`, and `km-client.ts`; verify exact source, target, attempt, completion, and receipt identity.
- Contract/config path: `contracts/km-wire-v1.json`, `cutover-controls-v1.json`, `provenance.json`, `config.ts`, `config-compat.ts`, and `doctor-contract-api.ts`.
- Current evidence indicates two direct gates requiring explicit diagnosis: the wire mirror still describes 60-second multi-message bursts, and the unchanged 23-scenario owner-runtime integration has no GREEN.

### Relevant Documentation

- `docs/proposals/proposal-20260820-203458-161e2c_per-source-deliberation-pipelines-with-source-default-delivery.md` defines separate intake, silence, immutable targets, one attempt/message/receipt, bounded migration, integration, and pilot criteria.
- Remediation checkpoints: `bold-brook-3323`, `quick-peak-4528`, `warm-peak-2671`, `quick-peak-6750`, `calm-cove-1824`, `bold-wave-3956`, and `bold-peak-4880` under `plans/checkpoints/`.
- The current worktree is heavily dirty; the audit must record the exact SHA/status and avoid attributing unrelated changes or relying on checkpoint summaries alone.

### Knowledge Base

- `learnings/architecture/quick-wave-9858-source-ownership-precedes-inbound-transforms.md`: trace authenticated provider events across every preprocessing and fast-output boundary.
- `learnings/architecture/quick-wave-9858-audit-abstraction-and-fixture-boundaries.md`: validate fixtures semantically; inspect retries/fallbacks below wrappers; hashes do not prove deployment convergence.
- `learnings/architecture/2026-07-28_residue-audits-require-activation-proof.md`: use an activation/caller/callee ledger, not literal inventory alone.
- `learnings/architecture/2026-07-29_acceptance-fix-plans-must-close-contract-gates-explicitly.md`: prior fail-closed or RED evidence is not completion.
- Knowledge search used local fallback because QMD collection `openclaw-fork-learnings` was unavailable; this is not an audit blocker.

## Available Skills

- `openclaw-testing`: choose narrow reruns only when recorded proof is stale, missing, or contradictory.
- `task-evidence`: recover exact historical commands/results when checkpoint summaries are insufficient.
- `code-review`: apply an exhaustive review ledger across changed surfaces if source and tests disagree.
- `write-review-report`: not used because the mandated deliverable is the task-specific investigation report path below.

## Solutions

Use one acceptance ledger keyed to the eight remediation items in the prior audit. For each item, record the contract requirement, current entry point, owner boundary, caller/callee chain, sibling path, positive and negative tests, historical command/result, current contradiction, and conclusion. Mark an item closed only when current source and repository-local evidence agree.

## Investigation

1. **Reproduce:** Capture `git rev-parse HEAD`, `git status -sb`, and the current audit timestamp. Read the prior audit, proposal acceptance criteria, remediation plans, checkpoints, and RED/GREEN artifacts. Build the ledger with separate rows for intake identity, source suppression, routing/history, native attempts/messages, completion/receipts, fixtures, legacy migration, and integration. Use `task-evidence` when a checkpoint omits the exact command or outcome. Treat a checkpoint assertion as historical evidence, not fresh proof.
2. **Trace:** Follow each row end to end through current source and tests. Trace provider event to pre-transform ownership and one intake; source route to immutable pipeline/target and exact Discord/Slack history; final reservation to feature call, adapter call, native API attempt, one message, and receipt; ambiguous outcomes through poll/recovery; raw legacy config through doctor writeback into canonical runtime parsing; and each fixture exchange through its referenced closed schema. Check sibling ordinary Discord/Slack paths to prove retries, fallback, and chunking remain excluded only from Deliberation.
3. **Diagnose:** Compare current source with the recorded focused and composed evidence. Rerun only a missing, stale, unreadable, or contradictory gate using the narrowest applicable repository command, such as `pnpm test extensions/deliberation/src/delivery-composition.test.ts extensions/deliberation/src/hooks.test.ts extensions/deliberation/src/history-read.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/contract.test.ts extensions/deliberation/src/config-compat.test.ts -- --reporter=verbose`; add the Discord/Slack monitor, outbound, and dispatch tests only for unresolved cross-boundary rows. Run `pnpm build` only if no current complete-build artifact covers the exact audited worktree. Do not rerun the external KM harness unless an already-approved repository-local owner revision and unchanged 23-scenario command are available; otherwise preserve the recorded `12 passed, 11 failed` result as an unresolved integration blocker. Explicitly determine whether the 60-second multi-message burst contract contradicts one item per provider event, whether unknown delivery can ever be retried, whether `openclaw doctor --fix` has real discovery/writeback proof, and whether test-type failures remain on touched surfaces.
4. **Write report:** Immediately before writing, run `python3 scripts/investigation-path.py --task-id warm-cove-4137 --project . --touch` if the helper exists and write only to its returned path. If it is absent, create `plans/investigations/` if needed and write `plans/investigations/warm-cove-4137_audit-openclaw-deliberation-remediation-and-rollout-safety.md`. Include scope/SHA/worktree state, a strict `SAFE` or `NOT SAFE` verdict, the completed ledger, exact commands/results, repository-local blockers, and external unknowns. Return `SAFE` only when every repository-local row is directly closed; otherwise keep migration/pilot blocked and provide task-ready residual remediation with owning paths and required proof. Do not edit production code, fixtures, tests, docs, live configuration, KM state, or external systems.

## Files to Modify

| File                                                                                                                                                              | Change                                     |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Path returned by `scripts/investigation-path.py`, or `plans/investigations/warm-cove-4137_audit-openclaw-deliberation-remediation-and-rollout-safety.md` fallback | Write the sole read-only audit deliverable |

## TDD: skip

The output is an evidence-based investigation report; existing tests may be rerun for proof, but no behavior or test code is implemented.

## Dependencies

- Current OpenClaw checkout, prior audit, proposal, remediation checkpoints, and proof artifacts.
- Repository test dependencies only when a recorded gate is missing, stale, unreadable, or contradictory.
- No live credentials, configuration mutation, KM mutation, deployment, restart, or pilot authorization.
