# Plan 2026-08-02: Fix deliberation intake to enqueue silently

_Status: DRAFT_
_Created: 2026-08-02_

## Progress

- [x] Phase 0: Config + init
- [x] Phase 1: Research
- [x] Phase 2: Knowledge
- [x] Phase 3: Synthesis

## Analysis

### Codebase context

- `src/hooks/message-hook-mappers.ts` and `extensions/discord/src/channel.ts` emit Discord claim context as `channelId: "discord"`, configured account id, and canonical `conversationId: "channel:<id>"`.
- `extensions/deliberation/src/route-match.ts` already strips `channel:` before comparing configured routes, so the observed source now reaches intake.
- `extensions/deliberation/src/intake.ts` awaits `client.intake(...)` but unconditionally returns `{ handled: false }`; successful intake therefore falls through to normal dispatch.
- Intake skip and KM-error branches deliberately remain non-claiming; `createBeforeDispatchHandler` independently returns `{ handled: true }` for configured sources and preserves fail-closed silence.
- `src/auto-reply/reply/dispatch-from-config.ts` returns immediately on a broadcast claim with `handled: true`; its existing test proves no reply resolver or final dispatcher call occurs.
- `extensions/deliberation/src/hooks.test.ts` already covers canonical route normalization, exact-once intake, processing exclusion, skip/error paths, and guard behavior, but currently pins successful intake as non-claiming.

### Relevant documentation

- `docs/plugins/reference/deliberation.md` requires configured sources to remain terminally silent, including KM outages or disabled KM work; no public config or docs shape needs changing.
- `extensions/AGENTS.md` keeps the correction plugin-local and forbids imports from core or Discord internals in plugin production code.
- `docs/reference/test.md` and `docs/ci.md` require focused Vitest proof plus changed extension type/lint gates; no PlantUML diagram governs this path.

### Knowledge base

- `learnings/architecture/deliberation-normalize-canonical-channel-identities.md`: test the canonical `channel:<id>` event/context and reuse one normalized route for matching and KM target construction.
- `learnings/architecture/2026-07-29_fail-closed-when-deliberation-km-authority-is-missing.md`: preserve source silence when intake cannot claim.
- `learnings/architecture/2026-07-28_wire-protocol-versions-are-not-implementation-generations.md`: do not alter the accepted KM v1 wire or infer new authority.
- Knowledge search used local fallback because QMD collection `openclaw-fork-learnings` was absent.

## Available Skills

- `tdd`: implement the successful-intake terminal-result regression RED first.
- `openclaw-testing`: select focused plugin/core tests and changed extension gates.
- `autoreview`: mandatory fresh implementation review before handoff.
- `save-learning`: mandatory final implementation action after verification.

## Solution

Return `{ handled: true }` immediately after `client.intake(...)` resolves. Keep `{ handled: false }` for disabled, processing, unmatched, malformed, and KM-error paths so the unchanged `before_dispatch` source guard remains the independent fail-closed backstop.

## Implementation

1. Use `skill:tdd` to revise `extensions/deliberation/src/hooks.test.ts` first: model the observed Discord source as `channel=discord`, `accountId=default`, `conversationId=channel:1494265174389948538`; assert one intake, terminal `{ handled: true }`, no `reply`, and non-claiming behavior for another channel. Record RED/GREEN evidence in `plans/checkpoints/quick-cove-7908.red-green-proof.md`.
2. Change only the successful branch in `createInboundClaimHandler` to return `{ handled: true }` after the awaited intake. Leave route normalization, skip results, sanitized error handling, hook priorities, guards, config validation, auth, and KM client behavior untouched.
3. Update the existing successful-intake expectation that currently pins `{ handled: false }`; retain exact-once and exact KM request assertions.
4. Strengthen `broadcasts inbound claims and short-circuits when a plugin claims` to assert `sendToolResult`, `sendBlockReply`, and `sendFinalReply` are all untouched alongside the existing `replyResolver` assertion. Do not couple core tests to Deliberation internals.
5. Run focused plugin and core tests, changed type/lint gates, `git diff --check`, and `git diff --numstat`; then run `skill:autoreview` until no actionable findings remain.
6. Invoke `save-learning` as the final implementation action and save at least one learning about returning terminal claims only after durable intake succeeds.

## Files to Modify

| File                                                | Change                                                                               |
| --------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `extensions/deliberation/src/intake.ts`             | Return the terminal claim only after successful KM intake.                           |
| `extensions/deliberation/src/hooks.test.ts`         | Add the observed Discord route regression and update successful-intake expectations. |
| `src/auto-reply/reply/dispatch-from-config.test.ts` | Prove a terminal claim invokes no dispatcher send method.                            |

No change is expected in route matching, guards, plugin registration, KM auth/client code, config, listener code, or docs.

## TDD

Implement the cycle with `skill:tdd`.

**Test file:** `extensions/deliberation/src/hooks.test.ts`
**Framework:** Vitest through the repository test wrapper
**Run command:** `pnpm test extensions/deliberation/src/hooks.test.ts -- --reporter=verbose`
**Edit hint:** append inside `describe("deliberation hooks", ...)` before production edits.

```ts
it("queues and terminally claims the configured Discord source only", async () => {
  const sourceId = "1494265174389948538";
  const exactConfig = parseDeliberationConfig({
    enabled: true,
    failClosed: true,
    sources: [{ channel: "discord", accountId: "default", target: sourceId }],
    processingSource: { channel: "discord", accountId: "default", target: "processing" },
    km: {
      endpoint: "https://km.invalid",
      credential: { source: "env", provider: "default", id: "KM_TOKEN" },
      requestTimeoutMs: 1000,
    },
    restrictedSessionKeys: ["agent:reviewer"],
  });
  const intake = vi.fn().mockResolvedValue({
    recordId: "record-1",
    inboundId: "inbound-1",
    duplicate: false,
  });
  const handler = createInboundClaimHandler(exactConfig, { intake } as never, createLogger());
  const event = {
    channel: "discord",
    accountId: "default",
    conversationId: `channel:${sourceId}`,
    content: "message",
    isGroup: true,
    messageId: "1533408285770649783",
    senderId: "sender-1",
  };

  const result = await handler(event, {
    channelId: "discord",
    accountId: "default",
    conversationId: `channel:${sourceId}`,
    messageId: event.messageId,
    senderId: event.senderId,
  });

  expect(result).toEqual({ handled: true }); // RED: currently returns handled: false.
  expect(result).not.toHaveProperty("reply");
  expect(intake).toHaveBeenCalledTimes(1);

  await expect(
    handler(
      { ...event, conversationId: "channel:other", messageId: "other-message" },
      {
        channelId: "discord",
        accountId: "default",
        conversationId: "channel:other",
        messageId: "other-message",
        senderId: event.senderId,
      },
    ),
  ).resolves.toEqual({ handled: false });
  expect(intake).toHaveBeenCalledTimes(1);
});
```

| Test                       | RED                                                   | GREEN                                                                     |
| -------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------- |
| configured Discord source  | Intake runs once, but result is `{ handled: false }`. | Intake runs once and result is exactly `{ handled: true }` with no reply. |
| non-source Discord channel | Already non-claiming.                                 | Remains `{ handled: false }` and does not enqueue.                        |
| core terminal claim        | Existing resolver/final-send assertions pass.         | All resolver and dispatcher-send assertions pass.                         |

## Verification

1. `pnpm test extensions/deliberation/src/hooks.test.ts -- --reporter=verbose`
2. `pnpm test extensions/deliberation/src/plugin.test.ts -- --reporter=verbose`
3. `pnpm test src/auto-reply/reply/dispatch-from-config.test.ts -- --reporter=verbose -t "broadcasts inbound claims and short-circuits when a plugin claims"`
4. `pnpm test extensions/deliberation -- --reporter=verbose` to keep config, guard, KM client, and contract tests green, including existing fail-closed behavior.
5. `pnpm tsgo:extensions && pnpm tsgo:extensions:test`
6. `pnpm changed:lanes --json`, then the smallest selected lint/type gate, normally `pnpm check:changed` per `skill:openclaw-testing`.
7. `pnpm format:check extensions/deliberation/src/intake.ts extensions/deliberation/src/hooks.test.ts src/auto-reply/reply/dispatch-from-config.test.ts`
8. `git diff --check` and `git diff --numstat`

Record each exact command, result, and any blocked broader gate in the final task note. Do not access live config, credentials, Discord, the KM listener, or another repository.
