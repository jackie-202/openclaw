# Plan 2026-08-09: Audit cron trajectory suppression compatibility across fork and upstream

Perform a repository-only behavioral audit at the three pinned commits and produce one evidence-backed compatibility verdict.

## Progress

- [x] Phase 0: Config + init
- [x] Phase 1: Research
- [x] Phase 2: Knowledge
- [x] Phase 3: Synthesis

## Analysis

### Codebase context

- `b0da725a110f` adds `CronAgentTurnPayload.trajectory`, defaults omission to enabled, propagates it as `trajectoryEnabled`, and suppresses recorder construction only for `false`.
- `7dd48ebcb8db:src/trajectory/runtime.ts` changes queued-writer diagnostic typing and formatting; its trajectory portion must be evaluated separately from cron suppression.
- `4b85d834ed1586062f31bded2f358fc5192d1674:src/agents/embedded-agent-runner/run/params.ts` exposes generic `disableTrajectory`, and `run/attempt-trajectory.ts` enforces it, but the pinned `src/cron/types.ts` and `src/cron/isolated-agent/run-executor.ts` do not directly source or pass that flag.
- Current cron execution has nested attempt surfaces: model fallback in `src/cron/isolated-agent/run-executor.ts`, `LiveSessionModelSwitchError` retries, embedded-run terminal/recovery retries, Codex-harness trajectory setup in `run/attempt-dispatch-preparation.ts`, and restricted settled-turn finalization in `src/agents/harness/builtin-openclaw.ts`.
- Compatibility evidence must include cron API/schema normalization and persistence, not only TypeScript fields: inspect cron protocol schemas, `src/cron/service/normalize.ts`, `src/cron/normalize.ts`, and `src/cron/store/payload-codec.ts` at each relevant commit.

### Relevant documentation

- `docs/proposals/proposal-20260809-165021-f994b3_openclaw-upstream-sync-compatibility-review.md` defines the allowed verdicts and requires call-path plus cron/retry/normal-run evidence.
- `docs/tools/trajectory.md` defines default-on capture and the global `OPENCLAW_TRAJECTORY=0` behavior.
- `plans/2026-05-03_warm-fork-9899_add-trajectory-opt-out-field-to-cron-agentturn-payload.md` records the original fork intent and expected default semantics.
- `plans/tasks/2026-07-18_remove-fork-trajectory-batched-writer-and-cron-opt-out.md` records later fork history but is contextual evidence, not authority for the pinned comparison.

### Knowledge base

- `learnings/architecture/2026-07-28_residue-audits-require-activation-proof.md`: build an activation ledger from source through executable callers; names and literal matches are inventory, not equivalence proof.
- `learnings/architecture/2026-07-28_wire-protocol-versions-are-not-implementation-generations.md`: separate manifest/schema, normalization, runtime registration, side-effect authority, and naming semantics.
- Recall used local fallback because QMD collection `openclaw-fork-learnings` was absent; the remaining returned architecture learnings contained no additional actionable detail for this audit.

## Available Skills

- `compound-plan`: owns this plan structure and canonical plan path.
- `recall-knowledge`: supplied repository learnings before synthesis.
- `save-learning`: capture the planning-session compatibility-audit lesson after the plan is complete.

## Solutions

Use a commit-pinned activation ledger rather than diff-name matching. Record each scenario's source/default, propagation fields, retry behavior, enforcement point, persisted/API shape, and observable recorder outcome for fork and upstream; classify unknowns explicitly when repository evidence cannot prove runtime behavior.

## Implementation

### Investigation steps

1. **Reproduce:** Reconstruct the fork behavior from `b0da725a110f^..b0da725a110f` and the trajectory hunk of `7dd48ebcb8db` with read-only `git show`/`git grep`. Inventory the changed production symbols and existing tests, then state the exact expected outcomes for `trajectory: false`, `true`, omitted, global disable, and non-`agentTurn` payloads without executing tests.
2. **Trace:** At both fork and upstream commits, follow scheduler/service admission through main, current, named-session, and isolated targets; classify command/script/system-event paths as applicable or unaffected. For agent turns, trace `runCronIsolatedAgentTurn` -> preparation -> `executeCronRun` -> `runWithModelFallback` -> `runEmbeddedAgent` -> attempt dispatch -> recorder creation/flush. Trace model fallback, `LiveSessionModelSwitchError`, terminal/recovery retries, hook-claimed runs, OpenClaw and Codex harnesses, and settled-turn finalization, recording every parameter boundary where suppression is preserved, reset, or absent.
3. **Diagnose:** Compare behavior rather than flag names. Build a scenario matrix covering fork payload values, upstream `disableTrajectory` callers, each cron target, first attempt and every retry class, interactive/user/manual/heartbeat runs, global env disable, hook-claimed runs, harness choice, and omitted/legacy persisted payloads. Audit protocol schemas, add/update normalization, store codecs, unknown-field handling, and migration/doctor behavior to determine whether existing `trajectory` payloads are accepted, retained, ignored, or rejected. Isolate whether `7dd48ebcb8db` changes suppression semantics or only the queued-writer diagnostics contract.
4. **Write report:** Before writing, run `python3 scripts/investigation-path.py --task-id cool-peak-0348 --project . --touch` only if that helper exists. It is currently absent, so create `plans/investigations/` if needed and write `plans/investigations/cool-peak-0348_audit-cron-trajectory-suppression-compatibility.md`. Include commit-pinned call-path diagrams/tables, the scenario matrix, payload/config compatibility findings, and evidence citations as repo-root paths with commit IDs and line/symbol references. End with exactly one proposal verdict from the proposal's five allowed values, followed by confidence, gaps, and cited evidence; do not append text after that ending block.

## Files to Modify

| File | Change |
| --- | --- |
| `plans/investigations/cool-peak-0348_audit-cron-trajectory-suppression-compatibility.md` | Create the final call-path comparison, scenario matrix, and single-verdict report. |

Production files, tests, task files, configuration, and Git state remain unchanged.

## TDD: skip

This is a read-only diagnostic investigation, and the scope explicitly forbids test execution or product changes.

## Dependencies

- Repository objects for `b0da725a110f`, `7dd48ebcb8db`, and `4b85d834ed1586062f31bded2f358fc5192d1674` must remain locally readable.
- Evidence is limited to repository source, tests, history, plans, and proposal text; no external repositories, live config, production data, test runs, or Git lifecycle operations.
- Existing tests may be cited as contract evidence, but their presence is not runtime proof and no pass/fail claim may be made without execution.

---
*Created: 2026-08-09*
*Status: DRAFT*
