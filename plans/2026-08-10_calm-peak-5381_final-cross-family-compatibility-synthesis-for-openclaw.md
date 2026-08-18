# Plan 2026-08-10: Final cross-family compatibility synthesis for OpenClaw upstream sync

Produce one read-only compatibility decision record from the proposal, retained baseline, and completed predecessor investigations.

*Status: DRAFT*
*Created: 2026-08-10*

## Progress

- [x] Phase 0: Config + init
- [x] Phase 1: Research
- [x] Phase 2: Knowledge
- [x] Phase 3: Synthesis

## Problem

The proposal has uneven evidence: some families have detailed investigation reports, while others have no dedicated result. The synthesis must preserve those gaps, reconcile cross-family assumptions, and derive a safe implementation/check order without changing code or proposal state.

## Analysis

### Codebase and artifact context

- `docs/proposals/proposal-20260809-165021-f994b3_openclaw-upstream-sync-compatibility-review.md` defines 14 families, verdict semantics, interaction gates, and promotion criteria.
- `plans/investigations/warm-dune-8028_audit-inbound-claim-compatibility-across-fork-and-current-upstream.md` requires a current-lifecycle global claim adaptation for unbound Deliberation and rejects the old early-return block.
- `plans/investigations/cool-peak-0348_audit-cron-trajectory-suppression-compatibility.md` marks cron trajectory suppression obsolete by explicit decision, not upstream equivalence.
- `plans/investigations/calm-peak-8671_audit-queued-trajectory-writer-compatibility-across-fork-and-upstream.md` rejects the fork writer against upstream SQLite ownership.
- `plans/investigations/wild-dune-5465_audit-channel-runtime-and-model-authority-compatibility.md` keeps `modelByChannel` authoritative but leaves model-free settings, stale fallback repair, display, and migration gaps.
- `plans/investigations/calm-fork-5226_audit-configured-reasoning-effort-compatibility.md` replaces raw `params.reasoningEffort` with canonical thinking and compatibility metadata, with composed transport gaps remaining.
- `plans/investigations/wild-peak-2307_audit-cron-failure-marker-compatibility.md` rejects the free-form stderr marker because it changes timeout/retry policy and leaks through projections.
- `plans/investigations/quick-mist-3295_audit-speech-core-runtime-export-compatibility.md` retires the old alias but leaves build/export and clean-checkout smoke proof outstanding.
- `plans/investigations/warm-reef-8132_audit-generated-channel-and-config-metadata-compatibility.md` requires source-first rebase and target-base regeneration; Deliberation must not become channel metadata.
- `plans/investigations/wild-peak-6037_investigate-deliberation-v2-standard-plugin-capabilities.md` and `plans/investigations/swift-mist-4312_audit-deliberation-v1-residue-in-openclaw-fork.md` define the bounded plugin model and prove no fork-local v1 authority remains.
- No dedicated report was found for local hygiene, WhatsApp plugin-only policy, defensive WhatsApp login normalization, or a complete SecretRef family audit. Those families cannot inherit a neighboring verdict.

### Relevant documentation

- `docs/plugins/reference/deliberation.md` is the retained operator contract: fail-closed Discord intake, structured SecretRefs, six closed KM operations, KM-owned controls, and intentionally inactive outbound delivery pending an authorized destination.
- `extensions/deliberation/contracts/*.json` are the retained wire, source-identity, history, control, and provenance authorities to compare against report assumptions.
- `docs/investigations/deliberation-v2-standard-plugin-capability-investigation.md` is the durable capability baseline corresponding to the predecessor report.

### Knowledge base

- `learnings/architecture/2026-07-28_residue-audits-require-activation-proof.md`: classify references only after manifest, registration, import, and runtime activation tracing; preserve external unknowns.
- `learnings/architecture/2026-08-10_generated-channel-blobs-are-revision-projections.md`: treat generated files as target-revision projections, keep plugin config separate from channel metadata, and require generation plus idempotence checks later.
- `learnings/architecture/2026-07-19_separate-fork-behavior-from-upstream-compatibility-surfaces.md`: separate retained product behavior from similarly named upstream seams.
- Recall used local fallback because collection `openclaw-fork-learnings` was unavailable; this is a cache miss, not an investigation blocker.

## Available Skills

- `compound-plan`: maintain this investigation plan.
- `recall-knowledge`: retrieve repository compatibility and authority rules.
- `save-learning`: persist planning-session findings after finalization.

## Investigation Approach

### 1. Reproduce

1. Freeze an evidence ledger with one row for each proposal family: proposal requirement, predecessor report, retained-baseline source, report verdict, confidence, proof gap, and operator decision.
2. Record the pinned fork/upstream revisions from each report rather than assuming every report compared identical worktree state.
3. Mark families lacking a dedicated completed report as `BLOCKED` pending evidence; do not derive a verdict from proposal prose, current files, or an adjacent family.
4. Reconstruct the retained Deliberation baseline from `docs/plugins/reference/deliberation.md`, `extensions/deliberation/contracts/*.json`, and the residue/capability reports, including inactive outbound delivery and external-KM unknowns.

### 2. Trace

1. Normalize predecessor verdicts into only `READY`, `NEEDS ADAPTATION`, or `BLOCKED`, retaining the original verdict and rationale beside the normalized status.
2. Trace these interaction ledgers end to end:
   - WhatsApp plugin-only policy -> inbound claim eligibility -> claimed/unclaimed fallback -> sole-send behavior.
   - Deliberation source identity/history -> Discord dispatch payload -> global claim lifecycle -> fail-closed silence.
   - Deliberation SecretRefs -> manifest/runtime parser -> credential registry/redaction -> generated config docs -> doctor/source-checkout diagnostics.
   - `modelByChannel` authority -> session/request override -> canonical thinking -> provider wire effort -> status/session projection.
   - Cron suppression decision -> SQLite trajectory recorder/writer lifecycle -> command failure classification/projections.
   - Current speech SDK exports -> package export generation -> source/dist alias resolution -> plugin build/loader -> clean-checkout boot.
3. For every edge, identify owner, prerequisite, consumer, evidence source, and whether the edge is proved, needs adaptation, or is unknown.

### 3. Diagnose

1. Build a contradiction register. At minimum reconcile: global claim retention versus current targeted-only lifecycle; fail-closed Deliberation versus fail-open hook error/timeout behavior; inactive outbound baseline versus sole-send aspirations; structured SecretRef docs versus incomplete family proof; canonical channel authority versus model-free profile loss; cron opt-out removal versus generic `disableTrajectory`; obsolete speech alias versus missing promotion smoke.
2. Produce a dependency graph with blocked nodes left visible. Use this ordering constraint:
   - Operator decisions and missing family audits first.
   - Generic inbound lifecycle and host-authored event facts before Deliberation intake.
   - SecretRef registry/schema/doctor contract before Deliberation config and generated metadata.
   - Canonical model authority before reasoning-effort transport adaptation.
   - Trajectory storage decision before cron trajectory checks; failure-reporting policy remains separate from storage.
   - Package exports before plugin build/loader; source changes before generated artifacts.
   - Integrated checks only after each prerequisite family has focused proof.
3. Write an exact implementation/check sequence as bisectable checkpoints. Each checkpoint must name included families, required prior decisions, intended behavior, focused proof, and stop condition; do not prescribe code changes for a `BLOCKED` family.
4. Recommend edits to each proposal family and the cross-family/promotion sections, but present them as a section-by-section change list only. Do not edit the proposal.
5. Derive the overall result mechanically: `SAFE TO IMPLEMENT` only if every actionable family is `READY`; `PARTIALLY SAFE` when a dependency-closed subset is ready and all exclusions are explicit; otherwise `NOT SAFE`.

### 4. Write report

1. Immediately before report creation, check for `scripts/investigation-path.py`. If present, run:

   ```bash
   python3 scripts/investigation-path.py --task-id calm-peak-5381 --project . --touch
   ```

2. If the helper is absent, create `plans/investigations/` if needed and write `plans/investigations/calm-peak-5381_final-cross-family-compatibility-synthesis.md`.
3. Include: evidence ledger for all 14 families, normalized status matrix, contradiction register, interaction findings, dependency graph, exact implementation/check order, proposal-section recommendations, unresolved operator decisions, and evidence limits.
4. End the report with exactly one overall verdict: `SAFE TO IMPLEMENT`, `PARTIALLY SAFE`, or `NOT SAFE`.

## Files to Modify

| File | Change |
| --- | --- |
| `plans/investigations/<helper-returned-path-or-calm-peak-5381_final-cross-family-compatibility-synthesis.md>` | Add the final read-only synthesis report. |

Do not modify production code, tests, proposal files/database state, live config, external repositories, or Git state.

## TDD: skip

This is a static investigation/report task; executable tests and code changes are explicitly out of scope.

## Dependencies

- Proposal `proposal-20260809-165021-f994b3` and the repository-local predecessor reports remain the only decision evidence.
- Missing dedicated family reports remain blockers unless the synthesis can cite an existing repository/proposal artifact that fully satisfies that family's gate.
- External KM/provider behavior and live configuration remain unknown by scope and must be listed as operator/proof decisions, not inferred.
