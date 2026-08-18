# Plan 2026-08-17: Deliberation cross-provider E2E and Slack pilot readiness

Add one hermetic test through the registered Deliberation plugin, close focused matrix/failure gaps, and publish a bounded source-only pilot runbook with an evidence-gated verdict.

*Status: DRAFT*

## Analysis

### Codebase context

- `extensions/deliberation/index.ts:17` is the public orchestration seam: registration composes intake/history hooks, the real KM client, one final-delivery service, and lazy Discord/Slack outbound adapters.
- `extensions/deliberation/src/final-adapter.ts:147` owns `ready -> reserve -> invoke -> one selected provider send -> complete`; `extensions/deliberation/src/km-client.ts:239` validates immutable target/provenance/receipt evidence at every KM stage.
- `extensions/deliberation/src/history-read.ts:258` resolves persisted Slack child/root identity, reads only the selected thread, compares exact decimal timestamps, and enforces 50-message/32-KiB freshness bounds.
- Existing focused tests cover most individual contracts, but no test joins registered Slack intake, keyed thread state, Gateway history, real KM HTTP parsing, provider dispatch, and KM completion.
- `extensions/deliberation/src/plugin.test.ts:6` hoists a KM-client mock, so the full-flow harness belongs in a separate `orchestration.test.ts`.
- Use repo-local `createTestPluginApi` and `withServer` from documented Plugin SDK test subpaths; do not import Slack internals or reconstruct Deliberation production logic.
- `extensions/deliberation/README.md` is the existing repository-local operator surface and can hold the pilot runbook without creating another documentation system.

### Evidence gate

- `extensions/deliberation/src/contract.test.ts:114` and accepted files under `extensions/deliberation/contracts/` pin closed Discord/Slack targets, exact lifecycle equality, owner hashes, and Slack-origin threaded Discord fixtures.
- Repository checkpoints prove seq 1, 4, and 5 plus acceptance repairs. No repository-local or supplied pipeline final evidence was found for seq 2 or seq 3.
- Direct proposal reading was denied by external-directory policy. The implementer must read the proposal when access is available; otherwise record that exact source as unavailable.
- Passing tests cannot produce `READY` by themselves. Missing seq 2/3 final evidence, inaccessible mandatory proposal evidence, hash drift, contradictory fixtures, or any mandatory test failure requires `NOT READY` with the exact missing/contradictory artifact.

### Knowledge base

- External contract gates precede behavioral TDD; never synthesize KM behavior from OpenClaw assumptions (`learnings/architecture/2026-07-28_external-contract-gates-precede-behavioral-tdd.md`).
- Name absent owner/audit artifacts and continue only with repository-local fixtures, provenance, and checkpoints (`learnings/architecture/2026-07-29_contract-gated-plans-should-name-absent-audit-artifacts.md`).
- A current `v1` path is the accepted v2 interoperability wire, not legacy residue (`learnings/architecture/2026-07-28_wire-protocol-versions-are-not-implementation-generations.md`).
- Preserve canonical reservation/invocation recovery and sole-send authority; do not add retries or alternate send paths.
- Recall used deterministic local fallback because QMD collection `openclaw-fork-learnings` was unavailable.

## Available Skills

- `tdd`: record the focused orchestration RED/GREEN cycle.
- `openclaw-testing`: select repository-supported Vitest, tsgo, lint, and formatting lanes.
- `task-evidence`: recover exact prior-task command outcomes when lineage artifacts are available.
- `technical-documentation`: keep the runbook imperative, bounded, placeholder-only, and source-backed.
- `validate-implementation`: audit contract, boundary, and rollout constraints after implementation.
- `autoreview`: run the mandatory fresh pre-handoff review.
- `save-learning`: required final implementation action.

## Implementation

1. Audit readiness inputs before edits: verify contract provenance hashes; inventory seq 1-5 final checkpoints/evidence from repository or supplied pipeline artifacts; read the proposal if permitted. Write the provisional verdict and exact missing artifacts into `plans/checkpoints/bright-reef-1988.checkpoint.md`; do not inspect `km-system`.
2. Using `skill:tdd`, create `extensions/deliberation/src/orchestration.test.ts` and capture RED. Register the unmocked plugin with `createTestPluginApi`, a disposable loopback `withServer` KM fake, an in-memory keyed store, injected Slack history runtime context, captured hooks/Gateway method/service, and fake Discord/Slack outbound adapters.
3. Add the Slack-root pilot scenario: call registered `inbound_claim`; assert the exact intake body and `before_dispatch` silence; invoke registered history v1/v2 reads; prove only the admitted thread is present within message/byte bounds; return KM ready/reservation/invocation/completion responses; start/stop the service; assert one Discord call to the configured account/channel/thread, zero Slack calls, and exact completion receipt binding.
4. Repeat the full pilot scenario for a child reply with `providerEventId = message.ts` and stored routing identity `thread_ts`. Include an unrelated thread in the fake history provider and prove it never reaches KM freshness evidence or delivery routing.
5. Extend `final-adapter.test.ts` with one table-driven destination matrix for Slack -> Discord, Discord -> Slack, Discord -> Discord, and Slack -> Slack. Assert source provider never selects transport, exactly one selected provider is called, and target plus receipt remain identical through completion. Keep Slack-native rows fixture-only.
6. Add table-driven fail-closed variants at the narrowest public seam: malformed/conflicting explicit target, ready/reservation/invocation/completion target drift, stale ready replay, duplicate/disabled reservation, source-provenance mismatch, incomplete history, timestamp cutoff/watermark violation, and unsupported provider. For every pre-send rejection assert zero provider calls; for post-send completion mismatch assert exactly one call and no retry or false completion.
7. Extend replay/sole-send proof: return an empty/already-completed ready queue on the next service tick and assert no second provider call; keep `sole-send.test.ts` inventory green and add any missing history/Gateway files to its non-owner scan rather than introducing another sender.
8. Update `extensions/deliberation/README.md` with one “Slack source-only pilot” runbook: prerequisites and accepted evidence; one-channel allowlist placeholder; immutable Discord `<test-deliberation-channel-id>` target; explicit confirmation that Slack-native delivery remains unconfigured; root/reply/duplicate/failure smoke cases; KM/provider evidence to inspect; abort criteria; disable/rollback steps; and final zero-unintended-send confirmation. Include no credentials, live IDs, activation command, or real-send instruction.
9. Run focused and affected regression checks. Record exact commands/results and a final `READY` or `NOT READY` in `plans/checkpoints/bright-reef-1988.checkpoint.md`; `READY` requires every mandatory test and stable, non-contradictory seq 1-5 evidence. Run `skill:validate-implementation`, then fresh `skill:autoreview` until no accepted actionable finding remains, and `skill:save-learning` last.

## Files to Modify

| Path | Change |
| --- | --- |
| `extensions/deliberation/src/orchestration.test.ts` | New registered-plugin Slack root/reply -> history -> KM HTTP -> Discord completion harness and replay/failure cases. |
| `extensions/deliberation/src/final-adapter.test.ts` | Complete the four-cell provider matrix and exact selected-provider/receipt assertions. |
| `extensions/deliberation/src/km-client.test.ts` | Add only missing lifecycle drift/provenance response cases best proved at the HTTP parser boundary. |
| `extensions/deliberation/src/history-read.test.ts` | Add only missing incomplete/timestamp-bound cases not naturally covered by orchestration. |
| `extensions/deliberation/src/sole-send.test.ts` | Keep the sender-owner inventory complete for all intake/history/KM paths. |
| `extensions/deliberation/README.md` | Add the bounded, secret-free source-only pilot smoke/abort/rollback runbook. |
| `plans/checkpoints/bright-reef-1988.checkpoint.md` | Persist evidence inventory, exact verification outcomes, and explicit readiness verdict. |

Production files are not expected to change. If RED exposes a real defect, apply the smallest owner-local fix without changing config defaults, live routes, KM contracts, or Slack activation.

## TDD

Implement the cycle with `skill:tdd`; record proof in `plans/checkpoints/bright-reef-1988.red-green-proof.md`.

**Test file:** `extensions/deliberation/src/orchestration.test.ts`  
**Run command:** `pnpm test extensions/deliberation/src/orchestration.test.ts`

Start with this executable failing scaffold, then replace the placeholder observation with the registered-plugin/loopback-KM fixture described above:

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
      return { discordCalls: 0, slackCalls: 0, completedReceipt: undefined };
    });

    // RED: no public-seam orchestration fixture drives intake/history/KM/delivery yet.
    expect(observed).toEqual({
      discordCalls: 1,
      slackCalls: 0,
      completedReceipt: "discord-message-1",
    });
  });
});
```

| Case | RED | GREEN |
| --- | --- | --- |
| Slack root -> Discord | Scaffold observes no lifecycle or provider call. | Exact intake/history/lifecycle yields one Discord call and bound receipt. |
| Slack reply -> Discord | No joined child/root identity proof exists. | Child ID remains `message.ts`; history/routing use only `thread_ts`. |
| Four-cell provider matrix | Existing tests do not express all four cells in one invariant table. | Destination alone selects exactly one provider in every cell. |
| Replay/fail closed | Existing proofs are split across unit seams. | Replayed/conflicting/malformed cases make zero unintended calls and never retry a real send. |

## Verification

1. `pnpm test extensions/deliberation/src/orchestration.test.ts`
2. `pnpm test extensions/deliberation`
3. `pnpm test extensions/slack/src/send.blocks.test.ts extensions/slack/src/outbound-adapter.test.ts`
4. `pnpm tsgo:extensions && pnpm tsgo:extensions:test`
5. `pnpm lint:extensions -- extensions/deliberation extensions/slack`
6. `pnpm format:check -- extensions/deliberation/src extensions/deliberation/README.md`
Use repository wrappers, not the task’s raw Vitest/Prettier examples. Do not run live tests, send messages, read credentials, edit live config, or perform git operations. Escalate to `skill:openclaw-testing` only if touched production/SDK surfaces expand.

## Dependencies

- Mandatory readiness inputs are stable final evidence for seq 1-5 and accepted contract provenance. Current planning evidence lacks explicit seq 2 and seq 3 final artifacts, so the current provisional verdict is `NOT READY` until those exact artifacts are supplied and agree with repository fixtures.
- The proposal file remains a mandatory source; inability to read it must be named in the final verdict rather than bypassed.
- Slack-native transport remains dormant: fixtures may exercise it, but no route, default, permission, scope, or live configuration may enable it.
