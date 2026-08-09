# Plan 2026-08-06: OpenClaw account-aware Deliberation producer admission

_Status: DRAFT_

## Analysis

- `extensions/deliberation/src/intake.ts:58` currently matches an account-qualified config route but emits the superseded account-less `discord:channel:<channel>` identity. Terminal success occurs only after `client.intake`; KM failures remain silent through the independent `before_dispatch` hook.
- `extensions/deliberation/src/route-match.ts:11` silently prioritizes duplicate channel/target fields and accepts weakly normalized values, so conflicting or malformed route representations are not distinguishable from ordinary misses.
- `src/plugins/hook-message.types.ts:65` and `src/hooks/message-hook-mappers.ts:336` carry provider/account/conversation/message facts but omit `InboundEventKind` and authoritative bot/self evidence. Discord rejects exact self identity before this hook at `extensions/discord/src/monitor/message-handler.ts:320` and `extensions/discord/src/monitor/message-handler.preflight.ts:232`.
- `extensions/deliberation/scripts/intake-producer.ts:43` derives its configured source from the event, preventing wrong-account and processing-route zero-request proof through the existing producer seam.
- The checked-in KM mirror constrains `sourceTarget` only as a string; it does not contain the preceding KM task's versioned identity grammar or fixtures. The supplied external investigation and KM-owned E2E harness are unavailable in this checkout, so implementation must stop rather than infer syntax if those accepted artifacts are still absent.
- Relevant knowledge requires external contract authority before behavioral TDD, preserves runtime activation proof, and distinguishes wire protocol version 1 from product generation names. Recall used deterministic local fallback because QMD collection `openclaw-fork-learnings` was unavailable.

## Available Skills

- `tdd`: record the RED/GREEN account-isolation and admission cycle.
- `openclaw-testing`: run focused plugin and composed Discord proof before broad checks.
- `autoreview`: mandatory fresh pre-handoff review after code changes.
- `save-learning`: persist implementation findings as the final implementation-session action.

## Approach

Mirror the accepted KM-owned grammar and fixtures, then implement one plugin-local strict codec used by config validation, route admission, producer input, and KM payload construction. Resolve all hook facts into a closed admission result before calling KM; reject ambiguity and unsupported vocabulary without compatibility fallbacks, while leaving terminal claim ordering, authenticated transport, and independent fail-closed silence unchanged.

## Implementation

1. Obtain the preceding KM task's exact identity specification, fixture files, accepted revision/hashes, declared provider/event/kind vocabulary, and producer-focused E2E command. Mirror those artifacts under `extensions/deliberation/contracts/`, update `provenance.json`, and make `contract.test.ts` fail on byte/hash drift; stop if the owner artifacts are unavailable or internally inconsistent.
2. Use `skill:tdd` to add the cross-account RED case below, plus fixture-driven codec tests that encode and parse every accepted KM identity and reject every malformed/unsupported fixture. Do not hard-code a guessed identity format.
3. Add `extensions/deliberation/src/source-identity.ts` with the smallest closed encoder/parser API required by callers. Derive version, provider, account, channel, escaping, limits, and accepted vocabulary directly from the mirrored contract; require `parse(encode(parts))` equality and exact fixture bytes.
4. Change `route-match.ts` to return a discriminated admission result instead of applying precedence. Cross-check duplicated event/context provider, account, target, and provider-event-id fields; reject conflicts, malformed prefixes, missing values, unsupported provider/event/kind, processing identity, and wrong configured account before payload construction.
5. If the KM vocabulary requires an inbound kind unavailable to plugins, add only the generic host-authoritative field needed from `FinalizedMsgContext.InboundEventKind` through `CanonicalInboundMessageHookContext`, `PluginHookInboundClaimEvent`, mappers, SDK types/docs, and mapper tests. Treat `inbound_claim` registration as the authoritative message-event seam only if the accepted contract says so. Do not add or infer bot/self fields from names or text.
6. Update `createInboundClaimHandler` to encode the accepted configured route's provider/account/channel identity with the codec after admission succeeds, then call the existing KM client once. Preserve `{ handled: true }` only after successful intake, `{ handled: false }` on rejection/KM failure, and `before_dispatch` terminal silence for configured sources.
7. Make `scripts/intake-producer.ts` accept fixture-defined configured source/processing routes independently from the event, require explicit account/provider/event/kind fields, and invoke the same handler/client path. Keep bounded diagnostics, local-only test transport, and zero Discord-send capability.
8. Expand focused tests: distinct identities for same channel across accounts and for two channels under one account; exact one-request source admission; zero requests for processing, wrong-account, unsupported provider/event/kind, missing ID, malformed and conflicting routes; fixture round-trip; terminal success; KM rejection/unavailability; no ordinary dispatch or delivery. Update loader-backed Discord and source-checkout expectations to the accepted fixture identity.
9. Document the upstream self invariant in the Deliberation reference and protect it with the existing Discord handler seam: authenticated `botUserId` is compared to `author.id` before `inbound_claim`. Add Deliberation-local bot rejection only if a canonical authoritative field is introduced; otherwise explicitly state that the plugin receives no safe bot/self evidence.
10. Run the focused commands below, the exact KM-owned producer E2E command obtained in step 1, `pnpm check:changed`, and `pnpm build` if the public hook/SDK or bundled output changes. Run fresh `skill:autoreview` until no actionable findings remain; record exact commands/results and zero live Discord sends in the task note, then invoke `save-learning` last.

## Files to Modify

| File                                                                                                                  | Change                                                                                            |
| --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `extensions/deliberation/contracts/*`                                                                                 | Mirror accepted KM identity grammar/fixtures and provenance without local reinterpretation.       |
| `extensions/deliberation/src/source-identity.ts`                                                                      | Add strict fixture-derived identity encoder/parser.                                               |
| `extensions/deliberation/src/source-identity.test.ts`                                                                 | Prove exact fixture bytes, round-trip, and malformed/unsupported rejection.                       |
| `extensions/deliberation/src/route-match.ts` and `route-match.test.ts`                                                | Resolve exact routes and reject ambiguity before intake.                                          |
| `extensions/deliberation/src/intake.ts` and `hooks.test.ts`                                                           | Enforce admission and emit account-aware identity while preserving terminal/fail-closed behavior. |
| `extensions/deliberation/src/contract.test.ts`                                                                        | Pin owner artifacts and declared vocabulary.                                                      |
| `extensions/deliberation/scripts/intake-producer.ts` and `intake-producer.test.ts`                                    | Separate configured routes from events and prove zero-request rejection locally.                  |
| `extensions/discord/src/monitor/message-handler.process.test.ts`                                                      | Prove real hook payload, canonical request, silence, KM failure, and upstream self filtering.     |
| `src/plugins/source-checkout-runtime.test.ts`                                                                         | Update loader-backed identity expectation.                                                        |
| `src/plugins/hook-message.types.ts`, `src/hooks/message-hook-mappers.ts`, adjacent tests, and `docs/plugins/hooks.md` | Add/document a generic authoritative kind field only if required by the accepted KM vocabulary.   |
| `docs/plugins/reference/deliberation.md`                                                                              | Update producer schema, identity semantics, and authoritative self-filter invariant.              |

## TDD

Implement the cycle with `skill:tdd`; record evidence in `plans/checkpoints/bold-crag-7732.red-green-proof.md`.

**Test file:** `extensions/deliberation/src/hooks.test.ts`  
**Run command:** `pnpm test extensions/deliberation/src/hooks.test.ts -- --reporter=verbose -t "keeps configured Discord accounts distinct"`  
**Edit hint:** append inside `describe("deliberation hooks")`; use the existing config/logger/client fixtures.

```ts
it("keeps configured Discord accounts distinct for the same channel", async () => {
  const routeConfig = parseDeliberationConfig({
    enabled: true,
    failClosed: true,
    sources: [
      { channel: "discord", accountId: "account-a", target: "source" },
      { channel: "discord", accountId: "account-b", target: "source" },
    ],
    processingSource: { channel: "discord", accountId: "account-a", target: "processing" },
    km: config.km,
    restrictedSessionKeys: ["agent:reviewer"],
  });
  const intake = vi.fn().mockResolvedValue({
    recordId: "record-1",
    inboundId: "inbound-1",
    duplicate: false,
  });
  const handler = createInboundClaimHandler(routeConfig, { intake } as never, createLogger());

  for (const [accountId, messageId] of [
    ["account-a", "message-a"],
    ["account-b", "message-b"],
  ] as const) {
    await handler(
      { channel: "discord", content: "message", isGroup: true, senderId: "sender-1" },
      { channelId: "discord", accountId, conversationId: "source", messageId },
    );
  }

  expect(intake).toHaveBeenCalledTimes(2);
  expect(intake.mock.calls[0]?.[0].sourceTarget).not.toBe(intake.mock.calls[1]?.[0].sourceTarget); // RED: both currently equal discord:channel:source
});
```

| Test                       | RED                                                                 | GREEN                                                                           |
| -------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Same channel, two accounts | Both requests emit the same account-less target.                    | Requests emit two exact KM-fixture identities.                                  |
| Codec fixtures             | Codec/module or exact fixture matches are absent.                   | Every accepted fixture round-trips byte-for-byte; invalid fixtures fail closed. |
| Rejection matrix           | Ambiguous/event/kind cases can reach intake or are unrepresentable. | Every forbidden case records zero KM requests.                                  |

## Verification

1. `pnpm test extensions/deliberation/src/contract.test.ts extensions/deliberation/src/source-identity.test.ts extensions/deliberation/src/route-match.test.ts extensions/deliberation/src/hooks.test.ts extensions/deliberation/scripts/intake-producer.test.ts -- --reporter=verbose`
2. `pnpm test extensions/discord/src/monitor/message-handler.process.test.ts -- --reporter=verbose -t "Deliberation"`
3. `pnpm test src/plugins/source-checkout-runtime.test.ts -- --reporter=verbose -t "Deliberation"`
4. Run the exact producer-focused KM-owned E2E command supplied with the accepted identity fixtures; local fixtures only, zero live Discord sends.
5. `pnpm check:changed`
6. `pnpm build` when hook/SDK types or bundled build output change.

## Dependencies

- Blocking input: accepted KM identity grammar, positive/negative fixtures, provenance, vocabulary, and exact KM E2E invocation from the preceding task.
- No KM spool/orchestration, Mission Control, final delivery, scheduler, live config, V1 compatibility path, or alternate producer changes.
