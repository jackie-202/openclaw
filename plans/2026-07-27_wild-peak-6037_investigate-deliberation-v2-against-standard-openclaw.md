# Plan 2026-07-27: Investigate Deliberation v2 against standard OpenClaw plugin capabilities

Diagnostic investigation plan for producing an evidence-backed feasibility report and a task-ready rewrite for `bright-wave-6041`.

_Status: DRAFT_
_Created: 2026-07-27_

## Progress

- [x] Phase 0: Config + Init
- [x] Phase 1: Research
- [x] Phase 2: Knowledge
- [x] Phase 3: Synthesis

## Problem

Establish the guarantees and gaps of standard plugin seams for inbound ownership, fail-closed suppression, authorized final delivery, isolation, correlation, durability, and duplicate handling without changing production code.

## Analysis

### Codebase Context

- Hook contracts and correlation fields: `src/plugins/hook-types.ts`, `src/plugins/hook-message.types.ts`, `src/hooks/message-hook-mappers.ts`.
- Ordering, timeout, failure, and terminal decisions: `src/plugins/hooks.ts` plus `src/plugins/wired-hooks-*.test.ts`, `src/plugins/hooks.*.test.ts`.
- Discord inbound trace: `extensions/discord/src/monitor/message-handler.ts` through `message-handler.context.ts`, `message-handler.process.ts`, `src/channels/turn/kernel.ts`, and `src/auto-reply/reply/dispatch-from-config.ts`.
- Agent suppression seams: `src/auto-reply/reply/get-reply.ts`, `src/auto-reply/reply/dispatch-from-config.ts`, and their focused hook tests.
- Outbound lifecycle and receipts: `src/channels/message/send.ts`, `src/infra/outbound/deliver.ts`, `src/infra/outbound/message.ts`, `src/channels/message/{types,receipt}.ts`, and delivery queue recovery tests.
- Alternate delivery paths and bypass analysis: `src/agents/tools/message-tool.ts`, `src/infra/outbound/message-action-runner.ts`, `src/infra/outbound/outbound-send-service.ts`, and direct adapter callers.
- Lifecycle/durability: `src/plugins/services.ts`, `src/plugins/runtime/types-core.ts`, `src/plugin-state/plugin-state-store*.ts`, and `src/plugin-sdk/runtime-store.ts`.
- Precedents: `extensions/codex/index.ts`, `extensions/acpx/index.ts`, `extensions/thread-ownership/index.ts`, and `extensions/memory-core/src/dreaming.ts`.

### Relevant Documentation

- `docs/plugins/hooks.md`: hook catalog, priority/timeouts, message correlation, cancellation, and Gateway lifecycle.
- `docs/plugins/sdk-overview.md`: external-plugin authority, host hooks, terminal decisions, and registration APIs.
- `docs/plugins/sdk-runtime.md`: injected runtime helpers, subagent delivery controls, and restart-safe keyed state limitations.
- `docs/plugins/sdk-channel-outbound.md`: durable send outcomes, receipts, and lifecycle ownership.
- `docs/plugins/sdk-setup.md`: plugin config schema and manifest registration.
- `docs/channels/whatsapp.md`: explicit `message_received` broadcast opt-in and channel prerequisites.

### Knowledge Base

- `learnings/architecture/cron-trajectory-opt-out-runner-call-graph.md`: trace the complete current call graph before planning claims; task landmarks may be stale.
- `learnings/architecture/dark-crag-9860-authority-migrations-require-indirect-consumer-cleanup.md`: inspect alternate consumers and bypass paths, not only the primary dispatch seam.
- `learnings/architecture/oddel-forkove-runtime-chovani-od-upstream-kompatibility.md`: distinguish local/fork behavior from supported upstream-facing plugin contracts.
- Other recalled model-routing learnings are not directly applicable; they reinforce testing authority and persistence fields separately instead of inferring one from the other.
- Recall backend: local fallback; collection `openclaw-fork-learnings` was absent.

## Available Skills

- `openclaw-testing`: choose the smallest existing characterization tests when source leaves semantics ambiguous.
- `technical-documentation`: structure and verify the final investigation report.
- `save-learning`: capture reusable investigation findings only after the investigation task is complete.

## Solutions

- Build one evidence matrix with separate columns for documented capability, observed source behavior, focused-test proof, failure/restart semantics, and owner. Do not promote an implementation detail into an SDK guarantee.
- Compare the plugin-only design against two bounded alternatives: a KM-triggered delivery seam and the smallest generic SDK addition. Recommend a core change only after proving every standard external-plugin path insufficient.
- Treat duplicate intake, duplicate worker attempts, unknown provider acceptance, and restart recovery as distinct states. State whether each layer offers dedupe, at-most-once attempt, receipt reconciliation, or no guarantee.

## Investigation Steps

### 1. Reproduce

1. Record `git status --short`, current commit, Node/pnpm versions, and the exact scoped docs/source/test inventory; do not read KM, workspace, Mission Control, live config, cron state, or the external proposal file.
2. Read the current downstream wording in `plans/tasks/2026-07-27_deliberation-v2-channel-intake-gate-final-send-adapter.md` and convert each assertion into a question requiring local proof.
3. Establish baseline hook behavior from `src/plugins/hooks.ts`, `src/plugins/hook-types.ts`, `src/plugins/hook-message.types.ts`, and focused tests. Run only tests needed to settle ambiguity, starting with:
   - `pnpm test src/plugins/wired-hooks-inbound-claim.test.ts src/plugins/hooks.before-agent-reply.test.ts src/plugins/wired-hooks-reply-dispatch.test.ts`
   - `pnpm test src/plugins/wired-hooks-reply-payload-sending.test.ts src/plugins/wired-hooks-message.test.ts src/plugins/hooks.security.test.ts src/plugins/hooks.correlation.test.ts`
4. Log every command, result, inspected path, symbol, and line range for direct inclusion in the report.

### 2. Trace

1. Trace one Discord message from `extensions/discord/src/monitor/message-handler.ts` through inbound dedupe/queue/context/process, `src/channels/turn/kernel.ts`, and `src/auto-reply/reply/dispatch-from-config.ts`; mark exactly where `inbound_claim`, `message_received`, `before_dispatch`, `reply_dispatch`, `before_agent_reply`, and default model dispatch occur.
2. Trace WhatsApp hook emission through `extensions/whatsapp/src/auto-reply/monitor/process-message.ts` and its tests; document the `channels.whatsapp[.accounts.<id>].pluginHooks.messageReceived` prerequisite without extrapolating Discord behavior.
3. Trace ordinary and claimed reply suppression through `dispatch-from-config.ts` and `get-reply.ts`; capture priority, terminal result, silence representation, handler error policy, configured/default timeout, and process restart implications from the runner implementation.
4. Trace a lifecycle-managed outbound send from `src/channels/message/send.ts` through `src/infra/outbound/deliver.ts` to adapter receipt and `message_sent`; tabulate whether each originating API runs `reply_payload_sending`, `message_sending`, `before_dispatch`, `reply_dispatch`, and `message_sent`.
5. Trace alternate send origins through `src/infra/outbound/message.ts`, `src/agents/tools/message-tool.ts`, `src/infra/outbound/message-action-runner.ts`, `src/infra/outbound/outbound-send-service.ts`, direct adapter callers, session/subagent delivery, and queue recovery. Identify any route that bypasses the proposed authorization gate.
6. Map correlation and trust fields from `src/hooks/message-hook-mappers.ts`, `src/infra/outbound/session-context.ts`, and hook context types. Classify each field as provider-stable, persisted across restart, run-local, process-local, optional, or user-controlled.
7. Map durable state and lifecycle contracts from `src/plugins/services.ts`, `src/plugin-state/plugin-state-store*.ts`, `src/plugins/runtime/types-core.ts`, and `src/plugin-sdk/runtime-store.ts`; explicitly verify whether each API is available to a normal external plugin or bundled-only.
8. Inspect precedents in `extensions/codex/index.ts`, `extensions/acpx/index.ts`, `extensions/thread-ownership/index.ts`, and `extensions/memory-core/src/dreaming.ts`, checking that each uses public plugin SDK seams rather than bundled privilege.

### 3. Diagnose

1. Fill a requirement-to-capability matrix for intake matching/exclusion, fail-closed silence, unforgeable final-send authorization, single authorized sender, correlation, duplicates/retries/restart, drafting-session isolation, channel neutrality, lifecycle, and config.
2. Assign each row to one owner: standard plugin, OpenClaw core/delivery queue, channel provider, or KM. Give a `YES`, `YES WITH LIMITATIONS`, or `NO` plugin-only verdict only after every row has evidence.
3. Separate exactly-once dimensions: attempt reservation, provider acceptance, returned platform message ID, visible delivery, unknown outcome, retry, and reconciliation. Reject an exactly-once claim unless source and provider-facing receipt semantics prove it.
4. Compare plugin-owned polling/recovery with KM-initiated delivery. Require a narrow authenticated trigger, durable idempotency contract, and recovery state machine before recommending either.
5. Classify every uncovered guarantee as a reusable SDK gap, a Deliberation architecture issue, or KM-owned idempotency/orchestration. If an SDK gap remains, specify only the smallest generic decision or delivery seam and show why existing hooks/runtime APIs cannot enforce it.
6. Rewrite `bright-wave-6041` inside the report with exact scope, non-scope, interfaces, acceptance checks, focused verification commands, and stop conditions. Stop implementation if KM lacks a stable inbound event key, persisted authorization/readiness token, atomic send reservation, or unknown-delivery reconciliation contract.

### 4. Write Report

1. Immediately before writing, check for and prefer the local helper: `python3 scripts/investigation-path.py --task-id wild-peak-6037 --project . --touch`.
2. If `scripts/investigation-path.py` is missing, create `plans/investigations/` if needed and write `plans/investigations/wild-peak-6037_investigate-deliberation-v2-standard-plugin-capabilities.md`. Treat `plans/investigations/` as canonical; do not substitute `docs/investigations/`.
3. Write the report with: executive verdict; requirement matrix; recommended architecture/event flow; hook/API evidence; trust/authorization/persistence model; exactly-once ownership split; SDK/core gaps; rejected alternatives; exact `bright-wave-6041` rewrite; open decisions for Michal; inspected paths and command results.
4. End with a machine-readable block containing `verdict`, `recommended_inbound_hook`, `recommended_fail_closed_hook`, `recommended_send_api`, `core_change_required`, `open_decisions`, and `implementation_task_changes`.
5. Verify only the investigation report and task-local artifacts changed with `git status --short`, `git diff --check`, and `git diff -- plans/investigations/`; record proof gaps instead of broadening to production edits.

## Files to Modify

| File                                                                                                                                                   | Change                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| Path returned by `scripts/investigation-path.py`, or `plans/investigations/wild-peak-6037_investigate-deliberation-v2-standard-plugin-capabilities.md` | Evidence-backed investigation report and implementation-task rewrite. |

No production source, config, runtime state, task definition, or external repository file is modified.

## TDD: skip

This is a source-audited diagnostic report; existing characterization tests resolve semantic ambiguity, but no production behavior is implemented.

## Dependencies

- Deliberation requirements in the task are the only external contract; unknown KM fields remain explicit stop conditions.
- External-plugin feasibility must exclude bundled-only APIs and direct core imports.
- The current repository has no `scripts/investigation-path.py`; recheck immediately before report creation, then use the deterministic fallback if still absent.
- Use `technical-documentation` for report structure and `openclaw-testing` for narrow test selection; do not run the injected broad `npm test` command for this investigation.

---

_Created: 2026-07-27_
_Status: DRAFT_
