# Plan 2026-09-08: Investigate Discord plugin approval expiry despite immediate user click

Trace the reported timestamps through the native plugin-approval path and classify each candidate cause without changing runtime behavior.

## Analysis

### Codebase context

- `src/agents/agent-tools.before-tool-call.ts:430` creates a two-phase plugin approval, then waits independently on `plugin.approval.waitDecision` until the configured expiry.
- `src/gateway/server-methods/plugin-approval.ts:98` server-generates the `plugin:` id; `src/gateway/server-methods/approval-shared.ts:505` returns the same public error for expired, invisible, or unknown records.
- `src/infra/approval-handler-bootstrap.ts:43` and `src/infra/exec-approval-channel-runtime.ts:141` own native event subscription, delivery, replay, and expiry.
- `extensions/discord/src/approval-native.ts:171` enables the same native runtime for exec and plugin events; `extensions/discord/src/approval-handler.runtime.ts:218` renders plugin cards with `execapproval` button ids.
- `extensions/discord/src/monitor/exec-approvals.ts:80` acknowledges the native click and resolves ids beginning with `plugin:` through `plugin.approval.resolve`.
- `extensions/discord/src/monitor/listeners.ts:58` hands interaction handling off immediately; `extensions/discord/src/internal/event-queue.ts:105` has a global bounded-concurrency queue, while `extensions/discord/src/monitor/agent-components.dispatch.ts:266` is the separate generic component-to-agent path.

### Relevant documentation

- `docs/plugins/plugin-permission-requests.md:100` defines timeout, no-route, routing, and plugin-vs-exec behavior.
- `docs/plugins/sdk-channel-plugins.md:145` assigns native routing, dedupe, expiry, and subscription to core while channel plugins own transport and interaction facts.

### Knowledge base

- `learnings/architecture/2026-07-28_residue-audits-require-activation-proof.md`: prove the complete registration and runtime caller chain before ruling a path in or out.
- `learnings/architecture/2026-07-27_do-not-invent-missing-external-wire-contracts.md`: preserve the absent authoritative Discord receipt/click timestamp as unknown.
- Recall used the local backend because collection `openclaw-fork-learnings` was unavailable.

## Available Skills

- `compound-plan`: maintain this investigation plan and canonical task linkage.
- `recall-knowledge`: apply repository investigation and evidence-boundary learnings.
- `save-learning`: record reusable planning findings after the plan is complete.

## Solutions

Use one timestamp ledger and one call graph. Mark a cause **proven** only when source plus operator evidence or a deterministic fake probe establishes it; mark it **ruled out** only when every active caller bypasses that mechanism; otherwise mark it **hypothetical** and state the missing evidence.

## Implementation

### Pre-investigation checklist

- [ ] Keep the repository read-only except for this plan, optional disposable fake-test artifacts, and the final investigation report.
- [ ] Do not inspect external logs, home config, workspace state, or task `calm-wave-9279`; do not alter timeouts, approvals, policy, registration, or services.
- [ ] Keep native `execapproval` callbacks distinct from generic forwarded plugin components and same-chat `/approve`.

### Investigation steps

1. **Reproduce:** Build a deterministic fixture from the supplied 14:48 timeline. With fake timers and fake Discord/Gateway clients, replay request creation, native message delivery, expiry, and a post-expiry button resolve. If needed, add a disposable focused case beside `extensions/discord/src/monitor/exec-approvals.test.ts` or `src/infra/exec-approval-channel-runtime.test.ts`; run `pnpm test <exact-test-file>`. Record whether the observed error requires only a late callback or can occur while the approval is pending.
2. **Trace:** Follow the exact active chain from `runBeforeToolCallHook` through Gateway registration/visibility, native approval subscription, Discord message creation, `INTERACTION_CREATE` dispatch, `ExecApprovalButton.run`, the short-lived operator approvals client, and `plugin.approval.resolve`. Record id, account, device/runtime authority, queue ownership, and timestamp availability at every boundary. Confirm from `provider.interactions.ts`, `provider.startup.ts`, and `gateway-plugin.ts` that the native component is registered once and interactions use the asynchronous listener with `autoInteractions: false`.
3. **Diagnose:** Compare four hypotheses against the ledger: delayed client visibility/display, global Discord event-queue backlog, wrong approval id/routing/visibility, and ordinary post-expiry interaction. Explicitly test whether an active agent tool wait consumes event-queue concurrency or session locks; distinguish that from unrelated listeners exhausting `maxConcurrency`. Treat Discord message creation and resolve-RPC time as bounds only, and leave actual client display/click and inbound receipt times unknown. Identify the minimum additional live evidence as the raw `INTERACTION_CREATE` id/custom id, its Discord snowflake time, process receipt/handler-start monotonic times, queue metrics, and the resolver client's authenticated runtime identity.
4. **Write report:** Before writing, prefer `python3 scripts/investigation-path.py --task-id cool-wave-3470 --project . --touch` when that helper exists. It is currently absent, so create `plans/investigations/` if needed and use the deterministic fallback `plans/investigations/cool-wave-3470_investigate-discord-plugin-approval-expiry.md`. Report the timestamp ledger, exact source locations, proven/ruled-out/hypothetical causes, missing live evidence, and a minimal task-ready correction only if a concrete bug is proven; otherwise state that no code bug is proven. Do not propose retries, approval bypass, policy weakening, or the separately owned five-minute timeout change.

## Files to Modify

| File                                                                                | Change                                                                     |
| ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `plans/investigations/cool-wave-3470_investigate-discord-plugin-approval-expiry.md` | Final evidence-backed investigation report when the helper remains absent. |

All production source and existing tests remain unmodified; any temporary fixture must be removed after its result is captured in the report.

## TDD: skip

The deliverable is a read-only diagnostic report; optional fake-timer fixtures gather evidence and do not begin an implementation RED/GREEN cycle.

## Dependencies

- Supplied Europe/Prague timestamps are sufficient to reproduce the known ordering but not client visibility, click, or inbound event receipt time.
- Repository source and fake Discord/Gateway clients are authoritative for this investigation; no live Discord calls are permitted.

---

_Created: 2026-09-08_
_Status: DRAFT_
