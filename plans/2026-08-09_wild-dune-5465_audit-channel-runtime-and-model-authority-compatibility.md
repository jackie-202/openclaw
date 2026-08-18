# Plan 2026-08-09: Audit channel runtime and model authority compatibility

Investigate whether current `modelByChannel` behavior preserves the final fork invariant without restoring obsolete runtime state.

*Status: DRAFT*
*Created: 2026-08-09*

## Progress

- [x] Phase 0: Config + init
- [x] Phase 1: Research
- [x] Phase 2: Knowledge
- [x] Phase 3: Synthesis

## Problem

Produce a repository-evidence-only compatibility audit across the named fork revisions and upstream base, ending in one proposal verdict.

## Analysis

### Codebase Context

- The named commits progress from composite `runtimeByChannel` ownership (`9c09c259528`, `f7d039a3575`) through stale automatic-fallback repair (`0529559822f1`) and split authority (`435059f7d634`) to canonical `modelByChannel` plus a model-free supplement (`0b4e3efe7331`).
- Current authority and target matching live in `src/channels/model-overrides.ts`; selection callers span `src/auto-reply/reply/get-reply.ts`, `src/auto-reply/reply/get-reply-native-slash-fast-path.ts`, `src/agents/agent-command.ts`, and `src/status/status-message.ts`.
- Session precedence and stale-state handling live in `src/auto-reply/reply/stored-model-override.ts` and `src/auto-reply/reply/model-selection.ts`; reconstructed status rows are built by `src/gateway/session-utils.ts`.
- Schema, doctor, and rollback-shape evidence must come from `src/config/types.channels.ts`, `src/config/zod-schema.channels-config.ts`, `src/config/validation.ts`, `src/commands/doctor/shared/`, `src/cli/update-cli/update-command-config.ts`, and repository fixtures/tests.
- At base `4b85d834ed1586062f31bded2f358fc5192d1674`, `modelByChannel` remains upstream authority, while ordinary-turn stale-origin repair, Gateway projection, and any replacement for model-free `runtimeByChannel` require explicit comparison.

### Relevant Documentation

- `docs/proposals/proposal-20260724-083714-6c9e68_minimize-channel-runtime-divergence-from-upstream.md` defines the approved ownership model and rollback shape.
- `.architecture-reviews/reports/2026-07-24-option-a-closure.md` proves model authority convergence but records missing migration backup, dry-run, apply, doctor, and rollback evidence.
- `plans/2026-07-22_wild-brook-6696_restore-pre-f7d-channel-runtime-session-behavior-without.md` maps the historical execution and session-lifecycle boundaries.
- `src/channels/AGENTS.md`, `src/agents/AGENTS.md`, and `src/gateway/AGENTS.md` require full caller/sibling coverage without introducing plugin-runtime discovery into hot paths.

### Knowledge Base

- `learnings/architecture/channel-runtime-profile-execution-precedence.md` requires checking normal and native-slash execution and separating model, reasoning, thinking, and verbosity owners; its old runtime-first model precedence must be treated as superseded by the approved proposal.
- The recalled 2026-07-24 learnings reinforce one configuration authority, explicit retired-key validation, and separation of model selection from supplemental settings.
- Recall backend: local fallback; collection `openclaw-fork-learnings` was unavailable.

## Available Skills

- `compound-plan`: structure and persist this investigation plan.
- `recall-knowledge`: retrieve applicable repository learnings before synthesis.
- `save-learning`: record planning-session learnings as the final action.

## Solution

Build one evidence matrix from immutable repository revisions, trace each scenario through configuration, session, and status owners, then issue one bounded compatibility verdict. Treat absent migration artifacts as unknown rather than inferred success.

## Investigation Steps

1. **Reproduce:** use read-only `git show` at `9c09c259528`, `f7d039a3575`, `0529559822f1`, `435059f7d634`, `0b4e3efe7331`, and `4b85d834ed1586062f31bded2f358fc5192d1674` to populate a scenario table for persisted config, fresh session, existing session, explicit turn/session override, changed channel default, stale automatic fallback, unavailable/disallowed provider or model, and status/Gateway output. Cite source plus adjacent tests/fixtures for every cell; do not execute tests.
2. **Trace:** follow `resolveChannelModelOverride()` from schema and target matching through regular reply, native slash, agent-command, first-turn dispatch, stored override, model selection, status attribution, and reconstructed Gateway rows. Record precedence and ownership separately for model, thinking, reasoning, verbosity, session overrides, fallback-origin metadata, and runtime history.
3. **Diagnose:** compare final-fork and base behavior per scenario; inspect doctor/update migrations and repository fixtures for the documented 11-model/10-supplement rollback shape. State what can be proven about moving profile `model` values to `modelByChannel`, preserving model-free fields, conflict handling, stale-state repair, and base validation; explicitly mark missing backup/dry-run/apply/doctor/rollback proof. Explain `runtimeByChannel` disappearance from provenance and field ownership, not from live state.
4. **Write report:** before writing, run `python3 scripts/investigation-path.py --task-id wild-dune-5465 --project . --touch` if the helper exists. If absent, create `plans/investigations/` and write `plans/investigations/wild-dune-5465_audit-channel-runtime-and-model-authority-compatibility.md`. Include the scenario table, commit-by-commit invariant, migration assessment, evidence gaps, and exactly one line formatted `Proposal verdict: <verdict> (confidence: <level>)`, supported by repo-root file/line or revision citations. Do not add competing verdicts elsewhere.

## Files to Modify

| File | Change |
| --- | --- |
| Path returned by `scripts/investigation-path.py`, otherwise `plans/investigations/wild-dune-5465_audit-channel-runtime-and-model-authority-compatibility.md` | Add the repository-evidence-only investigation report. |

No source, test, fixture, task, live-config, or external-repository file may be modified.

## TDD: skip

This investigation produces a source-audit report and explicitly forbids test execution or code changes.

## Dependencies

- All six named revisions and their repository-local tests, fixtures, plans, proposal, and architecture-review evidence must remain readable.
- Scope excludes actual live config, external repositories, code edits, test execution, and Git lifecycle mutations; read-only historical inspection is permitted.
- The verdict must distinguish current upstream model authority from fork-only supplemental state and must not recommend reviving `runtimeByChannel[*][*].model`.
