# Plan 2026-07-28: Audit Deliberation v1 residue in OpenClaw fork

_Status: DRAFT_
_Created: 2026-07-28_

## Progress

- [x] Phase 0: Config + init
- [x] Phase 1: Research
- [x] Phase 2: Knowledge
- [x] Phase 3: Synthesis

## Problem

Plan a fork-local, read-only investigation that produces an evidence-backed Deliberation v1 residue verdict and report without changing product code, configuration, or runtime state.

## Analysis

### Codebase context

- `extensions/deliberation/index.ts` is the v2 registration boundary: plugin id `deliberation`, four hooks (`inbound_claim`, `before_dispatch`, `before_tool_call`, `message_sending`), one worker service, and plugin-prefixed control surfaces.
- `extensions/deliberation/src/final-send.ts` contains the observed production `sendDurableMessageBatch` call; `extensions/deliberation/src/sole-send.test.ts` already provides a scoped ownership assertion that the audit must independently verify.
- `extensions/deliberation/{openclaw.plugin.json,package.json}` and `src/plugins/source-checkout-runtime.test.ts` are the manifest/loadability evidence needed to exclude retired aliases or compatibility registrations.
- `src/plugins/**`, `src/plugin-sdk/**`, and `src/infra/outbound/**` contain generic hook, loader, and durable-send capabilities. They require caller/registration tracing before classification as `generic_openclaw_capability`.
- `plans/checkpoints/warm-fork-8996.checkpoint.md` records an unresolved KM-owner provenance gap. The audit must report it as an external unknown and must not inspect outside the fork.

### Relevant documentation

- `docs/investigations/deliberation-v2-standard-plugin-capability-investigation.md` defines the accepted standard-plugin hooks, bounded final-send contract, bypass inventory, and distinction between shared SDK capabilities and Deliberation-specific authority.
- `plans/2026-07-27_bright-wave-6041_deliberation-v2-standard-plugin-intake-silence-and-bounded.md` defines the intended v2 ownership shape and one-send static proof.
- `docs/plugins/reference/deliberation.md` documents the current manifest config, KM-owned controls, source silence, and bounded single-call delivery behavior to cross-check against source.
- `extensions/AGENTS.md`, `src/plugins/AGENTS.md`, `src/plugin-sdk/AGENTS.md`, and `src/infra/outbound/AGENTS.md` define plugin ownership, manifest-first loading, public SDK boundaries, and narrow outbound verification.

### Knowledge base

- `learnings/architecture/2026-07-24_retired-config-keys-need-explicit-validation.md`: absence claims must cover schema rejection and loader aliases, not only current config reads.
- `learnings/architecture/2026-07-27_acceptance-work-does-not-grant-protocol-authority.md` and sibling external-contract learnings: repository implementation evidence cannot resolve KM ownership/provenance; preserve that boundary as an unknown.
- `learnings/architecture/2026-07-28_route-delivery-recovery-through-canonical-reservation.md`: trace recovery through KM reservation and ensure no alternate retry/send authority exists.
- Recall used deterministic local fallback because collection `openclaw-fork-learnings` was unavailable.

## Available Skills

- `compound-plan`: maintain this concise, persistent investigation plan.
- `recall-knowledge`: retrieve repository-local audit and authority-migration rules before synthesis.
- `openclaw-testing`: choose focused, non-mutating tests during the investigation.
- `technical-documentation`: structure and validate the final investigation report.
- `save-learning`: capture at least one reusable planning learning after the plan is finalized.

## Solutions

Use one evidence ledger keyed by match, registration/import chain, activation status, and exactly one required classification. Names alone are insufficient: a finding blocks only when source/config/loader tracing proves categories 1-3, while shared SDK hooks and historical artifacts require negative activation evidence before categories 4-7 are accepted.

## Implementation

1. **Reproduce the fork-local baseline.** Record `git rev-parse HEAD`, `git status --short`, Node/pnpm versions, and a bounded file inventory for `extensions/`, `src/`, `packages/`, `test/`, `docs/`, `plans/`, root package/workspace manifests, and lockfiles. Read the v2 capability investigation, `bright-wave-6041` plan/checkpoints, current Deliberation manifest/docs, and implementation evidence. Run case-insensitive literal scans for `thoughtful-response`, `thoughtful_response`, `thoughtful response`, `deliberation`, `__deliberated__`, `_legacy`, `.bak`, retired routes/state/config names found in those artifacts, plus behavioral scans for hook registration, sender imports/calls, fallback, alias, compatibility, dual-write, disabled, and commented branches. Include untracked/ignored files under the allowed roots, exclude `.git`, dependencies, build output, and never read outside the repository.
2. **Trace registrations and executable paths.** Build a call-path table from `extensions/deliberation/{package.json,openclaw.plugin.json,index.ts}` through plugin discovery/loading, four hook registrations, their handlers, `createPollService`, `sendReservedAttempt`, and `sendDurableMessageBatch`. Independently enumerate every production import/call of outbound send APIs rather than relying only on `sole-send.test.ts`. For each suspicious match, trace importers and registrations until it is proven executable, config/loadable, fallback authority, fixture-only, historical, generic, or unreachable. Verify retired ids/config aliases cannot enter through manifests, package metadata, loader compatibility, generated inventories, config schemas/examples, channel adapters, or production-imported fixtures.
3. **Diagnose and verify the verdict.** Assign every ledger row exactly one category from the task taxonomy and cite symbols/line ranges. Treat uncertain activation or missing evidence as `NOT CLEAN`; categories 1-3 are blocking and must name the owning package/file plus a repair task scope without making edits. Prove category 6 entries are generic by showing non-Deliberation owners/callers and no retired wiring. Run one focused test process only if static tracing needs executable confirmation: `node scripts/run-vitest.mjs extensions/deliberation src/plugins/source-checkout-runtime.test.ts --reporter=verbose`. Rerun the bounded literal/behavior scans after classification and reconcile every result count with the ledger.
4. **Write the investigation report.** Immediately before writing, run `python3 scripts/investigation-path.py --task-id swift-mist-4312 --project . --touch` if the helper exists and use its returned path. If it is absent, create `plans/investigations/` if needed and use `plans/investigations/swift-mist-4312_audit-deliberation-v1-residue-in-openclaw-fork.md`. Treat that file as canonical, then mirror the same evidence to required deliverable `docs/investigations/deliberation-v1-residue-audit-openclaw-fork.md`. Include verdict, scope/exclusions, inventory sources, exact commands/results, categorized ledger, negative evidence, owner-scoped repair recommendations, external unknowns, and the required machine-readable summary fields. Record the canonical report path in task state; do not edit `plans/tasks/`.

## Files to Modify

| Path                                                                 | Change                                              |
| -------------------------------------------------------------------- | --------------------------------------------------- |
| `plans/investigations/<helper-result-or-fallback>.md`                | Canonical investigation report and evidence ledger. |
| `docs/investigations/deliberation-v1-residue-audit-openclaw-fork.md` | Required fork-local report mirror.                  |

No production, SDK, plugin, config, fixture, lockfile, or runtime-state file may change.

## TDD: skip

This is a read-only diagnostic/report task; focused existing tests validate traced behavior, but no implementation cycle is permitted.

## Dependencies

- Repository-local source, manifests, tests, docs, plans, checkpoints, and git metadata are the only evidence sources.
- `scripts/investigation-path.py` is currently absent, so the deterministic fallback applies unless the helper exists when the report is written.
- KM System, workspace, Mission Control, live OpenClaw config, channels, crons, and other repositories remain unknown and out of scope.
- `CLEAN` requires complete negative activation evidence for all category 4-7 matches; otherwise return `NOT CLEAN` and stop the parent batch pending a separate owner-scoped repair task.
