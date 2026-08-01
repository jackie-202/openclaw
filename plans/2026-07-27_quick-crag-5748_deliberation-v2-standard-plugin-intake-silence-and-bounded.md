# Plan 2026-07-27: Deliberation v2 acceptance fix

Complete the missing external-compatible plugin boundary after the KM owner supplies the exact repository-local wire contract, then replace the blocked baseline-only proof with target-scoped RED/GREEN evidence.

_Task: `quick-crag-5748`_
_Status: DRAFT_

## Evidence

- Preserve `plans/checkpoints/bright-wave-6041.checkpoint.md` and `plans/checkpoints/bright-wave-6041.red-green-proof.md`; they prove the prior stop condition and baseline health, not production GREEN.
- Treat `plans/tasks/2026-07-27_deliberation-v2-channel-intake-gate-final-send-adapter.md` and `docs/investigations/deliberation-v2-standard-plugin-capability-investigation.md` as the accepted OpenClaw boundary: non-claiming intake, terminal `before_dispatch` silence, cooperative session guards, and one KM-reserved attempt.
- Follow `extensions/AGENTS.md`: production imports stay within `openclaw/plugin-sdk/*` and the plugin package; no core, SDK, runtime-config, cron, or second-state-store changes.
- Reuse `src/plugin-sdk/channel-outbound.ts`, `src/plugin-sdk/plugin-test-api.ts`, `extensions/thread-ownership/index.ts`, and `extensions/diagnostics-prometheus/index.ts` as the durable-send, hook-test, outbound-guard, and service-registration precedents.

## Knowledge

- `learnings/architecture/external-authority-wire-contract-blocks-plugin-implementation.md`: do not infer methods, paths, authentication, cursor/lease, CAS conflicts, completion, or reconciliation from architectural invariants.
- `learnings/test-failures/bright-wave-6041-separate-a-missing-target-from-baseline-test-health.md`: keep the historical missing-target result and adjacent 19-test baseline separate from the follow-up plugin GREEN.
- Recall used deterministic local fallback because collection `openclaw-fork-learnings` was unavailable.

## Available Skills

- `tdd`: create executable target tests before production code and record RED/GREEN evidence.
- `task-evidence`: link the parent proof without presenting it as follow-up GREEN.
- `openclaw-testing`: select the narrow plugin, hook, outbound, build, and changed-check lanes.
- `technical-documentation`: document the bounded guarantee and SecretRef configuration.
- `autoreview`: perform the mandatory fresh pre-handoff review.
- `validate-implementation`: check plugin ownership, config, and docs alignment.
- `save-learning`: run last and persist at least one implementation learning.

## Implementation

1. Require the KM owner to supply and approve repository-local contract material before production code: missing-`messageId` behavior; authenticated methods, paths, headers, and credential scheme; closed intake/list/reserve/complete/reconcile schemas; cursor/lease and CAS-conflict semantics; and `NOT_SENT` proof plus fresh-attempt rules. Represent the approved material in `extensions/deliberation/contracts/` and stop again if any field remains ambiguous.
2. Use `skill:tdd` to create `extensions/deliberation/src/plugin.test.ts` and the focused contract/client/service tests before their production modules. Link the parent RED proof as provenance, run the new executable target to capture a behavioral RED, and write follow-up evidence only to `plans/checkpoints/quick-crag-5748.red-green-proof.md`.
3. Add `extensions/deliberation/` as an external-compatible package with `package.json`, `tsconfig.json`, `openclaw.plugin.json`, `api.ts`, and `index.ts`. Set startup activation, keep config schema strict, and reject disabled fail-closed mode, malformed HTTP(S) endpoint, empty/repeated/overlapping canonical Discord routes, display names, unsupported production channels, missing restricted sessions, and invalid timeout/poll bounds.
4. Implement one validated config/route matcher used by all hooks. Resolve the KM credential through the public SecretRef runtime, never log its value, and exclude the configured processing tuple before intake and terminal gating.
5. Implement a typed, abortable KM client directly from the approved fixtures. Return closed result unions for intake, ready listing, atomic reservation, completion, and reconciliation; map transport/schema errors to bounded categories; keep KM as the only durable workflow authority.
6. Register high-priority `inbound_claim` to build the owner-defined deterministic event key, synchronously submit matched Discord intake, and always continue non-claiming after accepted, duplicate, unavailable, timeout, or error. Use persistent dedupe only as a bounded optimization if the approved contract permits it.
7. Register `before_dispatch` as a local deterministic source gate returning `{ handled: true }` with no text for every configured pilot-source turn, independent of KM health. Characterize plugin absence, exception, and host timeout as outside the accepted guarantee; do not change generic hook behavior.
8. Register `before_tool_call` to block `message`, `sessions_send`, and `sessions_spawn` for configured restricted sessions after confirming their visible-delivery capability from repository policy/callers. Register `message_sending` to cancel matching canonical source deliveries from those sessions as defense in depth.
9. Register one abortable, non-overlapping polling service. For each ready record, reread and atomically reserve through KM; only a returned `SENDING` record with a fresh `deliveryAttemptId` may reach `src/final-send.ts`.
10. Keep the sole `sendDurableMessageBatch` import/call in `src/final-send.ts`, use `durability: "required"`, and preserve account, target, thread, and reply fields. Report queue intent ID when available, normalized platform IDs, correlation, timestamp, and a bounded `SENT`, `SUPPRESSED`, proven `NOT_SENT`, `PARTIAL_FAILED`, or `DELIVERY_UNKNOWN` outcome.
11. Prevent blind replay after send start, process loss, `partial_failed`, or unknown provider acceptance. Permit another send only after the approved reconciliation operation proves `NOT_SENT` and KM returns a new reservation/attempt ID.
12. Add package-level tests for duplicate intake, processing exclusion, terminal silence across KM outcomes, restricted tools and canonical sends, two-worker reservation races, stop/restart cleanup, pre-send recovery, post-start unknown, partial failure, receipt normalization, and exact route/thread/reply preservation. Add a static ownership test for exactly one outbound import/call and no marker, v1, file store, WhatsApp, or Slack production path.
13. Add the plugin reference and SecretRef credential-surface entry; update generated plugin inventory and `.github/labeler.yml`, and create the matching GitHub label only through the maintainer workflow. Use "one reserved attempt" and "unknown requires reconciliation"; never claim exactly-once visible delivery.
14. Run focused tests, repeated deterministic race/restart cases, generated-doc checks, build, changed checks, and static scans. Run fresh `autoreview` until no actionable findings remain, then run `validate-implementation`.
15. Update `plans/checkpoints/quick-crag-5748.red-green-proof.md` with exact target RED, production GREEN, regression commands, and outcomes. Keep the parent baseline explicitly labeled baseline-only.
16. Run `save-learning` as the final action and persist at least one learning covering the delivered KM/plugin boundary or proof workflow.

## Files to Modify

| Path                                                                                                  | Change                                                                                     |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `extensions/deliberation/contracts/*`                                                                 | Owner-approved KM wire contract and fixtures; no inferred endpoints or fallback semantics. |
| `extensions/deliberation/{package.json,tsconfig.json,openclaw.plugin.json,api.ts,index.ts}`           | Package metadata, startup activation, strict config, and registration.                     |
| `extensions/deliberation/src/{config,route-match,km-client,intake,guards,poll-service,final-send}.ts` | Plugin-only intake, silence, guards, reservation, send, reporting, and reconciliation.     |
| `extensions/deliberation/src/*.test.ts`                                                               | Executable RED target plus contract, race, recovery, outcome, and ownership coverage.      |
| `docs/plugins/reference/deliberation.md`                                                              | Configuration, SecretRef, operation, rollback, and bounded guarantee.                      |
| `docs/plugins/plugin-inventory.md` and generator-owned outputs                                        | Register the new plugin through repository generators.                                     |
| `docs/reference/secretref-credential-surface.md`                                                      | Register the KM credential path.                                                           |
| `.github/labeler.yml`                                                                                 | Route Deliberation plugin changes.                                                         |
| `plans/checkpoints/quick-crag-5748.red-green-proof.md`                                                | Follow-up target RED/GREEN and regression evidence.                                        |

## TDD

Implement the cycle with `skill:tdd`. Retain the parent proof as historical provenance, but count only an executed test file with failing behavior as follow-up RED and the same target passing against production code as GREEN.

**Test file:** `extensions/deliberation/src/plugin.test.ts`  
**Run command:** `pnpm test extensions/deliberation/src/plugin.test.ts`  
**Edit hint:** create this file after the KM contract is supplied and before `extensions/deliberation/index.ts`.

```ts
import { createTestPluginApi } from "openclaw/plugin-sdk/plugin-test-api";
import { describe, expect, it, vi } from "vitest";
import plugin from "../index.js";

describe("deliberation plugin boundary", () => {
  it("registers terminal silence and restricted-session guards", async () => {
    const hooks = new Map<string, (event: never, ctx: never) => unknown>();
    const api = createTestPluginApi({
      pluginConfig: {
        enabled: true,
        failClosed: true,
        sources: [{ channel: "discord", accountId: "acct-1", target: "source-1" }],
        processingSource: { channel: "discord", accountId: "acct-1", target: "process-1" },
        km: {
          endpoint: "https://km.invalid",
          credential: { source: "env", provider: "default", id: "KM_TOKEN" },
          requestTimeoutMs: 1000,
          pollIntervalMs: 1000,
        },
        restrictedSessionKeys: ["agent:reviewer"],
      },
      on: ((name: string, handler: (event: never, ctx: never) => unknown) => {
        hooks.set(name, handler);
      }) as never,
      registerService: vi.fn(),
    });

    plugin.register(api);
    await expect(
      hooks.get("before_dispatch")?.(
        { content: "source message" } as never,
        { channelId: "discord", accountId: "acct-1", conversationId: "source-1" } as never,
      ),
    ).resolves.toEqual({ handled: true }); // RED: plugin entry and gate do not exist.
    await expect(
      hooks.get("before_tool_call")?.(
        { toolName: "message", params: { action: "send" } } as never,
        { toolName: "message", sessionKey: "agent:reviewer" } as never,
      ),
    ).resolves.toMatchObject({ block: true }); // RED: restricted-session guard does not exist.
  });
});
```

| Test                         | RED                                    | GREEN                                                        |
| ---------------------------- | -------------------------------------- | ------------------------------------------------------------ |
| Plugin boundary registration | Missing `../index.js` or missing hooks | Startup service and all four hooks register.                 |
| Configured-source silence    | No terminal result                     | `before_dispatch` resolves `{ handled: true }` without text. |
| Restricted-session guard     | Tool remains allowed                   | Outbound-capable tool resolves `{ block: true }`.            |

Add each contract/client/service case before its production module, then run:

```bash
pnpm test extensions/deliberation
pnpm test src/plugins/wired-hooks-inbound-claim.test.ts src/plugins/wired-hooks-reply-dispatch.test.ts src/plugins/hooks.before-agent-reply.test.ts
pnpm test src/plugins/wired-hooks-message.test.ts src/plugins/wired-hooks-reply-payload-sending.test.ts src/plugins/hooks.security.test.ts src/plugins/hooks.correlation.test.ts
pnpm test src/infra/outbound/deliver.test.ts src/infra/outbound/delivery-queue.recovery.test.ts src/channels/message/receipt.test.ts
pnpm plugins:inventory:check
pnpm build
pnpm check:changed
git diff --check
```

## Dependencies

- The KM owner must supply and approve the complete repository-local wire contract before executable plugin production work starts; this acceptance-fix task still contains no such contract.
- The operator supplies canonical Discord account/source/processing IDs and restricted session keys through validated config; source code contains no live IDs or credentials.
- No core/SDK semantics, second durable store, wake endpoint, official publish decision, or non-Discord enablement is required.
