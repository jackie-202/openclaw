# Plan 2026-08-21: Audit OpenClaw deliberation pipeline routing and delivery safety

Audit the checked-out implementation and versioned evidence without changing production code, live configuration, or external systems.

## Problem

Produce a repository-local `SAFE` or `NOT SAFE` rollout verdict for proposal `proposal-20260820-203458-161e2c`, with every required invariant tied to current source, tests, fixtures, and recorded verification.

## Analysis

### Codebase context

- `extensions/deliberation/src/config.ts`, `route-match.ts`, and `intake.ts` normalize config, select one authenticated pipeline, derive the effective target, submit intake, and independently suppress ordinary dispatch.
- `extensions/deliberation/src/km-client.ts`, `final-adapter.ts`, and `index.ts` fence lifecycle evidence and dispatch the durable target through Discord or Slack.
- `extensions/deliberation/src/history-read.ts` separates Slack event/thread identity; the Discord path requires explicit review for equivalent thread-context behavior.
- `extensions/discord/src/outbound-adapter.ts` contains webhook fallback and transport retry below Deliberation's single adapter call; the audit must distinguish adapter calls from actual provider attempts.
- `extensions/deliberation/contracts/{km-wire-v1,cutover-controls-v1,openclaw-overlay-v1,provenance}.json` are the local contract authority. Current inspection suggests stale cutover cases omit required pipeline/target fields and target modes.
- `extensions/deliberation/src/{config,route-match,hooks,history-read,contract,km-client,final-adapter,plugin,orchestration}.test.ts` and channel adapter tests are the focused proof surfaces.
- `plans/checkpoints/calm-reef-2510.{checkpoint,red-green-proof}.md` records broad passing implementation evidence, but it predates or does not exercise every current transport and fixture invariant.

### Relevant documentation

- `docs/proposals/proposal-20260820-203458-161e2c_per-source-deliberation-pipelines-with-source-default-delivery.md` defines the acceptance contract.
- `docs/plugins/reference/deliberation.md` and `extensions/deliberation/README.md` claim bounded legacy compatibility, immutable target delivery, fail-closed silence, and no fallback.
- `docs/plugins/sdk-channel-outbound.md` defines source-anchor versus exact-thread outbound semantics.

### Knowledge base

- `learnings/architecture/2026-07-28_residue-audits-require-activation-proof.md`: trace discovery, registration, callers, and side effects; literal inventory alone cannot support a clean verdict.
- `learnings/architecture/2026-07-28_wire-protocol-versions-are-not-implementation-generations.md`: separately prove config normalization, runtime registration, sender authority, and wire-version meaning.
- Repository rules require canonical runtime config, migration-owned compatibility, source-authenticated routing, exact durable lifecycle evidence, and no uncited fallback.
- Recall used the local fallback because QMD collection `openclaw-fork-learnings` was unavailable; the other returned auto-extracted learnings contained no substantive guidance.

## Available Skills

- `compound-plan`: maintain this investigation plan at the canonical task path.
- `openclaw-testing`: select narrow existing-test reruns only when recorded evidence is stale, missing, or contradictory.
- `save-learning`: record the reusable audit lesson after the plan is complete.

## Solutions

Use one acceptance ledger with columns for invariant, contract requirement, runtime entry point, owner boundary, caller/callee, positive test, negative test, recorded result, contradiction, and conclusion. A criterion passes only when source and current repository-local evidence agree; unknown external convergence or an unresolved safety contradiction forces `NOT SAFE`.

## Implementation

1. **Reproduce:** Record the current commit/worktree state and inventory only repository-local proposal, config/manifest, runtime, channel adapter, contract/fixture, documentation, and checkpoint evidence. Reproduce the suspected contradictions statically: validate every cutover request/response against its referenced closed schema; compare `burstPolicy`/record `messages[]` with separate-item semantics; enumerate provider sends, retries, and fallbacks below `FinalDeliveryProvider.send`; and compare admitted `user_request` events with suppressed configured-source event kinds.
2. **Trace:** Follow Discord omitted root, Discord omitted child, Slack omitted root, Slack omitted child, explicit Discord/Slack root, explicit Discord/Slack thread, and Slack-to-Discord from host-authenticated event facts through `admitInboundSource`, intake serialization, ready/reservation/invocation/completion parsing, selected channel adapter, and receipt. For each vector, record exact `pipelineId`, target mode and identifiers, per-message `providerEventId`, contextual `sourceThreadId`, provider-attempt identity, transport call count, completion identity, and every fail-closed exit. Separately trace canonical/legacy config loading and removal conditions, ordinary-dispatch suppression for intake success/failure/disabled paths, Discord and Slack history scope, duplicate/conflict handling, malformed/stale evidence, unsupported target, provider failure, and invalid receipt.
3. **Diagnose:** Complete the ledger against every acceptance criterion. Classify each gap at the config/migration, authenticated admission, durable KM lifecycle, history/context, suppression, or transport boundary. Treat provenance hashes as local consistency evidence only, mark external KM convergence unknown, and distinguish one Deliberation adapter invocation from one actual provider/API attempt. Prefer recorded evidence; if a row remains stale or contradictory, run only the relevant existing command and capture command, date, exit code, counts, and failures in the report:
   - `pnpm test extensions/deliberation/src/config.test.ts extensions/deliberation/src/route-match.test.ts extensions/deliberation/src/hooks.test.ts extensions/deliberation/src/history-read.test.ts extensions/deliberation/src/contract.test.ts -- --reporter=verbose`
   - `pnpm test extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/final-adapter.test.ts extensions/deliberation/src/plugin.test.ts extensions/deliberation/src/orchestration.test.ts -- --reporter=verbose`
   - `pnpm test extensions/discord/src/outbound-adapter.test.ts extensions/slack/src/outbound-adapter.test.ts -- --reporter=verbose`
4. **Write report:** Immediately before writing, run `python3 scripts/investigation-path.py --task-id quick-wave-9858 --project . --touch` if that helper exists and use its exact output. If absent, create `plans/investigations/` if needed and write `plans/investigations/quick-wave-9858_audit-openclaw-deliberation-pipeline-routing-and-delivery-safety.md`. Include scope/SHA, an unambiguous `SAFE` or `NOT SAFE` verdict, the acceptance ledger, focused command results, explicit external-convergence unknowns, and bounded repository-local remediation tasks ordered by rollout impact. Do not modify production code, fixtures, tests, docs, live config, secrets, or external repositories.

## Files to Modify

| File                                                                                                                         | Change                                   |
| ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Path returned by `scripts/investigation-path.py`, or the deterministic `plans/investigations/quick-wave-9858_...md` fallback | Write the sole investigation deliverable |

## TDD: skip

The deliverable is a read-only diagnostic report; use existing tests only to resolve missing, stale, or contradictory evidence.

## Dependencies

- Inspect only the current `/Users/michal/Projects/openclaw-fork` checkout; do not read `km-system`, runtime secrets, or `~/.openclaw/openclaw.json`.
- Preserve the dirty worktree and distinguish checked-in history from uncommitted implementation/evidence under audit.
- Do not infer external KM deployment or live rollout readiness from repository-local provenance claims.

---

_Created: 2026-08-21_
_Status: DRAFT_
