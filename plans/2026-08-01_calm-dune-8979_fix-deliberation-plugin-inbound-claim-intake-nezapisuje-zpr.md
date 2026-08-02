# Plan 2026-08-01: Fix Deliberation inbound_claim intake

_Status: DRAFT_
_Vytvořeno: 2026-08-01_

## Progress

- [x] Fáze 0: Config + Init
- [x] Fáze 1: Research
- [x] Fáze 2: Knowledge
- [x] Fáze 3: Synthesis

## Analysis

### Kontext z codebase

- `src/auto-reply/reply/dispatch-from-config.ts:1363` builds `inbound_claim` through the canonical message mapper and broadcasts it at `src/auto-reply/reply/dispatch-from-config.ts:1904`.
- `src/hooks/message-hook-mappers.ts:280` asks the Discord plugin to resolve the conversation; `extensions/discord/src/conversation-identity.ts:51` canonicalizes a channel as `channel:<id>`.
- `extensions/deliberation/src/route-match.ts:11` compares that canonical runtime value directly with the documented bare channel id, while `extensions/deliberation/src/hooks.test.ts:19` uses only synthetic bare ids and misses the mismatch.
- `extensions/deliberation/src/intake.ts:17` silently returns for every skip and swallows KM failures at line 37. `extensions/deliberation/index.ts:17` can inject `api.logger` without crossing the plugin SDK boundary.
- Attachment facts are already available as `event.metadata.mediaType/mediaTypes/mediaPath/mediaPaths/mediaUrl/mediaUrls` from `src/hooks/message-hook-mappers.ts:367`. The closed KM schema at `extensions/deliberation/contracts/km-wire-v1.json:57` accepts only a nonempty `content`; it has no media flag field.

### Relevantní dokumentace

- `docs/plugins/reference/deliberation.md:36` documents bare Discord channel ids for `sources` and `processingSource`; preserve that public config shape.
- `extensions/AGENTS.md` requires production changes to stay inside the plugin and use public Plugin SDK types. No PlantUML diagram governs this path.

### Knowledge base

- Keep the accepted KM wire closed: do not add an unauthorized media property; represent media-only intake with a deterministic nonempty placeholder.
- Preserve one canonical route comparison rather than adding fallback readers. Apply the same normalization to source and processing routes.
- Recall used local fallback because QMD collection `openclaw-fork-learnings` was absent. Relevant guidance: `learnings/architecture/2026-07-28_external-contract-gates-precede-behavioral-tdd.md` and `learnings/architecture/2026-07-28_wire-protocol-versions-are-not-implementation-generations.md`.

## Available Skills

- `tdd`: create the real-shape regression first and capture RED/GREEN evidence.
- `openclaw-testing`: choose repository-safe focused verification.
- `autoreview`: run the mandatory fresh pre-handoff review.
- `save-learning`: mandatory final implementation action after verification.

## Solution

Normalize the canonical Discord `channel:<id>` runtime conversation at Deliberation's route boundary to the documented bare channel id. Use that normalized route for source/processing checks and KM `sourceTarget`, preserving the current public config and independent fail-closed `before_dispatch` claim.

Inject the Plugin SDK logger into intake. Debug-log every skip reason without message content or media locations, and warn on sanitized KM failures. For media-only events, derive a deterministic placeholder from MIME metadata because the accepted closed KM contract cannot carry a separate media flag.

## Implementation

1. Use `skill:tdd` to add the real Discord event/context regression below to `extensions/deliberation/src/hooks.test.ts`; run it first and record RED caused by `channel:<id>` not matching the bare configured id.
2. In `extensions/deliberation/src/route-match.ts`, normalize only runtime Discord channel targets by removing the canonical `channel:` prefix before constructing `DeliberationRoute`; use the same path for source and processing checks.
3. In `extensions/deliberation/src/intake.ts`, derive the normalized candidate once, build `sourceTarget` from it, and retain `{ handled: false }` while `before_dispatch` remains the terminal source claim.
4. Add attachment detection over typed/narrowed `event.metadata` fields. Keep text unchanged when present; otherwise emit a stable placeholder such as `[media: audio/ogg]` or `[media attachment]`. Never include local paths, URLs, or filenames.
5. Pass `api.logger` from `extensions/deliberation/index.ts`. Emit `debug` reasons for disabled config, processing route, unmatched route, missing message/sender id, and empty non-media content; emit `warn` with the sanitized error for KM request failure.
6. Extend `hooks.test.ts` for processing/unmatched/missing-field logs, KM failure logging, and blank-text audio intake. Assert no logged value leaks content or media paths.
7. Run focused and full plugin verification, capture the verbose full-plugin output in the task handoff, run `git diff --check`, then `skill:autoreview` until no actionable findings remain.
8. Invoke `save-learning` as the final implementation action and save at least one learning about canonical channel identities or diagnosable fail-closed intake.

## Files to Modify

| File                                         | Change                                                                             |
| -------------------------------------------- | ---------------------------------------------------------------------------------- |
| `extensions/deliberation/src/route-match.ts` | Normalize canonical Discord channel conversation ids at the plugin route boundary. |
| `extensions/deliberation/src/intake.ts`      | Use normalized route, media placeholder, and reasoned logging.                     |
| `extensions/deliberation/index.ts`           | Inject the Plugin SDK logger into intake.                                          |
| `extensions/deliberation/src/hooks.test.ts`  | Add real-shape, media-only, skip-log, and KM-failure regressions.                  |

## TDD

Implement the cycle with `skill:tdd`; record evidence in `plans/checkpoints/calm-dune-8979.red-green-proof.md`.

**Test file:** `extensions/deliberation/src/hooks.test.ts`  
**Framework:** Vitest through the repository test wrapper  
**Run command:** `pnpm test extensions/deliberation/src/hooks.test.ts -- --reporter=verbose`  
**Edit hint:** append inside `describe("deliberation hooks", ...)` before production edits.

```ts
it("intakes the canonical Discord channel event shape", async () => {
  const intake = vi.fn().mockResolvedValue({
    recordId: "record-1",
    inboundId: "inbound-1",
    duplicate: false,
  });
  const handler = createInboundClaimHandler(config, { intake } as never, {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  });

  await handler(
    {
      channel: "discord",
      accountId: "acct",
      conversationId: "channel:source",
      content: "message",
      isGroup: true,
      messageId: "m1",
      senderId: "sender-1",
    },
    {
      channelId: "discord",
      accountId: "acct",
      conversationId: "channel:source",
      messageId: "m1",
      senderId: "sender-1",
    },
  );

  expect(intake).toHaveBeenCalledWith(
    expect.objectContaining({
      providerEventId: "m1",
      sourceTarget: "acct:source",
      content: "message",
    }),
  );
});
```

| Test                                                | RED                                                                          | GREEN                                                                |
| --------------------------------------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `intakes the canonical Discord channel event shape` | `intake` has zero calls because `channel:source` misses configured `source`. | Intake is called once with normalized `sourceTarget: "acct:source"`. |

Additional GREEN coverage:

- Blank `content` plus `metadata.mediaTypes: ["audio/ogg"]` posts nonempty placeholder content.
- Blank content without attachment skips and logs `empty-content`.
- Disabled, processing, unmatched, missing-id, and KM-error branches log distinct reasons; KM failure remains fail-closed.
- `createBeforeDispatchHandler` still returns `{ handled: true }` for the same canonical source context.

### Verification

1. `pnpm test extensions/deliberation/src/hooks.test.ts -- --reporter=verbose`
2. `pnpm test extensions/deliberation -- --reporter=verbose` and attach its output to the handoff as the repository-safe equivalent of the requested raw Vitest plugin run.
3. `git diff --check`
4. `git diff --numstat` and trim unexplained production LOC growth.

## Dependencies

- Preserve the accepted KM schema in `extensions/deliberation/contracts/km-wire-v1.json`; no contract, config, manifest, or docs change is required.
- Use only `PluginHookInboundClaimEvent`, `PluginHookInboundClaimContext`, and `PluginLogger` from `openclaw/plugin-sdk/plugin-entry`; do not import Discord or core internals into plugin production code.
- Do not mutate the live Gateway, KM listener, spool, credentials, or Discord channels during this implementation task.
- Do not commit or push unless separately requested.
