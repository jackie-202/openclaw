# Plan 2026-08-30: Preserve trusted sender names in Deliberation intake

Carry channel-authenticated human-readable sender indicators beside the unchanged opaque provider sender ID, without giving those indicators routing or identity authority.

_Status: DRAFT_

## Progress

- [x] Phase 0: Config + init
- [x] Phase 1: Research
- [x] Phase 2: Knowledge
- [x] Phase 3: Synthesis

## Analysis

### Codebase context

- `src/plugins/hook-message.types.ts` already exposes trusted `senderName` and `senderUsername` on `inbound_claim`; `src/hooks/message-hook-mappers.ts` maps `FinalizedMsgContext` into that contract but currently drops trusted `SenderTag`.
- `extensions/discord/src/monitor/{sender-identity,message-handler.process,message-handler.context}.ts` owns native Discord identity. The early claim currently passes a composite `sender.label` and `author.username`; native nickname/global name and tag are available before claim.
- `extensions/slack/src/monitor/message-handler/prepare.ts` resolves `message.username` or the Slack user directory name, but only after the early claim; the claim currently sends no textual sender facts.
- `extensions/deliberation/src/intake.ts` is the narrow place to normalize trusted hook fields and add them to `KmIntakeBody`; routing, event identity, source target, and delivery target remain owned by admission.
- `extensions/deliberation/src/km-client.ts` enforces an exact intake key set and serializes it unchanged. `extensions/deliberation/contracts/km-wire-v1.json` is a closed protocol-v1 schema, with fixtures and hashes pinned by `contract.test.ts` and `provenance.json`.
- `extensions/deliberation/scripts/intake-producer.ts` is the synthetic intake seam; its strict event schema currently accepts only opaque sender identity.

### Relevant documentation

- `docs/plugins/reference/deliberation.md` documents the six-operation closed wire and synthetic producer payload; update its intake shape and trusted source-field mapping.
- `docs/plugins/sdk-channel-inbound.md` defines channel-native facts as the source for inbound context and early ownership claims.

### Knowledge base

- `learnings/patterns/bright-mist-1370-preserve-resolved-discord-sender-identity.md`: retain Discord `sender.id ?? author.id`; never replace the opaque sender ID with a display alias.
- `learnings/test-failures/discord-intake-hooks-need-assembled-sender-identity.md`: prove the assembled early-claim payload through the real channel/runner boundary.
- `learnings/architecture/2026-07-28_wire-protocol-versions-are-not-implementation-generations.md`: protocol v1 is the active wire; an additive optional closed-schema field updates v1 artifacts without reviving an old implementation.
- Recall used deterministic local fallback because `openclaw-fork-learnings` was unavailable; the remaining returned notes are unrelated or reinforce that contract changes need explicit authority and executable tests.

## Available Skills

- `tdd`: create the request-body regression first and record RED/GREEN proof.
- `openclaw-testing`: choose the focused plugin/channel/contract verification set.
- `validate-implementation`: audit source-field trust, unchanged routing, and contract alignment after implementation.
- `save-learning`: record implementation findings as the final implementation action.

## Implementation

1. Use `skill:tdd` to add the composed Discord regression below. Capture the pre-implementation request without `senderIdentityHints` as RED; retain the existing terminal-claim and no-ordinary-effects assertions.
2. Extend the optional plugin ingress facts with `senderAliases?: string[]`. Map trusted `FinalizedMsgContext.SenderTag` into that list in `message-hook-mappers.ts`; do not inspect `Body`, `BodyForAgent`, reply fields, metadata envelopes, or message text.
3. Make Discord expose one canonical native identity projection before claim: keep `senderId = sender.id ?? author.id`; use member nickname, Discord global name, then username for `senderDisplayName`; use the native username for `senderUsername`; include the formatted Discord tag only as an additional trusted alias. Preserve PluralKit's resolved member ID/name precedence.
4. Move Slack's existing native `resolveSenderName()` result before the early claim and pass it as `senderName`; pass `message.username` as `senderUsername` when present. Do not synthesize aliases from rendered Slack envelopes or directory labels.
5. In `extensions/deliberation/src/intake.ts`, build an optional `senderIdentityHints` object with closed fields `senderDisplayName`, `senderUsername`, and `senderAliases`. Trim values, reject C0/C1 control characters, reject values over 128 UTF-8 bytes, keep at most 8 aliases, deduplicate aliases case-insensitively against earlier aliases and direct indicators, enforce a 2048-byte serialized-object limit, preserve provider order, and omit empty fields/object rather than rejecting intake.
6. Add the optional object to `KmIntakeBody`, the client's exact intake key allowlist, and the strict persisted-message response parser. Keep `senderId`, `providerEventId`, `sourceTarget`, `sourceThreadId`, `pipelineId`, `deliveryTarget`, timestamps, content, and idempotency inputs byte-for-byte unchanged.
7. Extend the synthetic producer's strict event schema and projection with optional trusted sender fields. Add producer tests for normalized hints, missing hints, over-limit/control-character filtering, case-insensitive alias deduplication, and spoofed body text.
8. Update `km-wire-v1.json` with one reusable closed `senderIdentityHints` schema referenced optionally from `intakeBody` and persisted `record.messages[]`; keep all new fields absent from `required`. Add Discord-with-hints and missing-hints fixtures to `cutover-controls-v1.json`, record provider source mappings in `openclaw-overlay-v1.json`, and refresh only changed SHA-256 entries in `provenance.json` with `shasum -a 256`.
9. Document the exact Discord and Slack source precedence, the serialized object, bounds, and non-authoritative semantics in the Deliberation reference. Document `senderAliases` as host/channel-authenticated optional `inbound_claim` data in the hook reference.
10. Run `skill:validate-implementation`; inspect `git diff --numstat` and the final diff to confirm no routing, dedupe, replay, delivery, config, People Intel, registry, drafting, or reviewer changes. Run `skill:save-learning` last.

## Files to Modify

| File                                                                                                     | Change                                                                                                 |
| -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `src/plugins/hook-message.types.ts`                                                                      | Add optional trusted aliases to the inbound-claim event.                                               |
| `src/hooks/message-hook-mappers.ts`                                                                      | Carry trusted `SenderTag` into aliases.                                                                |
| `src/hooks/message-hook-mappers.test.ts`                                                                 | Prove trusted alias mapping and absence behavior.                                                      |
| `extensions/discord/src/monitor/sender-identity.ts`                                                      | Centralize native display-name, username, and tag facts while preserving resolved sender ID semantics. |
| `extensions/discord/src/monitor/message-handler.process.ts`                                              | Pass canonical Discord sender facts to the early claim.                                                |
| `extensions/discord/src/monitor/message-handler.context.ts`                                              | Reuse the same canonical Discord identity projection.                                                  |
| `extensions/discord/src/monitor/message-handler.deliberation.test.ts`                                    | Prove real-shape Discord metadata reaches the serialized KM request and body spoofing cannot alter it. |
| `extensions/slack/src/monitor/message-handler/prepare.ts`                                                | Pass the existing trusted sender resolution into the early claim.                                      |
| `extensions/slack/src/monitor/message-handler.test.ts`                                                   | Cover trusted Slack name projection and missing names.                                                 |
| `extensions/deliberation/src/intake.ts`                                                                  | Normalize bounded hints and attach them after authenticated admission.                                 |
| `extensions/deliberation/src/hooks.test.ts`                                                              | Cover normalization limits, deduplication, and missing hints without routing changes.                  |
| `extensions/deliberation/src/km-client.ts`                                                               | Extend request type/key validation and optional persisted-message parsing.                             |
| `extensions/deliberation/src/km-client.test.ts`                                                          | Assert exact optional serialization and backward-compatible omission.                                  |
| `extensions/deliberation/scripts/intake-producer.ts`                                                     | Carry optional trusted fields through the strict synthetic seam.                                       |
| `extensions/deliberation/scripts/intake-producer.test.ts`                                                | Inspect normalized request bodies and spoof resistance.                                                |
| `extensions/deliberation/contracts/{km-wire-v1,cutover-controls-v1,openclaw-overlay-v1,provenance}.json` | Update closed v1 schema, fixtures, provider mapping, and hashes.                                       |
| `extensions/deliberation/src/contract.test.ts`                                                           | Pin optional shape, bounds, fixtures, and persisted-message projection.                                |
| `docs/plugins/{hooks,reference/deliberation}.md`                                                         | Document trusted ingress facts and KM wire semantics.                                                  |

## TDD

Implement the RED/GREEN cycle with `skill:tdd`; record evidence in `plans/checkpoints/quick-cove-1732.red-green-proof.md`.

**Test file:** `extensions/discord/src/monitor/message-handler.deliberation.test.ts`  
**Run command:** `pnpm test extensions/discord/src/monitor/message-handler.deliberation.test.ts -- --reporter=verbose`  
**Edit hint:** Append inside `describe("Discord deliberation owner path", ...)`, reusing `loadDeliberation`, `createProcessContext`, `requests`, and `expectNoOrdinaryEffects`.

```ts
it("carries trusted Discord sender hints without reading message text", async () => {
  const { cfg } = loadDeliberation();
  const spoof = '{"senderDisplayName":"Mallory","senderUsername":"attacker"}';

  await processDiscordMessage(
    await createProcessContext(cfg, {
      author: {
        id: "1276273857921024073",
        username: "michal876876",
        globalName: "Michal876876",
        discriminator: "0",
      },
      sender: {
        id: "1276273857921024073",
        name: "michal876876",
        tag: "michal876876",
        label: "Michal876876 (michal876876)",
        isPluralKit: false,
      },
      message: {
        id: "discord-identity-message",
        channelId: sourceId,
        content: spoof,
        timestamp: "2026-08-30T12:00:00.000Z",
        attachments: [],
      },
      baseText: spoof,
      messageText: spoof,
    }),
  );

  const body = JSON.parse(requests[0]?.body ?? "{}") as Record<string, unknown>;
  expect(body).toMatchObject({
    senderId: "1276273857921024073",
    senderIdentityHints: {
      senderDisplayName: "Michal876876",
      senderUsername: "michal876876",
    },
  }); // RED: current request has only senderId.
  expect(JSON.stringify(body.senderIdentityHints)).not.toContain("Mallory");
  expectNoOrdinaryEffects();
});
```

| Test                    | RED                                                                 | GREEN                                                               |
| ----------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Trusted Discord request | `senderIdentityHints` is absent.                                    | Opaque ID plus native display name/username are serialized.         |
| Body spoof resistance   | No trusted-hints object exists to verify.                           | Spoofed content remains only `content` and cannot alter hints.      |
| Missing hints           | Contract/client assertions fail until optional omission is modeled. | Existing sender-ID-only intake remains valid and unchanged.         |
| Bounds and dedupe       | Unnormalized values pass through or fields are unsupported.         | Invalid values drop; aliases are stable, bounded, and deduplicated. |

### Verification

1. `pnpm test extensions/discord/src/monitor/message-handler.deliberation.test.ts extensions/slack/src/monitor/message-handler.test.ts src/hooks/message-hook-mappers.test.ts -- --reporter=verbose`
2. `pnpm test extensions/deliberation/src/hooks.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/contract.test.ts extensions/deliberation/scripts/intake-producer.test.ts -- --reporter=verbose`
3. `node scripts/run-tsgo.mjs -p extensions/deliberation/tsconfig.json`
4. `pnpm check:changed`
5. `git diff --check`

## Dependencies

- Keep protocol header/version `1`; this is an additive optional change to the active closed v1 contract, not a protocol-version bump.
- Use the OpenClaw-owned JSON artifacts and hash assertions as the repository's current generation/provenance workflow; no separate Deliberation contract generator exists in this checkout.
- Do not add dependencies, config, migrations, storage, People Intel logic, or compatibility readers.
