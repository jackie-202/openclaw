# Plan 2026-08-17: Converge OpenClaw Deliberation intake and mirrored KM contract

Align the Deliberation producer and local KM contract evidence on the admitted source-thread and structured delivery semantics.

*Status: DRAFT*
*Created: 2026-08-17*

## Progress

- [x] Phase 0: Config + init
- [x] Phase 1: Research
- [x] Phase 2: Knowledge
- [x] Phase 3: Synthesis

## Analysis

### Codebase context

- `extensions/deliberation/src/route-match.ts` already normalizes Slack source threads as `threadId ?? providerEventId`; Discord admissions expose only `providerEventId` today.
- `extensions/deliberation/src/intake.ts` sends `provider`, `providerEventId`, and account-scoped `sourceTarget`, but omits the admitted source-thread value.
- `extensions/deliberation/src/km-client.ts` defines and serializes `KmIntakeBody`; its closed request guards make this the typed/client wire boundary.
- `extensions/deliberation/contracts/km-wire-v1.json` lacks required `sourceThreadId` and models durable targets as provider-specific unions instead of the handed-off generic structured target. `reservationBody.deliveryTarget` is currently structured-only.
- `extensions/deliberation/src/delivery-target.ts` is the intentional OpenClaw provider adapter/config overlay and can retain stricter Discord/Slack constraints outside the owner mirror.
- `extensions/deliberation/src/hooks.test.ts`, `src/route-match.test.ts`, `src/km-client.test.ts`, `src/contract.test.ts`, and `scripts/intake-producer.test.ts` cover admission, emitted intake JSON, lifecycle parsing, mirror semantics, and the real Discord producer path.
- `extensions/deliberation/contracts/provenance.json` hashes local mirrors and owner files; update it only after semantic fixtures/tests are aligned and passing.

### Relevant documentation

- `extensions/AGENTS.md` keeps all production changes inside the plugin boundary and permits local private helpers/types.
- The task handoff is the external contract authority for this bounded plan; do not inspect `km-system`. Missing exact fixture/provenance values must remain an explicit follow-up.

### Knowledge base

- Treat the supplied proposal verdict as the wire authority; do not infer missing cross-repository fields or inspect `km-system` (`learnings/architecture/2026-07-27_external-authority-must-define-the-wire-contract.md`).
- Prove semantic contract fields before refreshing hashes; passing hash assertions alone does not prove the current wire (`learnings/architecture/deliberation-provenance-pass-can-still-block-future-wire-shape.md`).
- Keep source routing/grouping separate from thread identity: `sourceTarget` remains `v1:<provider>:<account>:<channel>`, while `sourceThreadId` identifies the admitted root thread. Older account-less source-target learnings are superseded by the current mirror and task handoff.
- Preserve OpenClaw’s strict destination/provider checks at the adapter/config boundary even when the KM owner wire uses a generic structured target.

## Available Skills

- `tdd`: implement the behavioral change RED-first and retain RED/GREEN proof.
- `openclaw-testing`: choose focused plugin test commands and the final changed-surface gate.
- `autoreview`: mandatory fresh pre-land review after implementation and verification.
- `save-learning`: capture contract-mirror/overlay lessons after implementation.

## Solution

Carry one required `sourceThreadId` fact from admission through `KmIntakeBody` to JSON. Keep `sourceTarget` account/channel scoped. Mirror the generic KM destination shape, but retain provider-specific OpenClaw validation as an explicitly local overlay.

## Implementation

1. Use `skill:tdd` to add RED assertions in `route-match.test.ts` and `hooks.test.ts`: Discord root uses `providerEventId`; Slack root uses its event timestamp; Slack reply uses the root `threadId`; every emitted body contains only camelCase `sourceThreadId` and preserves `v1:<provider>:<account>:<channel>`.
2. Change accepted `SourceAdmission` to carry required `sourceThreadId`; compute it once as Slack `threadId ?? providerEventId` or Discord `providerEventId`. Reuse it for Slack thread registration and KM intake instead of deriving it again.
3. Add required `sourceThreadId` to `KmIntakeBody`, serialize it unchanged in `createKmClient`, and update client/producer fixtures so exact request-body tests reject omission and `source_thread_id`.
4. Reconcile `km-wire-v1.json`: require camelCase `sourceThreadId` with the 1..96 destination-component grammar; define one closed generic structured `{provider, accountId, channelId, threadId?}` target; allow the bounded canonical legacy string only in `reservationBody.deliveryTarget`; require structured targets in delivery envelopes, ready/reservation responses, invocations, completions, and durable attempts. Preserve bounded provider failure evidence.
5. Update `cutover-controls-v1.json` intake and delivery lifecycle vectors to the same semantics. Move `structuredDestinationVectors` to a clearly named OpenClaw overlay fixture if it is not part of the owner mirror; keep `delivery-target.ts`, manifest schemas, and `config.test.ts` as the stricter Discord/Slack adapter overlay.
6. Rewrite `contract.test.ts` assertions around semantics rather than old provider-specific mirror names: generic target bounds, reservation-only legacy input, no legacy output refs, required `sourceThreadId`, camelCase-only fields, and unchanged provider-evidence bounds. Add Discord root, Slack root, and Slack reply fixtures with account-scoped source identities.
7. Run focused semantic tests first. Only after they pass, refresh local artifact SHA-256 values and provenance scope/evidence. Do not invent a replacement owner revision/hash absent from the handoff; mark that exact pin as a follow-up and retain no stale claim that a changed file is byte-identical to the old owner revision.
8. Run the plugin regression and changed-surface checks, then fresh `skill:autoreview`; resolve actionable findings. The implementation final note must list commands/results, the retained OpenClaw overlay, and the owner-pin follow-up if still unresolved. Run `skill:save-learning` last.

## Files to Modify

| File | Change |
| --- | --- |
| `extensions/deliberation/src/route-match.ts` | Return required normalized `sourceThreadId` for Discord and Slack admissions. |
| `extensions/deliberation/src/intake.ts` | Pass the admitted value to thread registration and KM intake. |
| `extensions/deliberation/src/km-client.ts` | Add the exact camelCase intake field to the typed/client boundary. |
| `extensions/deliberation/src/route-match.test.ts` | Prove provider-specific root/reply normalization. |
| `extensions/deliberation/src/hooks.test.ts` | Prove exact emitted intake bodies and account-scoped source identity. |
| `extensions/deliberation/src/km-client.test.ts` | Prove JSON wire casing and required field at the client boundary. |
| `extensions/deliberation/scripts/intake-producer.test.ts` | Prove the real Discord producer emits `sourceThreadId`. |
| `extensions/deliberation/contracts/km-wire-v1.json` | Mirror required intake and generic destination lifecycle semantics. |
| `extensions/deliberation/contracts/cutover-controls-v1.json` | Refresh semantic request/lifecycle fixtures. |
| `extensions/deliberation/contracts/openclaw-overlay-v1.json` | Add only if needed to separate existing OpenClaw-specific vectors from the owner mirror. |
| `extensions/deliberation/src/contract.test.ts` | Prove mirror/overlay separation, transitional input, structured outputs, and bounds. |
| `extensions/deliberation/contracts/provenance.json` | Refresh computable pins after semantic GREEN and record the approved evidence source/gap accurately. |

## TDD

Implement the RED/GREEN cycle with `skill:tdd`; record evidence in `plans/checkpoints/quick-reef-1568.red-green-proof.md`.

**Primary test file:** `extensions/deliberation/src/hooks.test.ts`  
**Run command:** `pnpm test extensions/deliberation/src/route-match.test.ts extensions/deliberation/src/hooks.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/scripts/intake-producer.test.ts extensions/deliberation/src/contract.test.ts -- --reporter=verbose`

Append this table-driven RED test using the file's existing imports/helpers:

```ts
it.each([
  ["Discord root", "discord", "acct", "source", "m1", undefined, "m1"],
  ["Slack root", "slack", "workspace-a", "C123", "1723640000.000100", undefined, "1723640000.000100"],
  ["Slack reply", "slack", "workspace-a", "C123", "1723640000.000200", "1723640000.000100", "1723640000.000100"],
] as const)("emits sourceThreadId for %s", async (_name, provider, accountId, channelId, messageId, threadId, expected) => {
  const intake = vi.fn().mockResolvedValue({ recordId: "r1", inboundId: "i1", duplicate: false });
  const routeConfig = parseDeliberationConfig({
    enabled: true,
    failClosed: true,
    sources: [{ channel: provider, accountId, target: channelId }],
    processingSource: { channel: "discord", accountId: "acct", target: "processing" },
    km: config.km,
    restrictedSessionKeys: ["agent:reviewer"],
  });
  const threadStore = { registerIfAbsent: vi.fn().mockResolvedValue(true), lookup: vi.fn() };
  const handler = createInboundClaimHandler(routeConfig, { intake } as never, createLogger(), threadStore as never);

  await handler(
    { provider, channel: provider, eventType: "message", eventKind: "user_request", accountId,
      conversationId: channelId, messageId, threadId, senderId: "sender", content: "message", isGroup: true },
    { channelId: provider, accountId, conversationId: channelId, messageId, senderId: "sender" },
  );

  expect(intake).toHaveBeenCalledWith(expect.objectContaining({
    sourceTarget: `v1:${provider}:${accountId}:${channelId}`,
    sourceThreadId: expected,
  })); // RED: sourceThreadId is currently omitted.
  expect(intake.mock.calls[0]?.[0]).not.toHaveProperty("source_thread_id");
});
```

| Test | RED | GREEN |
| --- | --- | --- |
| Discord root | Intake body has no `sourceThreadId`. | Body uses the Discord message ID. |
| Slack root | Intake body has no `sourceThreadId`. | Body uses the root event timestamp. |
| Slack reply | Intake body has no `sourceThreadId`. | Body retains the root `threadId`, not the child event ID. |
| Contract mirror | `intakeBody` omits the field and target schemas permit the wrong lifecycle shapes. | Required camelCase intake, reservation-only legacy input, and structured durable outputs pass. |

## Verification

1. RED then GREEN: run the focused command above.
2. Run `pnpm test extensions/deliberation -- --reporter=verbose` for producer, route/admission, adapter, and contract regressions.
3. Run `pnpm changed:lanes --json`, then `pnpm check:changed` for extension type/lint/guard coverage.
4. Run `pnpm build` because the plugin runtime/type boundary changes.
5. Run `git diff --check` and verify provenance hashes were changed only after semantic GREEN.
6. Run fresh `skill:autoreview` until no accepted/actionable findings remain.

## Dependencies

- The supplied proposal verdict and stable handoff are the only external contract evidence allowed for this task.
- Exact replacement KM owner revision/file hashes are not supplied. Record that as a follow-up rather than reading `km-system` or fabricating provenance.
- No runtime config, listener state, gateway deployment, or live provider send is in scope.
