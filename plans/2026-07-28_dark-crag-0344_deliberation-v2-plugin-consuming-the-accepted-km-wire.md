# Plan 2026-07-28: Deliberation v2 plugin consuming the accepted KM wire

Implement the bounded plugin entirely on public SDK seams, with KM retaining durable intake, reservation, delivery-attempt, reconciliation, and cutover-control authority.

## Analysis

- `extensions/deliberation/` and an accepted KM fixture bundle are not present. Implementation must stop until repository-local artifacts define protocol version/provenance/hash, auth and endpoint policy, missing-message behavior, closed intake/list/reserve/complete/reconcile variants, cursor/lease/CAS rules, `NOT_SENT` proof, and fresh-attempt issuance.
- The cutover controls also need accepted fixtures for persistence, transitions, restart behavior, scopes, command/RPC names, machine-readable results, and synthetic fixture IDs. Do not substitute process-local flags or new core config.
- `inbound_claim`, `before_dispatch`, `before_tool_call`, `message_sending`, `registerService`, SecretRef helpers, health checks, Gateway methods, CLI registration, and `sendDurableMessageBatch` are available through public `openclaw/plugin-sdk/*` surfaces.
- The bounded guarantee remains: one KM-reserved OpenClaw send call; `partial_failed` or uncertain acceptance is not replayed; a returned receipt is completed once. Do not claim plugin-absence fail-closed behavior or provider-visible exactly-once delivery.
- Recall used local fallback because `openclaw-fork-learnings` was unavailable. Relevant rules are `learnings/architecture/bright-wave-6041-external-authority-contracts-must-precede-plugin-implementation.md` and `learnings/architecture/external-authority-wire-contract-blocks-plugin-implementation.md`.

## Available Skills

- `tdd`: capture genuine assertion-level RED/GREEN in `plans/checkpoints/dark-crag-0344.red-green-proof.md`.
- `openclaw-testing`: run focused plugin/hook/outbound proof locally and broad changed gates through the repository wrapper.
- `technical-documentation`: keep the generated reference page operator-focused and free of credentials or payloads.
- `autoreview`, `validate-implementation`, `save-learning`: required implementation closeout, in that order with `save-learning` last.

## Approach

- Treat the accepted contract bundle as generated/immutable input. Verify every file against its accepted provenance/hash manifest before writing client code; stop on any absent, unknown, or contradictory variant.
- Keep the package bundled in this source tree but external-compatible: production imports use only focused `openclaw/plugin-sdk/*` paths and plugin-local modules. Do not add a Deliberation SDK facade or core production code.
- Parse strict config once, then pass one normalized exact Discord route set to intake, silence, outbound guards, and delivery. The excluded processing tuple is checked before any KM call.
- Keep silence local and deterministic. KM failure changes intake/health state but never allows ordinary configured source traffic to reach normal dispatch.
- Keep all durable state and cutover-control state in KM under the accepted contract. The plugin service owns only one lifecycle-scoped `AbortController` and one in-flight loop promise.
- Keep the sole durable-send import/call in `src/final-send.ts`; all outcome-to-KM transitions remain closed and fixture-driven.

## Implementation

1. Verify the accepted contract and cutover-control fixture bundle is repository-local, approved, versioned, and hash-complete. Record exact provenance in `extensions/deliberation/contracts/`; stop and name the missing artifact or contradictory case instead of deriving behavior from earlier plans.
2. Add the package/manifest/tsconfig/API scaffolding with strict manifest-first config, startup activation, SecretRef registration for `plugins.entries.deliberation.config.km.credential`, and an inert loadable `definePluginEntry`. Keep publish metadata and root package exclusions unchanged unless the accepted distribution manifest explicitly requires official external publication.
3. Use `skill:tdd` to add the registration test below against the inert entry, capture RED through the proof helper, and verify the proof file exists before adding hook/service behavior. Preserve older missing-target checkpoints only as provenance.
4. Implement `src/config.ts` and `src/route-match.ts`: reject unknown keys, non-Discord/display-name routes, duplicates or source/processing overlap, invalid endpoint policy, unbounded timeouts/polls, empty restricted sessions, plaintext-only credential assumptions, and any fail-closed value other than `true`. Return one normalized route representation shared by all consumers.
5. Implement `src/km-client.ts` directly from accepted methods, headers, authentication, schemas, error variants, cursor/lease/CAS conflicts, and control transitions. Resolve the SecretRef at call time without logging it; validate every response into a closed union; propagate `AbortSignal`; redact request bodies, credentials, and provider payloads from errors/health output.
6. Implement intake and silence: `inbound_claim` checks the processing tuple first, synchronously submits only exact pilot events, maps duplicates to the same KM identity, and always returns non-claiming. `before_dispatch` independently returns `{ handled: true }` without text for exact pilot sources under accepted, duplicate, timeout, unavailable, malformed, disabled-intake, and safe-silence states.
7. Implement cooperative guards: `before_tool_call` blocks the accepted send-capable tool set for exact restricted session keys, and `message_sending` cancels canonical sends from those sessions to configured source targets. Keep both checks local; do not call KM from hook policy or infer authorization from message content.
8. Implement one service in `src/poll-service.ts`: `start` creates one controller and loop promise; each iteration lists, rereads, and atomically reserves before processing; no next poll starts while work is active; `stop` aborts and awaits the loop. Sender-disabled and safe-silence states must not reserve or send, according to the accepted control fixture.
9. Implement `src/final-send.ts` as the only `sendDurableMessageBatch` owner. Require a fresh KM `SENDING` attempt, use `durability: "required"`, pass the shared abort signal, and preserve account, target, thread, reply, session/correlation, queue intent, complete multipart receipt, platform IDs, and timestamps. Complete the matching attempt once; classify `partial_failed`, process loss, unknown-stage failure, or uncertain provider acceptance as fixture-defined unknown/partial states without replay. Permit a later call only after accepted `NOT_SENT` proof and a newly reserved attempt ID.
10. Register the fixture-defined health, intake, sender, safe-silence, and synthetic controls through plugin-prefixed Gateway methods plus a machine-readable CLI; add doctor health as diagnostics, not readiness. Synthetic commands accept only named accepted fixtures and remain mocked/dry-run in tests so this task never activates traffic or external delivery.
11. Add focused tests for strict config, exact route matching, processing exclusion before fetch, duplicate intake, terminal silence for every KM outcome, both guards, abort/non-overlap, two-worker CAS races, restart recovery, pre-send failure, partial/unknown non-retry, reconciled fresh attempts, receipt completion, controls, redaction, and static sole-send ownership. Add a loader-backed source-checkout smoke test that proves the real manifest loads and exactly the intended hooks plus one service register.
12. Generate plugin inventory/reference and SecretRef credential surfaces; add `.github/labeler.yml` coverage and the matching repository label through the maintainer workflow. Document only canonical IDs, SecretRef setup, controls, health interpretation, processing exclusion, and bounded delivery guarantees.
13. Run the verification commands below, `git diff --check`, and fresh `skill:autoreview` until no actionable findings remain. Then run `skill:validate-implementation`; update the checkpoint/proof with exact outcomes and run `skill:save-learning` as the final action.

## Files to Modify

| Path                                                                                                  | Change                                                                                                          |
| ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `extensions/deliberation/contracts/*`                                                                 | Accepted immutable KM/control fixtures plus provenance and hash verification.                                   |
| `extensions/deliberation/{package.json,tsconfig.json,openclaw.plugin.json,api.ts,index.ts}`           | External-compatible package, strict config metadata, SecretRef contract, controls, four hooks, and one service. |
| `extensions/deliberation/src/{config,route-match,km-client,intake,guards,poll-service,final-send}.ts` | Normalization, authenticated KM boundary, silence/guards, serialized worker, and sole send adapter.             |
| `extensions/deliberation/src/*.test.ts`                                                               | Registration, fixture contract, behavior, race/recovery, controls, redaction, and sole-send tests.              |
| `src/plugins/source-checkout-runtime.test.ts`                                                         | Loader-backed real-plugin registration smoke coverage without deep plugin imports.                              |
| `docs/plugins/{plugin-inventory.md,reference.md,reference/deliberation.md}`                           | Generated inventory/reference plus preserved manual operator guidance.                                          |
| `docs/reference/{secretref-credential-surface.md,secretref-user-supplied-credentials-matrix.json}`    | Register the KM credential path and regenerate canonical SecretRef evidence.                                    |
| `.github/labeler.yml`                                                                                 | Route plugin and reference-doc changes to the matching plugin label.                                            |
| `plans/checkpoints/dark-crag-0344.{checkpoint,red-green-proof}.md`                                    | Implementation checkpoint and helper-captured TDD/proof evidence without secrets or payloads.                   |

## TDD

Implementace TDD cyklu dle skill:tdd. Create the inert loadable entry first, then add this test verbatim before behavior. Run RED and GREEN through the helper with the same focused command; do not manually fabricate proof.

**Test file:** `extensions/deliberation/src/plugin.test.ts`  
**Focused test:** `pnpm test extensions/deliberation/src/plugin.test.ts -- --reporter=verbose`  
**RED command:** `TASK_ID=dark-crag-0344 python3 "$HOME/.config/opencode/skills/tdd/scripts/proof-capture.py" red -- pnpm test extensions/deliberation/src/plugin.test.ts -- --reporter=verbose`  
**GREEN command:** `TASK_ID=dark-crag-0344 python3 "$HOME/.config/opencode/skills/tdd/scripts/proof-capture.py" green -- pnpm test extensions/deliberation/src/plugin.test.ts -- --reporter=verbose`

```ts
import { createTestPluginApi } from "openclaw/plugin-sdk/plugin-test-api";
import { describe, expect, it, vi } from "vitest";
import plugin from "../index.js";

describe("deliberation plugin boundary", () => {
  it("registers intake, terminal silence, outbound guards, and the worker", () => {
    const on = vi.fn();
    const registerService = vi.fn();

    plugin.register(
      createTestPluginApi({
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
        on,
        registerService,
      }),
    );

    expect(on.mock.calls.map(([name]) => name)).toEqual([
      "inbound_claim",
      "before_dispatch",
      "before_tool_call",
      "message_sending",
    ]); // RED: inert entry registers no hooks.
    expect(registerService).toHaveBeenCalledTimes(1); // RED: inert entry registers no worker.
  });
});
```

| Test                  | RED                               | GREEN                                                 |
| --------------------- | --------------------------------- | ----------------------------------------------------- |
| Registration boundary | Empty hook list and zero services | Four hooks in canonical order and exactly one service |

After the first GREEN, add each behavior group as a new RED/GREEN cycle in the same proof file before its production slice. Never treat missing files, compile errors, or historical baseline output as behavioral RED.

## Verification

```bash
pnpm test extensions/deliberation
pnpm test src/plugins/wired-hooks-inbound-claim.test.ts src/plugins/wired-hooks-reply-dispatch.test.ts src/plugins/hooks.before-agent-reply.test.ts
pnpm test src/plugins/wired-hooks-message.test.ts src/plugins/wired-hooks-reply-payload-sending.test.ts src/plugins/hooks.security.test.ts src/plugins/hooks.correlation.test.ts
pnpm test src/infra/outbound/deliver.test.ts src/infra/outbound/delivery-queue.recovery.test.ts src/channels/message/receipt.test.ts
pnpm plugins:inventory:check
pnpm build
pnpm check:changed
```

## Dependencies

- Blocking: accepted KM wire, final-delivery, reconciliation, cutover-control, and synthetic fixtures with provenance/hashes must be present under the repository scope.
- Canonical Discord IDs and restricted session keys enter config/fixtures as non-live placeholders; credentials and message/provider payloads never enter source, logs, docs, or checkpoints.
- No live plugin config, worker, cron, source traffic, or external messaging is activated by implementation or verification.

---

_Status: DRAFT_
