# Plan 2026-08-17: Deliberation Acceptance Coverage Repair

Surface the preserved test implementation in task-scoped evidence, close only uncovered replay/fencing assertions, and record fresh Deliberation and Slack regression proof.

*Status: DRAFT*

## Analysis

### Codebase Context

- `extensions/deliberation/src/orchestration.test.ts` already joins the registered plugin, Slack root/reply intake, keyed child-to-root identity, bounded history, loopback KM HTTP, one Discord send, zero Slack sends, completion evidence, and a second empty poll. It is currently untracked, which explains its absence from the accepted task-scoped diff.
- `extensions/deliberation/src/final-adapter.test.ts` already contains the Slack -> Discord, Discord -> Slack, Discord -> Discord, and Slack -> Slack destination matrix plus malformed-target and ready/reservation target-drift rejection.
- `extensions/deliberation/src/plugin.test.ts`, `history-read.test.ts`, and `km-client.test.ts` already cover disabled/conflicting reservations, exact Slack timestamp and history bounds, malformed provenance, and invocation/completion evidence drift. Reuse these owner-level tests instead of duplicating production logic in orchestration.
- `plans/checkpoints/bright-reef-1988.checkpoint.md` omits the exact Slack outbound command even though the session log reports 30 passing Slack tests.
- Goal 004’s runbook and goal 005’s `NOT READY` verdict are complete; do not edit `extensions/deliberation/README.md` or reassess rollout readiness.

### Constraints

- Keep production files unchanged unless a focused RED exposes a real owner-local defect.
- Exercise only public Plugin SDK and Deliberation seams; do not access external services, credentials, live config, or KM internals.
- Keep source identity independent from destination selection and preserve one canonical reservation -> invocation -> selected-provider send -> completion path.
- Use repository `pnpm test` wrappers. Recall used local fallback because QMD collection `openclaw-fork-learnings` was unavailable.

## Available Skills

- `tdd`: link the genuine parent RED and capture fresh GREEN without manufacturing a second RED.
- `openclaw-testing`: run focused tests before the affected extension suites.
- `task-evidence`: recover parent proof provenance, not substitute it for fresh verification.
- `acceptance`: map final evidence to goals 001-003 when the acceptance manifest is available.
- `autoreview`: run the mandatory fresh code review before handoff.
- `save-learning`: required final action after implementation and verification.

## Implementation

1. Create `plans/checkpoints/quick-fork-8802.checkpoint.md` and link this plan plus `plans/checkpoints/bright-reef-1988.red-green-proof.md`. Record that the parent RED is historical and genuine; do not rerun or fabricate RED against existing code.
2. Make `extensions/deliberation/src/orchestration.test.ts` an explicit task deliverable. Preserve its table-driven Slack root/reply cases and verify each case asserts `providerEventId = message.ts`, history routing by root `thread_ts`, exclusion of unrelated threads, exact Discord account/channel/thread, one Discord call, zero Slack calls, one completion receipt, and no second send on the next poll.
3. Preserve the four-cell table in `extensions/deliberation/src/final-adapter.test.ts`. Add only missing public-adapter fencing rows: repeated/stale ready item followed by reservation conflict, disabled reservation, and a valid but unavailable destination provider. Assert no invocation/send for pre-send failures and exactly one provider call across replay.
4. Build a requirement-to-test ledger in the follow-up checkpoint. Cite existing assertions for malformed/conflicting target, ready/reservation/invocation/completion drift, source-provenance mismatch, incomplete history, exact cutoff/watermark behavior, unsupported provider, duplicate/disabled reservation, and post-send completion mismatch. Add a test only when no existing assertion proves the required behavior.
5. Run fresh focused and regression commands below. Record each exact command, exit code, test-file count, and test count in `plans/checkpoints/quick-fork-8802.checkpoint.md`; explicitly include the required Slack outbound result.
6. Confirm the task-scoped evidence bundle contains the full orchestration implementation and final-adapter additions, not only checkpoint prose or test output. Run `skill:autoreview` until no accepted actionable finding remains, then run `skill:save-learning` as the final implementation-session action.

## Files to Modify

| Path | Change |
| --- | --- |
| `extensions/deliberation/src/orchestration.test.ts` | Supply the preserved registered-plugin Slack root/reply orchestration implementation as task-scoped code evidence; tighten assertions only if the ledger finds a gap. |
| `extensions/deliberation/src/final-adapter.test.ts` | Add only missing stale replay, conflict/disabled reservation, and unavailable-provider fencing coverage. |
| `plans/checkpoints/quick-fork-8802.checkpoint.md` | Link this plan, map every required scenario to concrete tests, and record fresh commands/results. |
| `plans/checkpoints/quick-fork-8802.red-green-proof.md` | Reference the parent historical RED and capture fresh GREEN for the follow-up tests. |
| `learnings/**` | Add the required focused learning as the final action. |

## TDD

Implement the cycle according to `skill:tdd`, with the acceptance-fix exception that existing implementation must not be given a fabricated RED.

**Historical RED:** `plans/checkpoints/bright-reef-1988.red-green-proof.md`  
**Target files:** `extensions/deliberation/src/orchestration.test.ts`, `extensions/deliberation/src/final-adapter.test.ts`  
**Focused command:** `pnpm test extensions/deliberation/src/orchestration.test.ts extensions/deliberation/src/final-adapter.test.ts`

The executable parent skeleton below is provenance only; its failing assertion is already captured in the historical proof and must not be recreated:

```ts
import { createTestPluginApi } from "openclaw/plugin-sdk/plugin-test-api";
import { withServer } from "openclaw/plugin-sdk/test-env";
import { describe, expect, it } from "vitest";
import plugin from "../index.js";

describe("Deliberation cross-provider orchestration", () => {
  it("delivers one Slack root through KM to the exact Discord target", async () => {
    const observed = await withServer((_request, response) => {
      response.writeHead(500).end();
    }, async (kmEndpoint) => {
      plugin.register(createTestPluginApi({ pluginConfig: { km: { endpoint: kmEndpoint } } }));
      return undefined;
    });

    // Historical RED: no orchestration fixture drove intake/history/KM/delivery.
    expect(observed).toEqual({ discordCalls: 1, slackCalls: 0 });
  });
});
```

| Case | Historical RED / gap | GREEN requirement |
| --- | --- | --- |
| Slack root and reply -> Discord | Parent scaffold returned no lifecycle observation. | Both table rows prove child/root separation, bounded selected-thread history, one Discord call, zero Slack calls, and exact completion. |
| Four provider cells | Parent task evidence omitted the implementation. | Destination alone selects exactly one fake provider and binds its receipt in all four cells. |
| Replay and reservation fencing | Existing coverage is split and stale replay is not explicit. | Second stale/conflicting pass never creates a second invocation or provider call; disabled/conflict paths send zero times. |
| Fail-closed ledger | Acceptance could not inspect concrete tests. | Every required failure cites a passing owner-level assertion, with no duplicate test added when coverage already exists. |

## Verification

1. `pnpm test extensions/deliberation/src/orchestration.test.ts extensions/deliberation/src/final-adapter.test.ts`
2. `pnpm test extensions/deliberation`
3. `pnpm test extensions/slack/src/send.blocks.test.ts extensions/slack/src/outbound-adapter.test.ts`
4. `pnpm tsgo:extensions:test`
5. `pnpm format:check -- extensions/deliberation/src/orchestration.test.ts extensions/deliberation/src/final-adapter.test.ts plans/checkpoints/quick-fork-8802.checkpoint.md plans/checkpoints/quick-fork-8802.red-green-proof.md`
6. `git diff --check`

The checkpoint must report the fresh Slack command and successful count explicitly. If any command fails, record the first actionable failure and keep the acceptance repair incomplete; do not replace missing proof with the prior session log.
