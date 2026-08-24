# Plan 2026-08-23: Audit warm-cove-4137 remediation completeness and rollout readiness

Audit the post-baseline remediation from current repository state, executable evidence, and Git provenance without changing runtime or task state.

## Analysis

### Codebase context

- `plans/investigations/warm-cove-4137_audit-openclaw-deliberation-remediation-and-rollout-safety.md` supplies the nine residual obligations and exact prior failures.
- Reconstruct four lineages from root plans through task files, checkpoint/evidence/RED-GREEN files, and `plans/checkpoints/acceptance-runs/**/{manifest,result,working}.json`: `dark-wave-6899 -> swift-cove-5006`, `warm-mist-6808 -> calm-crag-4037 -> cool-wave-8905`, `cool-reef-8673 -> swift-reef-2433 -> warm-fork-8061`, and `fresh-peak-7129 -> bold-reef-6539 -> dark-crag-3048`.
- Ownership proof spans `src/plugins/hooks.ts`, `src/plugin-sdk/channel-inbound.ts`, Discord/Slack monitor paths, and `src/auto-reply/reply/dispatch-from-config.ts`; direct helper tests cannot prove pre-side-effect ownership.
- Intake/delivery proof spans `extensions/deliberation/src/{intake,km-client,final-adapter}.ts`, `extensions/deliberation/contracts/{km-wire-v1,cutover-controls-v1}.json`, composition tests, and `extensions/deliberation/scripts/km-listener.cross-repo.ts`.
- Migration proof spans `extensions/deliberation/doctor-contract-api.ts`, `src/config-compat.ts`, doctor registry/call paths, bundled-entry collection, and `test/scripts/deliberation-doctor-package.e2e.test.ts`; tracked/package presence must be re-proven for the audited checkout.
- Owner convergence is reported in `plans/checkpoints/fresh-peak-7129.rollout-readiness.md`; reporter totals, local mirrors, and hashes do not certify the 23 named behaviors.

### Relevant documentation

- `docs/proposals/proposal-20260820-203458-161e2c_per-source-deliberation-pipelines-with-source-default-delivery.md` defines immutable routing, one-event intake, source silence, no fallback, migration, and pilot acceptance.
- `docs/plugins/reference/deliberation.md`, `docs/plugins/hooks.md`, and `extensions/deliberation/README.md` must agree with executable behavior; document claims are not proof by themselves.
- Root and scoped `AGENTS.md` require activation-path proof, canonical-only runtime config, packaged doctor migration proof, and direct owner-runtime evidence for dependency-backed behavior.

### Knowledge base

- `learnings/architecture/2026-07-28_residue-audits-require-activation-proof.md`: trace every stale contract/fallback match through registration, importer, caller, and activation status.
- Existing remediation learnings require ownership tests through loader-backed channel paths, unknown outcomes to remain non-reservable, installed-package doctor verification, and named owner-runtime leaves rather than aggregate totals.
- Recall used deterministic local fallback because collection `openclaw-fork-learnings` was unavailable; unrelated auto-extracted stubs add no audit rule.

## Available Skills

- `task-evidence`: recover exact commands and outcomes from predecessor/checkpoint lineage without converting missing output into success.
- `openclaw-testing`: choose the smallest valid repository-local focused and composed checks; do not run broad local gates that fan out.
- `technical-documentation`: keep the final evidence ledger concise and source-linked.
- `save-learning`: run last after the investigation report is complete.

## Investigation Approach

### 1. Reproduce

1. Record `git rev-parse HEAD`, `git status -sb`, `git diff --stat`, `git diff --check`, and the audit timestamp; distinguish tracked, untracked, staged, and historical/orphaned artifacts without modifying them.
2. Read the baseline report, proposal, four root task/plan chains, every same-slot follow-up, acceptance manifest/result, checkpoint, evidence file, RED-GREEN proof, and test-gate record. Use `task-evidence` where a final artifact cites omitted parent output.
3. Query `git log --all`, `git log -S`, and `git fsck --full --unreachable --no-reflogs` for the batch name, task IDs, `settled_unsuccessful`, and cited commits. Treat terminal classification as bookkeeping unless repository artifacts independently identify its obligations and results.
4. Inventory current tracked/build/package status with `git ls-files`, `collectBundledPluginBuildEntries()`, and cited orphan commit inspection; never infer current readiness from historical GREEN at another tree.

### 2. Trace

1. Build one lineage table per root with task/follow-up ID, claimed status, current commit applicability, exact command/exit, behavioral assertion, canonical-gate reference, supersession reason, and contradiction.
2. Trace exclusive policy from authenticated Discord/Slack events through owner attribution and targeted claim to ack, typing, auto-thread, room/system event, command/fast-abort, ordinary dispatch, streaming, and fallback exits. Include success, disabled, empty, KM failure, intake rejection, and root/child paths.
3. Trace provider event identity through intake and durable contract. Search for burst/debounce/`messages[]` authority and prove whether history remains context-only and two same-window events retain independent item IDs/deadlines.
4. Trace every ready/reserve/invoke/complete transition. Verify unknown/ambiguous outcomes remain durably non-reservable across lease expiry/restart, any new attempt requires authoritative `NOT_SENT`, terminal failure excludes transport ambiguity, and every historical attempt matches admitted pipeline/target evidence.
5. Trace doctor discovery from tracked source through bundled build entry, package artifact, registry, temporary-config `doctor --fix` writeback, idempotence/refusal, and canonical startup parsing; verify steady-state runtime rejects legacy shape.
6. Trace all `OR-01` through `OR-23` claims to real executable owner boundaries. Mark mirrors, schema self-tests, hashes, aggregate parents, unavailable external roots, and failed `12/23` runs separately.
7. Independently enumerate stale config keys, contract shapes, sender/fallback calls, compatibility readers, duplicate authority, and dead-but-registered paths; classify activation before declaring them harmless.

### 3. Diagnose

1. Run the recorded focused ownership suite, Deliberation contract/client/adapter/composition suites, Discord/Slack owner suites, doctor/registry suites, and package doctor E2E only when their prerequisites are repository-local and present.
2. Run the smallest composed Deliberation/channel suite, `pnpm build`, the bundled-entry probe, the two prior scoped Oxlint commands, relevant format/static checks, and final `git diff --check`. Serialize Vitest commands and record command, exit code, assertions proved, and proof gaps.
3. Do not execute an owner integration command whose `OPENCLAW_DELIBERATION_KM_ROOT` crosses the repository boundary. Record absent approved owner execution as `OUTSIDE_REPO_EVIDENCE_REQUIRED`; retain repository-local failed or contradictory owner evidence as `PARTIAL` or `MISSING` rather than replacing it with hashes.
4. Assign each required criterion exactly one classification: `PROVEN`, `PARTIAL`, `MISSING`, or `OUTSIDE_REPO_EVIDENCE_REQUIRED`. Require current-checkout source plus executable evidence for `PROVEN`; a green fixture that encodes unsafe semantics remains contradictory evidence.
5. Separate repository-local blockers from live KM deployment, OpenClaw config, Slack membership/allowlist, Gateway restart, pilot traffic, rollback observation, and operator approval. Apply verdict rules mechanically: `SAFE` only with all obligations proven; `SAFE WITH EXPLICIT OPERATOR STEPS` only when every remaining item is external and reversible; otherwise `NOT SAFE`.

### 4. Write report

1. Before writing, check for `scripts/investigation-path.py`. If present, run `python3 scripts/investigation-path.py --task-id warm-vale-4978 --project . --touch` and require its result to match the mandated deliverable; if absent, ensure `plans/investigations/` exists and use `plans/investigations/warm-vale-4978_audit-warm-cove-4137-remediation-completeness-and-rollout-readiness.md`.
2. Create exactly that one report and no other file. Include commit/worktree scope, complete lineage, nine-row classification ledger, command/exit/proof table, repository blockers, external pilot/operator evidence, minimal follow-up task scopes, and exactly one final verdict token.
3. Cite repository-root-relative source/test/artifact paths and state every unavailable or outside-repository proof explicitly; do not recommend implementation inside this investigation.
4. Run `save-learning` as the final action after the report and make no subsequent repository edits.

## Files to Modify

| File                                                                                                         | Change                                            |
| ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------- |
| `plans/investigations/warm-vale-4978_audit-warm-cove-4137-remediation-completeness-and-rollout-readiness.md` | Write the sole evidence-only investigation report |

## TDD: skip

The output is a read-only evidence report; existing executable checks validate cited behavior, and no production behavior will be implemented.

## Dependencies

- Current dirty checkout and its Git object database are the audit scope; preserve unrelated changes and identify evidence by commit/worktree state.
- Repository-local test/build/package tooling may be used only with temporary isolated paths and no Gateway, deployment, credentials, live config, or external service access.
- Missing owner-runtime, canonical provider, or live pilot evidence remains explicitly unavailable and cannot be reconstructed from local artifacts.

_Created: 2026-08-23_
_Status: DRAFT_
