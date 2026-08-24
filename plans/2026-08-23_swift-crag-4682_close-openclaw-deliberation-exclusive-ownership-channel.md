# Plan 2026-08-23: Close OpenClaw Deliberation exclusive-ownership channel boundary

_Status: DRAFT_

## Progress

- [x] Phase 0: Config + init
- [x] Phase 1: Research
- [x] Phase 2: Knowledge
- [x] Phase 3: Synthesis

## Analysis

### Codebase context

- `src/plugins/hooks.ts:1023-1066` already attributes one exclusive policy owner and rejects multiple owners as ambiguous; `src/plugin-sdk/channel-inbound.ts:31-86` terminalizes handled, declined, missing-plugin, no-handler, error, runner-unavailable, and ambiguous outcomes.
- Discord computes policy in `extensions/discord/src/monitor/message-handler.preflight.ts:656-672`, but recognized system messages enqueue at `extensions/discord/src/monitor/message-handler.preflight.ts:727-741` and empty messages return at `extensions/discord/src/monitor/message-handler.preflight.ts:744-748` before the claim in `extensions/discord/src/monitor/message-handler.process.ts:214-261`.
- Discord's existing process claim already precedes media, bound-thread touch, ack/status reactions, auto-thread construction, typing, dispatch, and delivery in `extensions/discord/src/monitor/message-handler.process.ts:262-521`; carry system-event data to this boundary instead of adding a second claim path.
- Slack claims in `extensions/slack/src/monitor/message-handler/prepare.ts:1060-1110` before ack/system-event/dispatch setup, but empty content exits at `extensions/slack/src/monitor/message-handler/prepare.ts:1037-1057`, and subtype system events enqueue directly at `extensions/slack/src/monitor/events/messages.ts:169-186` without policy or claim.
- `extensions/deliberation/src/intake.ts:64-147` keeps configured sources exclusively owned even when processing is disabled; empty, unsupported room/system, KM rejection, and KM errors decline, which remains terminal at the SDK seam. No KM or Deliberation wire change is needed.
- Existing real loader fixtures are `extensions/discord/src/monitor/message-handler.process.test.ts:574-815` and `extensions/slack/src/monitor/message-handler.deliberation.test.ts:34-240`; the Slack fixture currently calls preparation directly and must exercise the real handler/event registration seams for ordering proof.

### Relevant documentation

- `docs/proposals/proposal-20260820-203458-161e2c_per-source-deliberation-pipelines-with-source-default-delivery.md:61-89,113-134` requires unique source ownership, source silence, root/child identity, and no fallback.
- `docs/plugins/hooks.md:127-135` already documents attributed exclusive claim before acknowledgement, typing, thread creation, and ordinary dispatch. Implementation must conform; no public contract expansion is planned.
- `plans/investigations/warm-vale-4978_audit-warm-cove-4137-remediation-completeness-and-rollout-readiness.md:28-36,40-52,56-64` is the approved baseline and focused-command source; this task closes only blocker 1.

### Knowledge base

- `learnings/architecture/2026-07-28_residue-audits-require-activation-proof.md`: prove manifest/loader registration, caller, callee, and active runtime path; isolated symbols are insufficient.
- Do not infer or change external wire semantics. This task can be proven at OpenClaw's loaded owner/channel seam and must leave KM contracts, delivery, migration, and rollout untouched.
- Recall used deterministic local fallback because QMD collection `openclaw-fork-learnings` was absent; the other returned auto-extracted files contained no additional actionable detail.

## Available Skills

- `tdd`: capture authentic named-leaf RED/GREEN against real loader/channel seams.
- `openclaw-testing`: select focused OpenClaw test, lint, and typecheck commands.
- `autoreview`: mandatory fresh implementation closeout review.
- `save-learning`: persist implementation lessons as the final action.

## Approach

Keep `inbound_event_policy` attribution and `claimChannelInboundEvent` terminal semantics unchanged. Move only channel-owned work so authenticated `exclusive`/`ambiguous` events reach that claim before ordinary mutations; preserve existing ordinary flow after `continue`.

## Implementation

1. Invoke `skill:tdd`; add the six exact reporter leaves below and capture genuine side-effect RED in `plans/checkpoints/swift-crag-4682.red-green-proof.md` before production edits.
2. In Discord preflight, resolve recognized system text before final event classification, classify it as `room_event`, and carry it plus exclusive/ambiguous empty events in `DiscordMessagePreflightContext`. Remove preflight enqueue; retain the current empty drop only for non-owned, non-system messages.
3. In Discord processing, include carried system text in the attributed claim payload. After a nonterminal claim, enqueue the unchanged system text/context and return; otherwise return before media, bound-thread touch, ack/status, auto-thread, typing, dispatch, and delivery.
4. In Slack's handler, resolve raw source policy before seen/liveness/thread/debounce mutations. Route `exclusive` and `ambiguous` events immediately to preparation with the decision; leave ordinary/separate debounce behavior unchanged.
5. In Slack preparation, gather only authenticated conversation, sender, command/mention, original channel/`ts`/`thread_ts`, and lightweight content/media facts before claim. Defer assistant-thread cache writes, binding/session routing, thread participation/starter work, content downloads, empty-content return, auto-thread decisions, history, ack/status, enqueue, dispatch, and delivery until `continue`.
6. In Slack subtype message events, claim the authorized original subtype as `room_event` before `enqueueSystemEvent`. Configured sources terminalize on handled/declined/error/ambiguity; ordinary sources enqueue the same description, session key, and context key as today.
7. Keep `extensions/deliberation/**`, KM contracts, delivery semantics, config/migration, and public SDK types unchanged. Run `skill:autoreview` after GREEN and fix all actionable findings; run `skill:save-learning` last.

## Files to Modify

| File                                                                  | Change                                                                          |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `extensions/discord/src/monitor/message-handler.preflight.ts`         | Carry system/owned-empty events instead of enqueueing or dropping before claim. |
| `extensions/discord/src/monitor/message-handler.preflight.types.ts`   | Add the narrow carried system-event field.                                      |
| `extensions/discord/src/monitor/message-handler.process.ts`           | Claim first, then ordinary-only system enqueue.                                 |
| `extensions/discord/src/monitor/message-handler.deliberation.test.ts` | New dedicated loader-backed OR-01/02/03/04/06 leaves and Discord matrix.        |
| `extensions/discord/src/monitor/message-handler.process.test.ts`      | Move the existing Deliberation fixture/coverage into the dedicated suite.       |
| `extensions/discord/src/monitor/message-handler.preflight.test.ts`    | Preserve ordinary system/room and empty-event behavior at preflight.            |
| `extensions/slack/src/monitor/message-handler.ts`                     | Bypass ordinary mutation/debounce for attributed terminal policies.             |
| `extensions/slack/src/monitor/message-handler/prepare.ts`             | Claim from authenticated original facts before thread/content/dispatch effects. |
| `extensions/slack/src/monitor/events/messages.ts`                     | Claim authorized subtype system events before enqueue.                          |
| `extensions/slack/src/monitor/message-handler.deliberation.test.ts`   | Expand loader-backed handler coverage; own OR-05 and Slack matrix.              |
| `extensions/slack/src/monitor/events/messages.test.ts`                | Preserve ordinary subtype enqueue and prove configured-source suppression.      |

Do not edit core/SDK production unless RED demonstrates a contract defect; current shared behavior is covered by `src/plugins/hooks.sync-only.test.ts`, `src/plugin-sdk/channel-inbound.test.ts`, and `src/auto-reply/reply/dispatch-from-config.test.ts`.

## TDD

Implement the TDD cycle with `skill:tdd`.

**Primary files:** `extensions/discord/src/monitor/message-handler.deliberation.test.ts`, `extensions/slack/src/monitor/message-handler.deliberation.test.ts`  
**Run command:**

```bash
TASK_ID=swift-crag-4682 python3 "$HOME/.config/opencode/skills/tdd/scripts/proof-capture.py" red -- pnpm test extensions/discord/src/monitor/message-handler.deliberation.test.ts extensions/slack/src/monitor/message-handler.deliberation.test.ts -- --reporter=verbose
```

Replace `red` with `green` without changing the trailing test command.

Initial executable RED skeleton in the existing Slack loader fixture:

```ts
import { createSlackMessageHandler } from "./message-handler.js";

it("OR-05 slack-root-child-claim-before-thread-effects", async () => {
  const cfg = loadDeliberation();
  const ctx = createContext(cfg, true);
  const replies = vi.mocked(ctx.app.client.conversations.replies);
  const handler = createSlackMessageHandler({ ctx, account: createSlackTestAccount() });

  await handler(createMessage({ ts: "1700000000.000200", thread_ts: "1700000000.000100" }), {
    source: "message",
  });

  expect(requests).toHaveLength(1);
  expect(replies).not.toHaveBeenCalled(); // RED: thread starter is currently read before claim.
  expect(enqueueSystemEventMock).not.toHaveBeenCalled();
  expect(reactSlackMessageMock).not.toHaveBeenCalled();
});
```

Required exact reporter leaves:

| Leaf                                                     | RED                                                                            | GREEN                                                                                                                     |
| -------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `OR-01 exclusive-owner-before-ordinary-side-effects`     | Configured path reaches at least one ordinary effect before terminal ownership | One loaded owner claim; zero enqueue/ack/status/thread/typing/command/abort/dispatch/delivery effects                     |
| `OR-02 disabled-source-terminal-without-side-effects`    | Disabled processing leaks into ordinary path                                   | Policy remains attributed; zero KM request and zero ordinary effects                                                      |
| `OR-03 missing-error-ambiguous-owner-terminal`           | Missing/throwing/multiple owner reaches ordinary work or wrong claimant        | Every real loaded-runner outcome is terminal; ambiguity invokes neither claimant; zero ordinary effects                   |
| `OR-04 discord-system-room-event-claimed-before-enqueue` | Discord system event enqueues in preflight                                     | Configured system/room event claims before enqueue and remains silent; ordinary control still enqueues once afterward     |
| `OR-05 slack-root-child-claim-before-thread-effects`     | Root/child invokes thread/cache/routing work first                             | Both claim from original `ts`/`thread_ts`; zero thread effects                                                            |
| `OR-06 command-abort-empty-autothread-claim-matrix`      | At least command, abort, empty, or auto-thread row exits/mutates first         | Discord and Slack configured rows claim once and suppress all ordinary effects; ordinary controls retain current behavior |

Use table-driven supporting rows in the two channel suites for configured/disabled, root/child, system/room, command/abort, empty/media-empty, auto-thread, handled/declined, KM 400/503, missing/no-handler/error/ambiguous, and non-Deliberation controls. Each row must assert owner identity or terminal reason and every applicable negative side-effect spy.

## Verification

1. Run the named leaves plus the exact focused ownership suites from `warm-vale-4978`:

```bash
OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test src/plugins/hooks.sync-only.test.ts src/plugin-sdk/channel-inbound.test.ts extensions/discord/src/monitor/message-handler.queue.test.ts extensions/discord/src/monitor/message-handler.process.test.ts extensions/discord/src/monitor/message-handler.deliberation.test.ts extensions/slack/src/monitor/message-handler.deliberation.test.ts extensions/slack/src/monitor/events/messages.test.ts src/auto-reply/reply/dispatch-from-config.test.ts -- --reporter=verbose
```

2. Run the approved focused Deliberation regression group unchanged:

```bash
OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test extensions/deliberation/src/contract.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/final-adapter.test.ts extensions/deliberation/src/delivery-composition.test.ts extensions/deliberation/src/hooks.test.ts extensions/deliberation/src/config.test.ts extensions/deliberation/src/config-compat.test.ts extensions/deliberation/src/sole-send.test.ts src/plugins/doctor-contract-registry.test.ts src/plugins/doctor-contract-registry.load-paths.test.ts src/commands/doctor/shared/channel-legacy-config-migrate.test.ts src/plugins/source-checkout-runtime.test.ts -- --reporter=verbose
```

3. Run touched-file lint and extension production/test types; do not build, install, link, restart, deploy, or send live traffic:

```bash
node scripts/run-oxlint.mjs --tsconfig config/tsconfig/oxlint.extensions.json extensions/discord/src/monitor/message-handler.preflight.ts extensions/discord/src/monitor/message-handler.preflight.types.ts extensions/discord/src/monitor/message-handler.process.ts extensions/discord/src/monitor/message-handler.deliberation.test.ts extensions/slack/src/monitor/message-handler.ts extensions/slack/src/monitor/message-handler/prepare.ts extensions/slack/src/monitor/events/messages.ts extensions/slack/src/monitor/message-handler.deliberation.test.ts extensions/slack/src/monitor/events/messages.test.ts
pnpm tsgo:extensions
pnpm tsgo:extensions:test
git diff --check
```

4. Final note: list all six exact leaves/results; claim-before-enqueue call-order proof; missing/error/ambiguous terminal reasons; ordinary Discord/Slack controls; exact commands, exits, test counts, touched boundaries, and explicit confirmation of no KM/rollout/build/live actions.

---

_Created: 2026-08-23_  
_Status: DRAFT_
