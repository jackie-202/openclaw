# Plan 2026-08-09: Audit inbound_claim compatibility across fork and current upstream

Build a source-derived compatibility ledger and report for the historical broadcast hook, current binding-targeted APIs, and final fork consumers.

## Problem

Determine whether the global claim behavior introduced by `da1059a30450` can be dropped, adapted to pinned upstream `4b85d834ed1586062f31bded2f358fc5192d1674`, or must remain fork-only, without executing or changing product code.

## Analysis

### Codebase context

- `da1059a30450` changes only `src/auto-reply/reply/dispatch-from-config.ts` and its test: it adds a global `runInboundClaim` after the binding-targeted path and before `message_received`, internal hooks, commands, and agent dispatch.
- `src/plugins/hooks.ts` defines priority-ordered first-claim wins behavior, fail-open error isolation, global and plugin-targeted runners, and targeted outcomes: `handled`, `missing_plugin`, `no_handler`, `declined`, and `error`.
- At pinned upstream, `src/auto-reply/reply/dispatch-from-config.prepare-operation.ts` invokes only `runInboundClaimForPluginOutcome` for a core-managed binding; missing plugin/no handler may fall through, while decline/error terminate with notices.
- `extensions/codex/index.ts` is the historical binding-backed consumer; `extensions/codex/src/conversation-binding.ts` requires `ctx.pluginBinding` and returns terminal handled results.
- `extensions/deliberation/index.ts` is retained worktree evidence for a high-priority unbound consumer; `extensions/deliberation/src/intake.ts` claims successful KM intake and relies on a separate `before_dispatch` guard after failures.
- `src/plugins/wired-hooks-inbound-claim.test.ts` and pinned dispatch test utilities encode claimant ordering, error isolation, timeout, binding, fallback, and no-global-broadcast expectations.

### Relevant documentation

- `docs/proposals/proposal-20260809-165021-f994b3_openclaw-upstream-sync-compatibility-review.md` supplies the pinned revisions, evidence dimensions, verdict vocabulary, and dirty-baseline rule.
- Pinned `docs/plugins/hooks.md` states that `inbound_claim` is not global and is invoked only for the plugin owning a core-managed conversation binding.
- `docs/plugins/reference/deliberation.md` records Deliberation's intake and fail-closed silence contract; treat it as retained fork evidence, not accepted upstream design.

### Knowledge base

- `learnings/architecture/2026-07-28_residue-audits-require-activation-proof.md`: use a ledger from match through registration, import, binding, and runtime caller; preserve unknowns when repository evidence cannot prove activation.
- Recall used the deterministic local backend because QMD collection `openclaw-fork-learnings` was absent; the other returned files had no actionable body.

## Available Skills

- `compound-plan`: structure and persist this investigation plan.
- `recall-knowledge`: apply repository audit learnings before synthesis.
- `save-learning`: record the planning workflow learning after finalization.

## Solutions

Use one evidence matrix keyed by invocation or consumer. For each row, record revision, entry point, registration/binding chain, relative order, input/result shape, claimant behavior, exception/timeout behavior, fallback, current targeted equivalent, adaptation, and exact source/test citation. Derive the verdict only after every historical and retained consumer has a row.

## Implementation

### Pre-investigation checklist

- [ ] Keep all reads within this repository and proposal `proposal-20260809-165021-f994b3`.
- [ ] Use Git object reads only (`git show`, `git diff`, `git log`, `git grep`); do not switch, merge, rebase, commit, or modify refs.
- [ ] Do not run code, tests, builds, live configuration, or dependency/repository probes.
- [ ] Keep pinned upstream evidence separate from the retained Deliberation worktree baseline.

### Investigation steps

1. **Reproduce from source.** Read `da1059a30450^`, `da1059a30450`, and relevant follow-ups through the proposal's final fork revision. Reconstruct a sequence table from dedupe and binding resolution through targeted claim, global claim, `message_received`, internal hooks, command handling, agent dispatch, reply delivery, idle/processed markers, and dedupe commit. Record first-claim priority, multiple claimants, thrown handlers, timeout behavior, handled replies, and unclaimed continuation from source and tests only.
2. **Trace consumers and current APIs.** Enumerate every `inbound_claim` registration and runner caller at the historical/final fork revisions and pinned upstream with `git grep`, then prove activation via plugin entry, manifest/loader registration, conversation binding, and dispatch caller. Map Codex and every other historical consumer to `runInboundClaimForPlugin`, `runInboundClaimForPluginOutcome`, or no current equivalent. Add the retained Deliberation registration/intake/guard chain as a separate worktree-baseline row without modifying or attributing it to upstream.
3. **Diagnose compatibility.** Compare old broadcast and pinned targeted behavior across invocation eligibility, ordering, payload/context fields, reply handling, cancellation/terminal state, priority and multiple claimants, error/timeout isolation, missing plugin/no handler/decline/error outcomes, message observability, command bypass, send-policy suppression, and unclaimed fallback. State per-consumer migration steps, semantic losses, and blockers; distinguish richer payloads from equivalent routing semantics. Select exactly one proposal-defined verdict only when all ledger rows support it; otherwise use `BLOCKED/UNKNOWN`.
4. **Write report.** Immediately before report creation, check for `scripts/investigation-path.py`; if present, run `python3 scripts/investigation-path.py --task-id warm-dune-8028 --project . --touch` and write only to its returned path. If absent, create `plans/investigations/` if needed and write `plans/investigations/warm-dune-8028_audit-inbound-claim-compatibility-across-fork-and-current-upstream.md`. Include the evidence ledger, old/current sequence tables, consumer mapping, semantic matrix, adaptation requirements, unresolved evidence, and repo-root citations. End with exactly one of `EQUIVALENT UPSTREAM`, `COMPATIBLE REPLACEMENT`, `FORK-ONLY RETAIN`, `OBSOLETE BY DECISION`, or `BLOCKED/UNKNOWN`, followed by confidence and cited evidence.

## Files to Modify

| File | Change |
| --- | --- |
| `plans/investigations/warm-dune-8028_audit-inbound-claim-compatibility-across-fork-and-current-upstream.md` or helper-returned canonical path | Create the markdown-only compatibility report. |

## TDD: skip

The deliverable is a read-only source investigation report, and the scope explicitly prohibits running or changing tests.

## Dependencies

- Git objects `da1059a30450`, its relevant follow-ups/final consumers, and `4b85d834ed1586062f31bded2f358fc5192d1674` must remain locally readable.
- Proposal `docs/proposals/proposal-20260809-165021-f994b3_openclaw-upstream-sync-compatibility-review.md` is the sole decision authority.
- Current worktree Deliberation files are evidence only and must remain untouched.

---
*Created: 2026-08-09*
*Status: DRAFT*
