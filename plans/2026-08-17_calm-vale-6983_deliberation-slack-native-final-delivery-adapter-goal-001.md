# Plan 2026-08-17: Complete Slack-native final delivery

Close the owner-contract and evidence gaps around the preserved Slack adapter without redoing its transport implementation or enabling a live route.

*Status: DRAFT*

## Analysis

### Existing behavior

- `extensions/deliberation/src/delivery-target.ts`, `extensions/deliberation/src/final-adapter.ts`, and `extensions/deliberation/index.ts` already implement strict destination-selected Slack/Discord dispatch, one provider call, exact target fencing, bounded receipts/failures, and provider isolation.
- `extensions/slack/src/outbound-adapter.ts` and `extensions/slack/src/send.ts` already provide the established account/thread-aware transport. Existing Deliberation and Slack tests cover both sides of that public outbound seam.
- `extensions/deliberation/contracts/km-wire-v1.json:94`, `extensions/deliberation/contracts/provenance.json:2`, and `extensions/deliberation/src/contract.test.ts:114` remain explicitly Discord-only.
- `extensions/deliberation/src/km-client.test.ts` exercises durable lifecycle evidence only with Discord targets; owner fixtures lack Slack lifecycle and negative vectors.
- `docs/plugins/reference/deliberation.md:10`, `docs/plugins/reference/deliberation.md:85`, and `docs/plugins/reference/deliberation.md:120` still describe Discord-only final delivery.

### Relevant rules

- Sync only an owner-authored KM contract and executable runtime revision. Do not hand-author Slack wire fields in this repository or treat acceptance urgency as protocol authority.
- Preserve the channel boundary in `docs/plugins/sdk-channel-outbound.md`: Deliberation selects and fences the destination; Slack owns account resolution, threading, native send, and receipt shape.
- Reuse `plans/checkpoints/bold-dune-7459.red-green-proof.md:5` as the genuine historical RED. Do not recreate pre-implementation history; capture fresh GREEN for this follow-up.
- Keep unknown named Slack accounts, malformed timestamps, unsupported providers, target conflicts, sentinel receipts, and unbounded evidence fail-closed.

## Available Skills

- `task-evidence`: link exact parent proof provenance and report its truncated-command gap.
- `tdd`: capture the follow-up GREEN artifact without fabricating RED history.
- `openclaw-testing`: select focused tests, changed gates, and build proof.
- `validate-implementation`: check owner contract, plugin boundary, and no-activation constraints.
- `autoreview`: run the mandatory fresh pre-handoff review.
- `save-learning`: save at least one implementation-session learning as the final action.

## Implementation

1. Obtain a KM-owner revision that explicitly supports canonical `discord | slack` delivery targets through ready, reservation, invocation, completion, and stored attempt projections. Require exact Slack account/channel/thread bounds, receipt/failure fields, malformed/conflict behavior, executable runtime support, fixtures, and immutable source hashes. Stop rather than inventing the shape if this revision is unavailable.
2. Import the owner artifacts wholesale into `extensions/deliberation/contracts/km-wire-v1.json` and `extensions/deliberation/contracts/cutover-controls-v1.json`; update `extensions/deliberation/contracts/provenance.json` with the owner revision, scope, source hashes, and mirror hashes. Do not preserve the current stale string-valued fixture targets.
3. Update `extensions/deliberation/src/contract.test.ts` to prove the accepted discriminated target schema and lifecycle references, Slack-origin and Discord-origin Slack destination fixtures, exact equality, receipt/failure persistence, malformed/unsupported/conflicting rejection, and provenance hashes.
4. Extend `extensions/deliberation/src/km-client.test.ts` with a table-driven Slack target lifecycle. Assert exact target bytes in reservation, invocation, and completion requests/responses; successful receipt/message IDs; bounded failure evidence; and rejection of target drift before any provider-facing continuation.
5. Compare the accepted owner schema with the preserved parser/config/runtime. Change `delivery-target.ts`, `config.ts`, `km-client.ts`, the manifest, or adapter code only where the owner shape differs. Keep destination-only provider selection, one post-invocation provider call, explicit Slack account/thread routing, Discord isolation, and no Deliberation retry.
6. Retain the existing public-seam proof instead of adding a cross-plugin private import: Deliberation plugin tests must assert `loadAdapter("slack")` receives exact account/channel/thread and one call; Slack outbound/send tests must assert those values reach `sendMessageSlack` and return the native receipt.
7. Update `docs/plugins/reference/deliberation.md` to describe owner-authorized Slack destinations and KM-bound Slack receipt/failure completion while stating that no live configuration enables the capability.
8. Use `skill:tdd` to create `plans/checkpoints/calm-vale-6983.red-green-proof.md`: link the parent RED and `plans/checkpoints/bold-dune-7459.evidence.md`, note the truncated command-line gap, then capture fresh successful focused and regression commands as GREEN.
9. Run `skill:validate-implementation`, fresh `skill:autoreview`, and resolve accepted findings. Run `skill:save-learning` last.

## Files to Modify

| File | Change |
| --- | --- |
| `extensions/deliberation/contracts/km-wire-v1.json` | Mirror the accepted Slack-capable owner contract. |
| `extensions/deliberation/contracts/cutover-controls-v1.json` | Mirror executable Slack success, failure, and rejection vectors. |
| `extensions/deliberation/contracts/provenance.json` | Pin the owner revision and refreshed hashes. |
| `extensions/deliberation/src/contract.test.ts` | Prove owner authority and complete Slack lifecycle fixture coverage. |
| `extensions/deliberation/src/km-client.test.ts` | Prove exact Slack target, receipt, failure, and drift behavior over the wire. |
| `docs/plugins/reference/deliberation.md` | Document supported but rollout-disabled Slack final delivery. |
| `extensions/deliberation/src/delivery-target.ts`, `extensions/deliberation/src/config.ts`, `extensions/deliberation/src/km-client.ts`, `extensions/deliberation/openclaw.plugin.json` | Modify only if required to match the accepted owner schema. |
| `plans/checkpoints/calm-vale-6983.red-green-proof.md` | Link historical RED and record fresh GREEN provenance. |

## TDD

Implement the evidence cycle with `skill:tdd`. Reuse the genuine parent RED at `plans/checkpoints/bold-dune-7459.red-green-proof.md:5`; do not rerun old code or weaken current behavior to manufacture another RED.

**Historical test file:** `extensions/deliberation/src/final-adapter.test.ts`  
**Owner-contract test files:** `extensions/deliberation/src/contract.test.ts`, `extensions/deliberation/src/km-client.test.ts`  
**Focused GREEN command:** `pnpm test extensions/deliberation/src/contract.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/final-adapter.test.ts extensions/deliberation/src/plugin.test.ts extensions/deliberation/src/sole-send.test.ts extensions/slack/src/outbound-adapter.test.ts extensions/slack/src/send.blocks.test.ts -- --reporter=verbose`

Historical executable skeleton whose RED is already recorded and whose assertions must remain GREEN:

```ts
import { describe, expect, it, vi } from "vitest";
import { createFinalDeliveryAdapter } from "./final-adapter.js";

describe("public final delivery adapter", () => {
  it.each([
    ["Slack", "v1:slack:workspace-a:C123"],
    ["Discord", "v1:discord:source-account:source-channel"],
  ])("routes one %s-origin result only to Slack", async (_, sourceTarget) => {
    const target = {
      provider: "slack" as const,
      accountId: "workspace-a",
      channelId: "C123",
      threadId: "1712345678.123456",
    };
    const slack = vi.fn().mockResolvedValue({ receiptId: "receipt-1", messageId: "message-1" });
    const discord = vi.fn();
    const reservation = {
      recordId: "record-1",
      attemptId: "attempt-1",
      owner: "owner",
      leaseToken: "lease",
      deliveryEnvelope: { sourceTarget, deliveryTarget: target },
      deliveryEnvelopeDigest: "a".repeat(64),
    };
    const km = {
      ready: vi.fn().mockResolvedValue({
        items: [{ recordId: "record-1", text: "reply", effectiveDeliveryTarget: target }],
      }),
      reserve: vi.fn().mockResolvedValue({ outcome: "reserved", reservation }),
      invoke: vi.fn(),
      completeDelivery: vi.fn().mockResolvedValue({ state: "SENT" }),
    };

    await createFinalDeliveryAdapter({
      km,
      providers: { discord: { send: discord }, slack: { send: slack } },
      owner: "owner",
    } as never).runOnce();

    expect(slack).toHaveBeenCalledTimes(1);
    expect(discord).not.toHaveBeenCalled();
    expect(km.completeDelivery).toHaveBeenCalledWith(
      expect.objectContaining({ attemptedTarget: target, providerReceiptId: "receipt-1" }),
    );
  });
});
```

| Behavior | Historical RED | Follow-up GREEN |
| --- | --- | --- |
| Slack/Discord source to Slack destination | Slack target rejected and Slack adapter not loaded. | Both sources dispatch once by durable destination. |
| Receipt/failure completion | Slack evidence was not classified or bounded. | Exact target plus bounded receipt/failure evidence survives KM completion. |
| Invalid/conflicting destination | Existing fail-closed assertions remain protected. | Owner fixtures, KM client, and adapter all call no provider. |
| Discord regression | Existing Discord characterization passed in RED. | Discord remains the only adapter called for Discord targets. |

### Verification

1. Run the focused GREEN command above.
2. Run `pnpm test extensions/deliberation` for the complete plugin regression suite.
3. Run `pnpm tsgo:extensions && pnpm tsgo:extensions:test`.
4. Run targeted repository format/lint checks for changed Deliberation, Slack, and docs files.
5. Run `pnpm changed:lanes --json`, then `pnpm check:changed` for contract/plugin gates.
6. Run `pnpm build` because plugin runtime and published contract surfaces are involved.
7. Run `git diff --check` and verify no live configuration, route, scope, or permission changed.

## Dependencies

- A KM-owner-authored Slack-capable contract, executable runtime, fixtures, and immutable revision/hash evidence are mandatory before repository implementation can close acceptance.
- Existing preserved Slack adapter work is the baseline; do not revert or duplicate it.
- No real Slack/Discord send and no live rollout/configuration change are part of verification.

---
*Created: 2026-08-17*
