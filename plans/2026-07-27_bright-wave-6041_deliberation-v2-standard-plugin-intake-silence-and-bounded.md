# Plan 2026-07-27: Deliberation v2 standard plugin boundary

Implement a startup-activated, external-compatible plugin package with KM as the only durable authority and polling as the only plugin-owned scheduler.

_Task: `bright-wave-6041`_
_Status: DRAFT_

## Progress

- [x] Phase 0: Config and initialization
- [x] Phase 1: Repository research
- [x] Phase 2: Knowledge review
- [x] Phase 3: Synthesis

## Analysis

### Codebase context

- `extensions/AGENTS.md` requires plugin production code to use only `openclaw/plugin-sdk/*`; `extensions/thread-ownership/index.ts` and `extensions/diagnostics-prometheus/index.ts` provide hook and service precedents.
- `src/plugins/hook-message.types.ts` exposes the required inbound route/message/thread/reply fields; `src/plugins/hook-types.ts` confirms terminal `{ handled: true }`, tool blocking, and outbound cancellation shapes.
- `src/plugin-sdk/channel-outbound.ts` exposes `sendDurableMessageBatch`; `src/channels/message/send.ts` classifies `sent`, `suppressed`, `partial_failed`, and pre-send `failed` with optional delivery intent IDs.
- `src/security/dangerous-tools.ts` identifies `sessions_send` and `sessions_spawn` as additional high-risk session orchestration tools; restricted-session tests must decide whether both can reach visible delivery.
- A startup worker requires `activation.onStartup`, `api.registerService`, and clean timer/abort shutdown. Polling is smaller than a wake endpoint because no authenticated wake contract is supplied.

### Relevant documentation

- `docs/investigations/deliberation-v2-standard-plugin-capability-investigation.md`: authoritative SDK evidence and bounded guarantee.
- `docs/plugins/hooks.md`: hook registration, fields, terminal decisions, and cooperative trust limits.
- `docs/plugins/sdk-setup.md`: manifest-first strict config under `plugins.entries.<id>.config`.
- `docs/plugins/sdk-channel-outbound.md`: durable outcome and receipt semantics.
- `docs/plugins/sdk-testing.md`: focused plugin test helpers and loader-backed registration proof.
- `docs/reference/secretref-credential-surface.md`: structured SecretRef rules; a new plugin credential also needs an explicit supported credential path.

### Knowledge base

- `learnings/architecture/cron-trajectory-opt-out-runner-call-graph.md`: trace the current end-to-end call graph before naming implementation files or assertions.
- `learnings/architecture/dark-crag-9860-authority-migrations-require-indirect-consumer-cleanup.md`: scan alternate outbound consumers and bypasses, not only the primary send path.
- `learnings/architecture/oddel-forkove-runtime-chovani-od-upstream-kompatibility.md`: keep fork-local behavior outside shared SDK/core contracts.
- Other recalled model-routing learnings are not directly applicable. Recall used local fallback because collection `openclaw-fork-learnings` was absent.

## Available Skills

- `tdd`: implement behavior RED-first and retain RED/GREEN proof.
- `openclaw-testing`: select narrow plugin and shared hook/outbound verification.
- `technical-documentation`: keep the plugin reference precise about one reserved attempt and unknown reconciliation.
- `validate-implementation`: verify the finished plugin against ownership and no-core-change constraints.
- `save-learning`: capture reusable planning findings after the plan is complete.

## Approach

- Add `extensions/deliberation/` as a private repo-local package that behaves like an external plugin: focused public SDK imports only, no core imports, no privileged runtime state, and no official catalog/publish entry without a separate distribution decision.
- Keep one normalized route matcher shared by intake, silence, outbound defense, and processing-source exclusion. The current implementation accepts only canonical Discord pilot routes while retaining the generic `channel/accountId/target` config shape.
- Use bounded KM polling through `api.registerService`; a wake endpoint is excluded because no authentication or replay contract exists.
- Treat every reserved send as one attempt. Map a returned durable result to bounded KM completion data, and map process loss or any uncertain post-start state to `DELIVERY_UNKNOWN` without replay.

## Implementation

1. **Resolve the KM contract before production code.** Add repository-local request/result interfaces and fixtures for event-key construction, intake, ready listing, atomic reservation, completion, and reconciliation. Stop if the owner has not supplied: missing-`messageId` behavior; exact HTTP methods/paths and request/response schemas; credential/header semantics; ready-list cursor/lease behavior; or the proof that permits `NOT_SENT` and a fresh reservation.
2. **Characterize SDK boundaries first.** Extend the focused shared hook tests only where current assertions are absent: rich non-claiming `inbound_claim` continuation, silent terminal `before_dispatch`, fail-open exception/timeout/absence limits, restricted-session `before_tool_call`, and canonical `message_sending` cancellation. Do not change generic runtime semantics.
3. **Scaffold and validate the plugin.** Add package metadata, `api.ts`, startup manifest, strict JSON Schema, and matching runtime validation. Require `enabled: true`, `failClosed: true`, non-empty canonical Discord routes, non-overlapping source/processing tuples, a valid HTTP(S) KM endpoint, bounded positive timeouts, a SecretRef-capable KM credential, and non-empty restricted session keys; reject display names and non-Discord production routes.
4. **Implement typed KM access.** Resolve the configured credential through `openclaw/plugin-sdk/secret-input-runtime`, apply an abortable request timeout, validate every response at the boundary, return closed result unions, and redact errors to bounded categories. Keep all workflow mutations behind this client.
5. **Implement intake and silence.** Register high-priority `inbound_claim` to exclude processing, exact-match sources, require or apply the owner-supplied missing-ID rule, perform optional bounded persistent dedupe, await KM intake, and always return non-claiming. Register `before_dispatch` as a synchronous local source match returning `{ handled: true }` without text regardless of KM outcome.
6. **Implement restricted-session guards.** Block `message` plus each locally proven visible-delivery equivalent for configured session keys; explicitly evaluate `sessions_send` and `sessions_spawn` from repository policy before fixing the deny set. Cancel matching canonical source deliveries in `message_sending` using only local validated config and trusted session context.
7. **Implement one final-send call site.** Poll KM with an abortable, non-overlapping loop; reread and atomically reserve each candidate; pass only returned `SENDING` records to `src/final-send.ts`; call `sendDurableMessageBatch` there with `durability: "required"` and exact account/target/thread/reply fields. Report intent ID, normalized receipt IDs, correlation, timestamp, and bounded category for `sent`, `suppressed`, proven pre-send failure, `partial_failed`, or unknown. Never replay `partial_failed`/unknown without reconciled `NOT_SENT` and a fresh attempt ID.
8. **Prove ownership and recovery.** Test duplicate intake, processing exclusion, source silence, restricted tools/sends, a two-worker reservation race, service stop/restart, pre-send recovery, post-start unknown, partial failure, and receipt normalization. Add a static scoped check proving one outbound import/call and no marker, v1, second store, WhatsApp, or Slack production path.
9. **Document and register the surface.** Add plugin reference/config examples using placeholders and SecretRef, state the accepted failure boundary and one-reserved-attempt wording, regenerate plugin inventory/reference docs if the generator owns them, and add `.github/labeler.yml` coverage plus the matching GitHub label through the maintainer workflow.
10. **Verify and review.** Run the plugin tests first, the listed shared hook/outbound suites, repeated race/restart tests, generated-doc checks, `pnpm build`, `pnpm check:changed`, changed-file/static scans, then fresh `autoreview` until no actionable findings remain.

## Files to Modify

| Path                                                                                                            | Change                                                                                                               |
| --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `extensions/deliberation/{package.json,tsconfig.json,openclaw.plugin.json,api.ts,index.ts}`                     | External-compatible package, startup activation, strict config schema, and hook/service registration.                |
| `extensions/deliberation/src/{config,contracts,km-client,route-match,intake,guards,poll-service,final-send}.ts` | Validated config, KM boundary, source gates, polling, and the sole durable-send call site.                           |
| `extensions/deliberation/src/*.test.ts`                                                                         | Contract, config, hooks, race, crash/restart, outcome, and static ownership tests.                                   |
| `src/plugins/wired-hooks-*.test.ts`, `src/plugins/hooks.security.test.ts`                                       | Characterization-only additions if the named bounded semantics are not already asserted; no production core changes. |
| `docs/plugins/reference/deliberation.md`                                                                        | Installation/configuration, bounded guarantee, reconciliation, and rollback guidance.                                |
| `docs/plugins/plugin-inventory.md`, `docs/plugins/reference/*`                                                  | Generator-owned updates from `pnpm plugins:inventory:gen`, limited to outputs changed by the new package.            |
| `docs/reference/secretref-credential-surface.md`                                                                | Register the KM credential config path as a supported SecretRef surface.                                             |
| `.github/labeler.yml`                                                                                           | Route plugin changes to the new plugin label.                                                                        |

## TDD

Implement the RED/GREEN cycle with `skill:tdd`; record proof in `plans/checkpoints/bright-wave-6041.red-green-proof.md`.

**Target test:** `extensions/deliberation/src/plugin.test.ts`  
**Run:** `pnpm test extensions/deliberation/src/plugin.test.ts`

```ts
import { createTestPluginApi } from "openclaw/plugin-sdk/plugin-test-api";
import { describe, expect, it, vi } from "vitest";
import plugin from "../index.js";

function registerPlugin() {
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
      },
      restrictedSessionKeys: ["agent:reviewer"],
    },
    on: ((name: string, handler: (event: never, ctx: never) => unknown) => {
      hooks.set(name, handler);
    }) as never,
    registerService: vi.fn(),
  });
  plugin.register(api);
  return hooks;
}

describe("deliberation plugin boundary", () => {
  it("keeps a configured Discord source terminally silent", async () => {
    const hooks = registerPlugin();
    expect(hooks.has("inbound_claim")).toBe(true); // RED: plugin does not exist.
    await expect(
      hooks.get("before_dispatch")?.(
        { content: "source message" } as never,
        { channelId: "discord", accountId: "acct-1", conversationId: "source-1" } as never,
      ),
    ).resolves.toEqual({ handled: true });
  });

  it("blocks direct outbound tools in restricted sessions", async () => {
    const hooks = registerPlugin();
    const result = await hooks.get("before_tool_call")?.(
      { toolName: "message", params: { action: "send" } } as never,
      { toolName: "message", sessionKey: "agent:reviewer" } as never,
    );
    expect(result).toMatchObject({ block: true }); // RED: no guard exists.
  });
});
```

| Test                      | RED                                              | GREEN                                                                       |
| ------------------------- | ------------------------------------------------ | --------------------------------------------------------------------------- |
| Configured source silence | Missing plugin/hook or non-terminal result       | Intake remains non-claiming and `before_dispatch` returns terminal silence. |
| Restricted outbound tool  | `before_tool_call` is absent or allows `message` | Restricted session receives a terminal block before execution.              |

Add subsequent RED cases in `config.test.ts`, `intake.test.ts`, `guards.test.ts`, `poll-service.test.ts`, and `final-send.test.ts` before each production module.

## Verification

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

- Repeat the deterministic race and crash/restart test with the test-name filter enough times to expose scheduling flakiness without running independent Vitest processes concurrently.
- Inspect `git diff --name-only` and scoped searches to prove one send call site, no forbidden markers/fallbacks/channel enablement, no core production edits, and no live/config/cron changes.
- Final implementation note records exact commands/results, polling choice, accepted guarantee boundary, and any unresolved KM contract.

## Dependencies

- **Blocking contract gap:** the task does not define missing-provider-ID behavior or the authenticated KM HTTP operations. Production implementation must stop after local interfaces/fixtures until those are supplied repository-locally.
- The KM credential must be added as a structured `SecretInput` config field and to the supported plugin credential surface; no plaintext example or logged resolved value.
- Canonical pilot route/session IDs are runtime config supplied by the operator, not source literals or display names.
- No SDK/core behavior change, second durable store, wake endpoint, official distribution metadata, or non-Discord enablement is part of this task.
