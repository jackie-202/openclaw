# Plan 2026-08-23: Close deliberation owner-runtime convergence gates before rollout

Close the repository-local gate with 23 named leaf scenarios across the real channel-owner, KM listener/SQLite, and packaged doctor boundaries. Keep live activation a separate operator decision.

_Status: DRAFT_

## Analysis

- `extensions/deliberation/scripts/km-listener.cross-repo.ts` is the only harness that starts the pinned owner listener, uses disposable SQLite state, and drives the real producer, KM client, and final adapter. Its historical `12/23` result counts 20 leaf cases plus three aggregate parent nodes, not 23 independent acceptance behaviors.
- Real source-ownership proof belongs in `extensions/discord/src/monitor/message-handler.{queue,process}.test.ts` and `extensions/slack/src/monitor/message-handler.deliberation.test.ts`; migration proof belongs in `test/scripts/deliberation-doctor-package.e2e.test.ts`.
- `plans/checkpoints/calm-crag-4037.checkpoint.md` is still blocked on an approved owner checkout, while `swift-cove-5006` and `cool-reef-8673` lack canonical gate references. Implementation must inspect their final successor artifacts before editing and report `NOT READY` if the sequential dependencies remain incomplete.
- The three scoped lint errors are test-only: redundant `String(...)` in `extensions/deliberation/scripts/intake-producer.test.ts`, plus a redundant assertion and an unwrapped async Node request listener in `extensions/deliberation/src/orchestration.test.ts`.
- The proposal fixes `pipelineId` and effective target before persistence and forbids late inference, fallback, or second sends. Mirrored hashes prove byte identity only; executable owner behavior and semantic fixture validation remain mandatory.
- Relevant knowledge: `learnings/architecture/quick-wave-9858-source-ownership-precedes-inbound-transforms.md`, `learnings/architecture/quick-wave-9858-audit-abstraction-and-fixture-boundaries.md`, `learnings/build-errors/warm-cove-4137-build-success-can-omit-untracked-plugin-artifacts.md`, and `learnings/architecture/deliberation-readiness-evidence-gate.md`.
- Knowledge recall used deterministic local fallback because QMD collection `openclaw-fork-learnings` was unavailable.

## Available Skills

- `tdd`: capture assertion-level RED/GREEN for the first missing owner-listener scenario.
- `openclaw-testing`: select focused, owner integration, package/build, changed, and remote canonical gates.
- `task-evidence`: recover exact predecessor commands and results when a final checkpoint is incomplete.
- `technical-documentation`: write the evidence-led readiness report.
- `validate-implementation`, `autoreview`, and `save-learning`: required closeout sequence.

## Approach

Replace ambiguous reporter totals with 23 stable leaf IDs, prove each ID at its owning executable boundary, and preserve current low-level protocol/isolation cases as supporting gates. Change contracts only from directly inspected owner behavior; otherwise stop at an exact `NOT READY` report.

## Owner-Runtime Matrix

Use these stable leaf IDs in test names and in the readiness report. Existing auth/version/schema/lifecycle-conflict and spool-isolation tests remain required supporting coverage but do not inflate this matrix with aggregate parent counts.

| ID      | Named behavior                                                       | Real boundary evidence                                                       |
| ------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `OR-01` | Discord root -> source anchor                                        | owner listener/SQLite + Discord owner test                                   |
| `OR-02` | Discord child -> existing source thread/history                      | owner listener/SQLite + registered-plugin history test                       |
| `OR-03` | Slack root -> source thread anchor                                   | owner listener/SQLite + Slack owner test                                     |
| `OR-04` | Slack child -> root-selected history and same thread                 | owner listener/SQLite + registered-plugin history test                       |
| `OR-05` | Slack -> explicit Discord root                                       | owner listener/SQLite + final adapter                                        |
| `OR-06` | Slack -> explicit Discord thread                                     | owner listener/SQLite + final adapter                                        |
| `OR-07` | Discord -> explicit Discord root                                     | owner listener/SQLite + final adapter                                        |
| `OR-08` | Discord -> explicit Discord thread                                   | owner listener/SQLite + final adapter                                        |
| `OR-09` | Slack -> explicit Slack root                                         | owner listener/SQLite + final adapter                                        |
| `OR-10` | Slack -> explicit Slack thread                                       | owner listener/SQLite + final adapter                                        |
| `OR-11` | Two same-window provider events -> two records                       | owner listener/SQLite for Discord and Slack                                  |
| `OR-12` | Duplicate provider event -> one record/no second attempt             | owner listener/SQLite replay                                                 |
| `OR-13` | Stale history/evidence -> no mutation/no send                        | registered history boundary + owner lifecycle rejection                      |
| `OR-14` | Contradictory identity/pipeline/target -> no mutation/no send        | producer/owner listener lifecycle                                            |
| `OR-15` | Processing disabled -> exclusive silence                             | loader-backed Discord and Slack owner paths                                  |
| `OR-16` | KM unavailable -> exclusive silence                                  | loader-backed Discord and Slack owner paths                                  |
| `OR-17` | Intake rejection/failure -> exclusive silence                        | loader-backed Discord and Slack owner paths                                  |
| `OR-18` | Invoked delivery unknown survives lease expiry/restart with no retry | owner listener/SQLite + final adapter                                        |
| `OR-19` | Durable proven-`NOT_SENT` recovery permits one fresh attempt         | owner listener/SQLite + final adapter, only if accepted contract supports it |
| `OR-20` | Receipt mismatch/duplicate completion evidence fails closed          | owner listener/SQLite completion path                                        |
| `OR-21` | Valid legacy config migrates once and validates canonically          | installed package `doctor --fix`                                             |
| `OR-22` | Mixed/malformed legacy authority is unchanged and rejected           | installed package `doctor --fix`/`config validate`                           |
| `OR-23` | Disable/rollback keeps configured sources silent and sends nothing   | loader-backed plugin/channel service boundary                                |

Every positive lifecycle row must assert the admitted `pipelineId` and effective target remain byte-equivalent through ready, reserve, invoke, complete, receipt, and durable projection. Every negative row must assert spool/config immutability and zero native provider attempts.

## Implementation

1. Inspect final checkpoints and proof artifacts for the exclusive-ownership, one-event/uncertain-delivery, and doctor-migration tasks. Require completed behavior, scoped GREEN, build/package proof, and an approved immutable owner revision. Use `task-evidence` for omitted command output. If any prerequisite is still blocked, skip duplicate implementation and write the final report as `NOT READY` with the exact missing artifact.
2. Directly inspect the approved owner contract, fixtures, listener parser, SQLite lifecycle, and recovery code under `OPENCLAW_DELIBERATION_KM_ROOT`. Compare those files with `extensions/deliberation/contracts/{km-wire-v1,cutover-controls-v1,openclaw-overlay-v1,provenance}.json`; never update provenance from hashes alone or invent missing owner fields.
3. Invoke `skill:tdd`. Add the first missing leaf scenario to `km-listener.cross-repo.ts`, capture assertion-level RED against the approved owner checkout, then add/table-drive the remaining KM-backed matrix rows. Flatten aggregate `t.test` groups for matrix accounting so each `OR-*` result is one reporter leaf; retain current auth, protocol, conflict, cleanup, and production-spool guards as supporting tests.
4. Pair route/history rows with registered-plugin orchestration tests and disabled/unavailable/failure/rollback rows with loader-backed Discord and Slack tests. Start from authenticated provider events and assert debounce bypass, original root/child identity, exact history, no acknowledgement/typing/auto-thread/shortcut/ordinary dispatch, and one intake per event. Do not replace these with direct helper tests.
5. Reuse the packaged doctor E2E for `OR-21` and `OR-22`; assert the tracked build inventory contains `doctor-contract-api`, installed `doctor --fix` writes only a complete valid canonical shape, a second run is byte-stable, refusal cases remain unchanged, and canonical startup validation succeeds without launching the Gateway.
6. Synchronize contract and cutover fixtures only where direct owner-runtime execution proves drift. Keep one canonical intake/lifecycle shape, remove stale contradictory fixture outcomes, update semantic contract tests, and pin exact tracked owner files/revision in provenance. No parser, fixture, probe, or adapter may recompute `pipelineId` or effective target after admission.
7. Fix only the three audited lint findings: remove the redundant `String(...)`, return the already-narrowed request directly, and wrap the async HTTP handler with `void ...catch(error => response.destroy(error))` so the Node callback remains void-returning.
8. Capture identical-command GREEN, then run all gates below. Run `skill:validate-implementation` and fresh `skill:autoreview`; resolve every accepted/actionable finding and rerun affected proof.
9. Write `plans/checkpoints/fresh-peak-7129.rollout-readiness.md` with the 23-row matrix, exact test/result and owner revision/hash per row, supporting-suite totals, lint/build/canonical run references, remaining external unknowns, and two independent conclusions: `IMPLEMENTATION READY|NOT READY` and `LIVE ACTIVATION NOT APPROVED`. Any missing row, prerequisite, owner proof, or canonical gate forces `NOT READY`.
10. Invoke `skill:save-learning` last and make no subsequent edits.

## Files To Modify

| File                                                                                                                                                     | Change                                                                                             |
| -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `extensions/deliberation/scripts/km-listener.cross-repo.ts`                                                                                              | Define named leaf owner-runtime cases and execute real listener/SQLite lifecycle coverage          |
| `extensions/deliberation/src/orchestration.test.ts`                                                                                                      | Pair root/child history and cross-provider flows with the registered plugin; fix two lint findings |
| `extensions/deliberation/scripts/intake-producer.test.ts`                                                                                                | Cover producer evidence and remove the redundant conversion                                        |
| `extensions/discord/src/monitor/message-handler.queue.test.ts`, `extensions/discord/src/monitor/message-handler.process.test.ts`                         | Fill only missing real Discord owner/rollback rows                                                 |
| `extensions/slack/src/monitor/message-handler.deliberation.test.ts`                                                                                      | Fill only missing real Slack owner/rollback rows                                                   |
| `test/scripts/deliberation-doctor-package.e2e.test.ts`                                                                                                   | Name and close migration/refusal matrix rows if predecessor proof does not already do so           |
| `extensions/deliberation/contracts/{km-wire-v1,cutover-controls-v1,openclaw-overlay-v1,provenance}.json`, `extensions/deliberation/src/contract.test.ts` | Conditional owner-approved semantic synchronization and executable fixture proof                   |
| `plans/checkpoints/fresh-peak-7129.red-green-proof.md`                                                                                                   | Tool-generated identical-command RED/GREEN evidence                                                |
| `plans/checkpoints/fresh-peak-7129.rollout-readiness.md`                                                                                                 | Final matrix and separate implementation/live-activation verdicts                                  |

Do not change production runtime files unless a new real-boundary RED exposes a defect not owned by a prerequisite remediation. Do not edit live config, allowlists, credentials, deployments, or Gateway state.

## TDD

Implement the cycle with `skill:tdd`; write proof to `plans/checkpoints/fresh-peak-7129.red-green-proof.md`.

**Primary test file:** `extensions/deliberation/scripts/km-listener.cross-repo.ts`  
**Framework:** Node test against the approved owner listener and isolated SQLite spool  
**Run command:** `env OPENCLAW_DELIBERATION_KM_ROOT="<approved-converged-km-root>" pnpm test:deliberation:km-integration`  
**Edit hint:** merge with the existing imports and append after the listener/spool helpers.

```ts
import assert from "node:assert/strict";
import { test } from "node:test";
import { runIntakeProducer } from "./intake-producer.js";

void test("OR-04 Slack child preserves root history and source delivery", async () => {
  const fixture = await createListenerFixture();
  try {
    const result = await runIntakeProducer(
      {
        endpoint: fixture.context.endpoint,
        pipelines: [
          {
            id: "slack-source",
            source: { channel: "slack", accountId: "workspace-a", target: "C456" },
          },
        ],
        processingSource: { channel: "discord", accountId: "default", target: "processing" },
        event: {
          provider: "slack",
          eventType: "message",
          eventKind: "user_request",
          accountId: "workspace-a",
          conversationId: "C456",
          messageId: "1723640000.000200",
          threadId: "1723640000.000100",
          senderId: "U123",
          timestamp: OCCURRED_AT,
          content: "child request",
        },
        context: {
          channelId: "slack",
          accountId: "workspace-a",
          conversationId: "C456",
          messageId: "1723640000.000200",
          senderId: "U123",
        },
      },
      { OPENCLAW_DELIBERATION_KM_CREDENTIAL: fixture.context.credential },
    );
    assert.equal(result.handled, true); // RED: current owner integration rejects positive intake.
    const [record] = readSpool(fixture);
    assert.equal(record?.pipelineId, "slack-source");
    assert.equal(record?.sourceThreadId, "1723640000.000100");
    assert.deepEqual(record?.deliveryTarget, {
      provider: "slack",
      account: "workspace-a",
      channel: "C456",
      mode: "thread",
      threadId: "1723640000.000100",
    });
  } finally {
    await disposeFixture(fixture);
  }
});
```

| Test                                                           | RED                                                                                   | GREEN                                                                                                 |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `OR-04 Slack child preserves root history and source delivery` | Positive intake is rejected or durable root/target evidence is absent                 | One child event persists once with immutable pipeline, root history identity, and Slack thread target |
| Matrix completeness                                            | One or more `OR-01`...`OR-23` named leaves are absent/failing                         | Exactly 23 mapped behaviors pass; aggregate/supporting tests are reported separately                  |
| Negative lifecycle rows                                        | Stale/contradictory/unknown/receipt evidence mutates state or permits another attempt | State remains unchanged and native provider call count stays zero                                     |

Capture RED and GREEN around the identical owner command:

```bash
TASK_ID=fresh-peak-7129 python3 "$HOME/.config/opencode/skills/tdd/scripts/proof-capture.py" red -- env OPENCLAW_DELIBERATION_KM_ROOT="<approved-converged-km-root>" pnpm test:deliberation:km-integration
# After implementation, repeat with `green` and the identical trailing command.
```

## Verification

1. `env OPENCLAW_DELIBERATION_KM_ROOT="<approved-converged-km-root>" pnpm test:deliberation:km-integration` must show every `OR-01`...`OR-23` row passing plus all supporting owner-listener guards.
2. `OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test extensions/deliberation extensions/discord/src/monitor/message-handler.queue.test.ts extensions/discord/src/monitor/message-handler.process.test.ts extensions/slack/src/monitor/message-handler.deliberation.test.ts test/scripts/deliberation-doctor-package.e2e.test.ts -- --reporter=verbose`.
3. Rerun the audit's exact extension Oxlint command and its core/SDK command; require zero findings. Run `pnpm format:check` for touched source/test/contract/report files and `git diff --check`.
4. Run `pnpm build`, verify Deliberation's collected build entries include `doctor-contract-api.ts`, and rerun the installed-package doctor test against the resulting tarball.
5. Run `pnpm changed:lanes --json`, then the selected remote `pnpm check:changed` gate through `skill:openclaw-testing`; record the actual Testbox/Crabbox provider and run ID.
6. Submit the registered canonical Test Gate `cd ~/Projects/openclaw-fork && npm test` to the caller-owned runner and record its concrete passing reference and totals. Local output cannot be relabeled canonical.

## Dependencies

- Completed final evidence from the three sequential prerequisite remediations, including a real canonical gate reference where required.
- A readable, tracked, clean, owner-approved immutable KM checkout implementing singular intake and closed uncertain-delivery recovery; setup/provenance failures are not valid TDD RED.
- Temporary isolated listener, spool, package, config, HOME, and state roots only.
- Live configuration migration, Slack activation/allowlist changes, provider smoke, deployment, Gateway restart, and live rollout approval remain out of scope.
