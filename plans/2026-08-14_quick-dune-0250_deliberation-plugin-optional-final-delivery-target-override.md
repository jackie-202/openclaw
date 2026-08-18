# Plan 2026-08-14: Deliberation plugin optional final delivery target override

Parse one optional operator route, inject it only at the trusted KM client boundary, and consume only KM's reserved effective target during final delivery.

## Analysis

### Codebase Context

- `extensions/deliberation/src/config.ts` owns strict route validation; `deliveryTarget` can reuse the existing canonical Discord route schema without changing `sources` or `processingSource` invariants.
- `extensions/deliberation/src/km-client.ts` owns the closed KM request/response boundary and already receives parsed operator config. Injecting the configured target here prevents hook payloads and other intake callers from choosing delivery routing.
- `extensions/deliberation/src/final-adapter.ts` currently sends and records `reservation.deliveryEnvelope.sourceTarget`; it must instead consume one durable effective target from the reserved envelope for provider, invocation, and completion.
- `extensions/deliberation/src/intake.ts` should remain unchanged: source admission and `sourceTarget` provenance stay independent from final routing.
- `extensions/deliberation/src/{config,km-client,final-adapter,plugin,contract,sole-send}.test.ts` and `hooks.test.ts` cover the exact boundaries required by acceptance.

### Relevant Documentation

- `docs/plugins/sdk-setup.md` requires manifest JSON Schema and runtime config behavior to stay aligned and fail closed.
- `docs/plugins/sdk-testing.md` prescribes focused bundled-plugin tests through repository test commands.
- `docs/plugins/reference/deliberation.md` documents current same-source delivery and must describe the optional operator override.
- The external proposal could not be read because the tool denied that external directory; the task text and accepted repository-local contract remain the implementation interface.

### Knowledge Base

- `learnings/architecture/2026-07-28_external-contract-gates-precede-behavioral-tdd.md`: confirm the preceding KM-owned contract update before writing behavioral tests or product code.
- `learnings/architecture/2026-07-29_acceptance-fix-plans-must-close-contract-gates-explicitly.md`: require accepted immutable contract evidence and genuine RED/GREEN proof.
- `learnings/architecture/deliberation-final-delivery-lifecycle-boundaries.md`: KM owns the durable envelope and evidence; the plugin makes one exact-account provider call.
- `learnings/security-issues/swift-fork-0553-reuse-canonical-identity-parsers-at-outbound-boundaries.md`: validate both configured and returned destinations with the existing canonical identity encoder/parser.

## Available Skills

- `tdd`: implement and record the required RED/GREEN cycle.
- `openclaw-testing`: choose focused plugin tests and the smallest extension check lane.
- `autoreview`: mandatory fresh pre-handoff review for non-trivial code changes.
- `validate-implementation`: verify task, architecture, and contract alignment after implementation.
- `save-learning`: mandatory final implementation action.

## Approach

Keep `sourceTarget` as immutable source provenance and add a separate canonical `deliveryTarget`. Resolve the optional configured route inside `createKmClient`, reject any caller-supplied target, let KM default omission to source, and require ready/reservation envelopes to carry the effective target. The adapter must use that reserved field for the Discord call and both evidence calls, never `sourceTarget` or current config.

## Implementation

1. Confirm `extensions/deliberation/contracts/km-wire-v1.json` and `provenance.json` contain the preceding KM-owner update: the exact optional intake field and required effective envelope field. The current snapshot lacks them; if still absent, stop before product edits and record the missing contract dependency rather than inventing schema details.
2. Use `skill:tdd` to add the durable-target adapter regression below and config cases for omitted override, valid target B, malformed identity components, nested unknown properties, and root unknown properties. Capture assertion-level RED in `plans/checkpoints/quick-dune-0250.red-green-proof.md`.
3. Add optional `deliveryTarget: route` to `openclaw.plugin.json` and `config.ts`, reusing the existing strict route schema and canonical identity refinement. Add manifest/runtime parity assertions; do not add overlap policy or alter source/processing validation.
4. In `km-client.ts`, derive the encoded target once from parsed operator config using `encodeSourceIdentity`; reject an intake object that already contains routing authority; append the configured field only when present. Update ready/reservation envelope types and closed parsers to require the KM-returned effective target exactly as the accepted local contract defines it.
5. In `final-adapter.ts`, parse `reservation.deliveryEnvelope.deliveryTarget` with `parseSourceIdentity`, use it as `attemptedTarget`, and pass the same string unchanged to `invoke`, provider destination mapping, and `completeDelivery` for success and failure. Do not read config in the adapter.
6. Extend `km-client.test.ts` to prove omitted config emits no override, configured source A emits encoded target B, caller injection fails before transport, and malformed/missing effective envelope targets fail closed. Update canonical ready/reservation fixtures to the accepted contract shape.
7. Extend `final-adapter.test.ts` and `plugin.test.ts` to prove source A sends once through fake Discord account/channel B and records B for invocation/completion, while omitted config preserves same-source delivery. Keep `hooks.test.ts` admission and processing-route assertions unchanged and rerun them as regressions.
8. Add focused assertions in `contract.test.ts` for the accepted intake/envelope fields without editing KM-owned mirrors or provenance. Keep `sole-send.test.ts` green to prove no second sender path was introduced.
9. Update `docs/plugins/reference/deliberation.md` with the optional route, same-source default, durable reservation semantics, and operator-only routing authority.
10. Run the verification commands below, fresh `skill:autoreview` until no actionable findings remain, then `skill:validate-implementation`. Record exact commands/results and zero real Discord sends; invoke `skill:save-learning` last.

## Files to Modify

| File | Change |
| --- | --- |
| `extensions/deliberation/openclaw.plugin.json` | Add optional strict route-shaped manifest config. |
| `extensions/deliberation/src/config.ts` | Parse the optional route with existing canonical validation. |
| `extensions/deliberation/src/config.test.ts` | Cover omission, override, invalid routes, unknown keys, and manifest parity. |
| `extensions/deliberation/src/km-client.ts` | Inject operator routing and parse the durable effective envelope target. |
| `extensions/deliberation/src/km-client.test.ts` | Prove wire injection, caller rejection, and closed envelope parsing. |
| `extensions/deliberation/src/final-adapter.ts` | Send and record only the reserved effective target. |
| `extensions/deliberation/src/final-adapter.test.ts` | Prove source A to target B and evidence consistency. |
| `extensions/deliberation/src/plugin.test.ts` | Prove fake Discord receives the exact durable account/channel and default behavior remains. |
| `extensions/deliberation/src/contract.test.ts` | Assert the consumed accepted contract fields. |
| `docs/plugins/reference/deliberation.md` | Document optional operator routing and same-source default. |

## TDD

Implement the TDD cycle with `skill:tdd`; write evidence to `plans/checkpoints/quick-dune-0250.red-green-proof.md`.

**Test file:** `extensions/deliberation/src/final-adapter.test.ts`  
**Run command:** `pnpm test extensions/deliberation/src/final-adapter.test.ts -- --reporter=verbose`  
**Edit:** Append to `describe("public final delivery adapter")` using the existing imports.

```ts
it("uses the durable delivery target for send and all evidence", async () => {
  const durableReservation = {
    ...reservation,
    deliveryEnvelope: {
      sourceTarget: "v1:discord:account-a:channel-a",
      deliveryTarget: "v1:discord:account-b:channel-b",
    },
  };
  const provider = {
    send: vi.fn().mockResolvedValue({ receiptId: "receipt-1", messageId: "message-1" }),
  };
  const km = {
    ready: vi.fn().mockResolvedValue({ items: [{ recordId: "record-1", text: "reply" }] }),
    reserve: vi.fn().mockResolvedValue({ outcome: "reserved", reservation: durableReservation }),
    invoke: vi.fn().mockResolvedValue({}),
    completeDelivery: vi.fn().mockResolvedValue({ state: "SENT" }),
  };

  await createFinalDeliveryAdapter({ km, provider, owner: "owner" }).runOnce();

  expect(provider.send).toHaveBeenCalledWith(
    expect.objectContaining({ accountId: "account-b", channelId: "channel-b" }),
  );
  expect(km.invoke).toHaveBeenCalledWith(
    durableReservation,
    "v1:discord:account-b:channel-b",
    "provider:attempt-1",
  );
  expect(km.completeDelivery).toHaveBeenCalledWith(
    expect.objectContaining({ attemptedTarget: "v1:discord:account-b:channel-b" }),
  );
});
```

| Test | RED before implementation | GREEN after implementation |
| --- | --- | --- |
| Durable target B | Provider receives account/channel A; evidence records A | Provider and both evidence calls use B |
| Config omission | Existing fixtures lack the new effective envelope contract | KM defaults to source and adapter sends source |
| Configured override | Config or wire field is rejected/ignored | Canonical B is emitted and returned durably |
| Invalid/caller-selected route | No explicit override contract | Strict parse or pre-transport rejection |

## Verification

1. `pnpm test extensions/deliberation/src/config.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/final-adapter.test.ts extensions/deliberation/src/plugin.test.ts extensions/deliberation/src/contract.test.ts extensions/deliberation/src/sole-send.test.ts extensions/deliberation/src/hooks.test.ts -- --reporter=verbose`
2. `pnpm test extensions/deliberation -- --reporter=verbose`
3. `pnpm tsgo:extensions && pnpm tsgo:extensions:test`
4. `pnpm changed:lanes --json`, then `pnpm check:changed` for the selected extension lint/type/guard lanes.
5. `git diff --check`

## Dependencies

- The preceding task must first update the accepted repository-local KM contract/provenance with the exact intake and effective-envelope `deliveryTarget` shape; this plan does not modify `km-system` or invent compatibility behavior.
- All tests use mocked KM/Discord boundaries. No live listener, spool, credentials, or Discord send is required.

---
*Created: 2026-08-14*  
*Status: DRAFT*
