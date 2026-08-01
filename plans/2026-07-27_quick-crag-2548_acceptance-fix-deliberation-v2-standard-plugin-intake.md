# Plan 2026-07-27: Deliberation v2 acceptance repair

Define the smallest contract-authorized path to implement and prove the missing Deliberation plugin behavior without repeating completed investigation work.

## Analysis

### Codebase context

- `extensions/deliberation/` is still absent; preserved work consists only of plans, investigation, checkpoints, and learnings.
- `plans/tasks/2026-07-27_deliberation-v2-channel-intake-gate-final-send-adapter.md` authorizes a plugin-only Discord pilot but explicitly stops before production code unless KM supplies the complete wire contract.
- `extensions/AGENTS.md` requires production imports through public `openclaw/plugin-sdk/*` subpaths and plugin-local files; no core or private-extension imports are allowed.
- `extensions/thread-ownership/index.ts` demonstrates `message_sending` cancellation; `extensions/diagnostics-prometheus/index.ts` demonstrates startup service registration.
- `src/plugin-sdk/plugin-test-api.ts` supplies direct registration tests; loader-backed smoke coverage is additionally required by `docs/plugins/sdk-testing.md`.
- `src/plugin-sdk/channel-outbound.ts` exposes `sendDurableMessageBatch`; its result distinguishes `sent`, `suppressed`, `partial_failed`, and `failed`, so unknown/retry policy remains KM-owned.

### Relevant documentation

- `docs/investigations/deliberation-v2-standard-plugin-capability-investigation.md` establishes the bounded design: non-claiming `inbound_claim`, silent terminal `before_dispatch`, cooperative outbound guards, and one KM-reserved send attempt.
- `docs/plugins/sdk-testing.md` requires focused SDK test imports and at least one loader-backed registration smoke test.
- `docs/plugins/sdk-channel-outbound.md`, `docs/plugins/sdk-overview.md`, and `docs/plugins/sdk-setup.md` define durable-send outcomes, service registration, manifest/config validation, and startup activation.
- `docs/reference/secretref-credential-surface.md` must be updated only after the owner chooses the KM credential path.

### Knowledge base

- `learnings/architecture/bright-wave-6041-external-authority-contracts-must-precede-plugin-implementation.md`: architectural invariants do not define HTTP methods, auth, payloads, CAS conflicts, leases, or retry authorization; mocks must come from owner-approved fixtures.
- `learnings/architecture/quick-crag-5748-acceptance-does-not-grant-protocol-authority.md`: an acceptance demand to supply a contract is not itself protocol authority, and missing-target/baseline results are not behavioral RED/GREEN.
- Recall used deterministic local fallback because collection `openclaw-fork-learnings` was unavailable; unrelated runtime-profile results were discarded.

## Available Skills

- `tdd`: capture an assertion-level plugin RED before behavior implementation and fresh GREEN afterward.
- `task-evidence`: link prior missing-target evidence only as historical provenance.
- `openclaw-testing`: select focused plugin, hook, outbound, build, and changed-check verification.
- `technical-documentation`: document SecretRef setup and bounded delivery wording.
- `autoreview` and `validate-implementation`: mandatory pre-handoff review and boundary validation.
- `save-learning`: persist a task learning as the final workflow action.

## Solution

Add one external-compatible Discord-pilot plugin after the KM owner supplies repository-local protocol fixtures. Keep intake, route matching, terminal silence, outbound guards, polling, and the sole durable-send call plugin-local; keep workflow state, reservation, completion, and reconciliation exclusively in KM.

## Implementation

1. Obtain owner-approved repository-local contract artifacts covering missing `messageId`, HTTP methods/paths/auth/headers, endpoint network policy, request/response variants, pagination or cursor rules, lease/CAS conflicts, completion outcomes, and the proof required for `NOT_SENT` plus a fresh attempt. Stop if any item remains ambiguous.
2. After contract approval, add package metadata and an inert loadable `definePluginEntry` that registers nothing. Use `skill:tdd` to add `extensions/deliberation/src/plugin.test.ts`, run it to an assertion-level RED, and record exact output in `plans/checkpoints/quick-crag-2548.red-green-proof.md`; link parent proofs as historical missing-target evidence only.
3. Add strict manifest/runtime config for canonical Discord source tuples, one excluded processing tuple, KM endpoint/SecretRef, bounded request/poll intervals, and restricted session keys. Reject duplicate/overlapping routes, display-name identifiers, unsupported channels, malformed endpoints, missing restrictions, and non-`true` fail-closed mode.
4. Implement one route matcher shared by all hooks and resolve credentials through `openclaw/plugin-sdk/secret-input` without logging values. Do not add core config, environment variables, file state, or a second database.
5. Implement a typed, abortable KM client directly from owner fixtures. Validate unknown responses at the boundary and return closed unions for intake, ready listing, reservation, completion, and reconciliation.
6. Register high-priority `inbound_claim` to synchronously submit matched events and always continue non-claiming; exclude the processing tuple before KM access. Register `before_dispatch` to return `{ handled: true }` without text for every configured source regardless of KM outcome.
7. Register `before_tool_call` to block every repository-verified visible-delivery tool for configured restricted sessions and `message_sending` to cancel their canonical sends to configured sources. Document these as cooperative trusted-process guards, not a sandbox.
8. Register one abortable, non-overlapping polling service. Reread and atomically reserve each ready record; call the final-send adapter only for `SENDING` plus a fresh `deliveryAttemptId`.
9. Keep the only `sendDurableMessageBatch` import/call in `src/final-send.ts`, require durability, preserve account/target/thread/reply fields, and report normalized queue/receipt/correlation data. Map pre-send failure separately from `partial_failed` or unknown provider acceptance.
10. Never replay after send start, process loss, `partial_failed`, or unknown acceptance. Allow another call only when approved reconciliation proves `NOT_SENT` and KM returns a new reservation and attempt ID.
11. Add contract/client/service tests for duplicate intake, processing exclusion, silence under every KM result, outbound guards, two-worker races, stop/restart cleanup, before-send recovery, unknown/partial outcomes, fresh-attempt reconciliation, receipt normalization, and route preservation. Add loader-backed registration and static sole-send ownership tests.
12. Document SecretRef setup and the bounded guarantee: duplicate workers produce at most one KM-reserved OpenClaw send call; unknown outcomes are not retried until reconciled; a returned receipt is persisted once. Update plugin inventory/label routing required for a new plugin.
13. Run focused tests, repeated race/restart tests, plugin inventory checks, build, changed checks, and `git diff --check`. Run `skill:autoreview` until no actionable findings remain, then `skill:validate-implementation`.
14. Finish `plans/checkpoints/quick-crag-2548.red-green-proof.md` with the exact behavioral RED, production GREEN, regression commands, and outcomes. Run `skill:save-learning` last and persist at least one implementation/proof learning.

## Files to Modify

| Path                                                                                                  | Change                                                                             |
| ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `extensions/deliberation/contracts/*`                                                                 | Owner-approved KM protocol/schema fixtures; no inferred wire behavior.             |
| `extensions/deliberation/{package.json,tsconfig.json,openclaw.plugin.json,api.ts,index.ts}`           | External-compatible package, strict config, startup activation, and registrations. |
| `extensions/deliberation/src/{config,route-match,km-client,intake,guards,poll-service,final-send}.ts` | Intake, silence, guards, reservation, bounded send, reporting, and reconciliation. |
| `extensions/deliberation/src/*.test.ts`                                                               | Behavioral RED/GREEN, contract, race, recovery, loader, and ownership coverage.    |
| `docs/plugins/reference/deliberation.md`                                                              | SecretRef configuration, operation, limitations, and bounded guarantee.            |
| `docs/plugins/plugin-inventory.md`, generated inventory outputs, `.github/labeler.yml`                | Register and route the new plugin using repository generators.                     |
| `docs/reference/secretref-credential-surface.md`                                                      | Register the approved KM credential path.                                          |
| `plans/checkpoints/quick-crag-2548.red-green-proof.md`                                                | Current-task RED/GREEN and regression evidence.                                    |

## TDD

Implement the cycle with `skill:tdd`. The parent proofs contain no genuine behavioral RED, so retain them only as provenance; the first valid RED for this repair must be an executed assertion failure against the inert, loadable plugin scaffold before behavior is added.

**Test file:** `extensions/deliberation/src/plugin.test.ts`  
**Run command:** `pnpm test extensions/deliberation/src/plugin.test.ts`  
**Edit hint:** after the approved contract and inert entry scaffold exist, add this test before implementing hook registration.

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

| Test                      | RED before implementation                                 | GREEN after implementation                                         |
| ------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------ |
| Boundary registration     | Hook list is empty and service count is zero              | Four hooks and one polling service register.                       |
| Configured-source silence | Added hook test receives no terminal result               | `before_dispatch` returns `{ handled: true }` without text.        |
| Restricted-session guard  | Added hook test allows a verified outbound tool           | `before_tool_call` returns `{ block: true }`.                      |
| Reservation race          | Added service test observes zero/duplicate send ownership | Two workers yield one reservation and one final-send call.         |
| Unknown reconciliation    | Added recovery test permits replay or lacks a result      | Unknown remains unsent until `NOT_SENT` proof and a fresh attempt. |

Then run:

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

- Blocking: no owner-approved KM wire contract is present in the repository as of this plan; implementation must not invent it.
- The operator must supply canonical Discord IDs and restricted session keys through config; no live identifiers or credentials enter source/tests/docs.
- The bounded plugin-only guarantee remains accepted; stricter absent-plugin, hostile-plugin, or exactly-once-visible guarantees require separate generic core/provider work.

---

_Created: 2026-07-27_  
_Status: DRAFT_
