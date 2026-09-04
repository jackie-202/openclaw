# Plan 2026-08-31: Make Slack Deliberation Freshness Observe Newer Top-Level Channel Messages

_Status: DRAFT_

## Progress

- [x] Phase 0: Config + init
- [x] Phase 1: Research
- [x] Phase 2: Knowledge
- [x] Phase 3: Synthesis

## Analysis

### Codebase Context

- `extensions/deliberation/src/history-read.ts:315-436` resolves every Slack cutoff to a root, validates that root, then derives schema-v2 authority only from `root.latestReplyId ?? threadId`; `readSlackThread` has a four-page cursor budget and shared 50-message/32-KiB bounds.
- `extensions/deliberation/src/history-read.test.ts:394-821` covers mapped-thread replies, exact decimal ordering, cursor failure, bounds, and fail-closed rows, but not the root/reply by channel/thread matrix.
- `src/plugin-sdk/channel-runtime-context.ts:11-36` exposes exact-message and thread-page reads only. Add one bounded channel-page operation rather than a Slack client or credential path in Deliberation.
- `extensions/slack/src/monitor/deliberation-history.ts:27-61` owns Slack Web API translation; `extensions/slack/src/monitor/provider.ts:236,549-555` registers it with the existing Bolt client and centralized `resolveSlackReadToken` result.
- `extensions/slack/src/monitor/deliberation-history.test.ts:5-91` is the focused Web API argument boundary. `extensions/deliberation/src/orchestration.test.ts:200-450` is the plugin integration owner that must adopt the expanded runtime fake.
- `scripts/deliberation-full-gate.ts:294-335` runs focused Deliberation support tests, extension production/test tsgo, package singleton, lint, and diff checks, but requires a clean committed checkout.

### Relevant Documentation

- `extensions/deliberation/contracts/history-read-v2.json:1-9` fixes exclusive cutoff, inclusive watermark, closed provider failure, and output bounds but does not state Slack root/reply authority.
- `docs/plugins/reference/deliberation.md:10` and `extensions/deliberation/README.md:163-168` currently claim one-thread/bounded-thread Slack history and must be aligned with root-cutoff channel freshness.
- `docs/proposals/proposal-20260820-203458-161e2c_per-source-deliberation-pipelines-with-source-default-delivery.md:74-83` preserves separate Slack event IDs and root thread IDs.
- Slack `conversations.history` documentation specifies newest-first channel messages, cursor pagination, and exact timestamp bounds; `conversations.replies` is cursor-paginated and confined to one `channel` plus root `ts`. Installed `@slack/web-api` types expose `cursor`, `oldest`, `latest`, `inclusive`, `limit`, `messages`, and `response_metadata.next_cursor` for both.

### Knowledge Base

- Recall used local fallback (`openclaw-fork-learnings` QMD collection absent). Most matches were empty auto-extracted stubs; their applicable rule is to reuse one centralized channel runtime and credential path rather than creating provider access in Deliberation.
- `learnings/architecture/2026-07-28_wire-protocol-versions-are-not-implementation-generations.md` requires tracing current wire ownership rather than treating schema v1/v2 names as implementation generations. Preserve schema-v1 history behavior and change only OpenClaw-owned schema-v2 semantics.

## Available Skills

- `compound-plan`: create and incrementally persist this plan.
- `recall-knowledge`: retrieve repository learnings before synthesis.
- `tdd`: capture the implementation RED/GREEN cycle.
- `validate-implementation`: check the completed change against repository architecture and task acceptance.
- `save-learning`: record the implementation lesson as the final action.

## Approach

Use one explicit Slack schema-v2 rule:

- When `cutoffProviderEventId === mapped threadId`, freshness is the union of newer top-level messages in the exact configured channel and newer replies in that root thread.
- When the cutoff is a reply, freshness remains confined to later replies in its mapped root thread; newer channel roots and replies in other threads are excluded.

For a root cutoff, capture the upper bound before traversal as the exact-decimal maximum of the root's `latestReplyId`, the newest top-level channel message after the cutoff, and the cutoff itself. Page both admitted surfaces only within `(cutoff, watermark]`; merge through one provider-event-ID map, reject conflicting duplicates or malformed/threaded channel rows, sort with `compareSlackTimestamps`, and apply the existing shared count/byte bounds. Keep schema v1 on the existing thread-only path.

## Implementation

1. Apply `skill:tdd`: add the root/reply matrix to `history-read.test.ts` and channel-page Web API boundary coverage to `deliberation-history.test.ts`; capture the expected RED before production edits.
2. Extend `ChannelHistoryRuntimeContext` with `readChannelPage({ channelId, cursor?, limit, oldest?, latest?, inclusive? })`, matching the existing bounded thread-page result shape. Do not add another capability, client, account resolver, or token input.
3. Implement `readChannelPage` in the Slack monitor context with `client.conversations.history`, the supplied token, exact channel and timeline/cursor arguments, normalized rows, and trimmed `response_metadata.next_cursor`.
4. In schema-v2 Slack handling, validate the mapped root as today, detect root versus reply cutoff, and probe one channel row only for root cutoffs. Validate that the probe is a top-level row and capture the immutable maximum watermark before any channel/thread pagination.
5. Add bounded channel paging with the same four-page cursor loop protection as thread paging. For root cutoffs, merge channel roots and original-root replies into one exact-ID map; for reply cutoffs, do not call channel history. Reject out-of-range rows, off-thread replies, unexpected threaded channel rows, invalid senders/timestamps, and conflicting duplicate IDs.
6. Preserve the current schema-v1 branch byte-for-byte except for type/helper refactoring strictly required by the shared runtime shape. Keep exact source/account/channel admission and provenance unchanged.
7. Update `history-read-v2.json` with the root-cutoff union and reply-cutoff thread authority. Align the public Deliberation page and plugin README so neither claims all Slack history is one-thread-only; add/adjust contract and orchestration assertions to lock the rule without changing KM or delivery behavior.
8. Run focused GREEN tests, docs checks, extension lint/typecheck/build, then fresh `skill:validate-implementation` and mandatory `skill:autoreview` until no actionable finding remains. Run the canonical Deliberation full gate only from the clean committed candidate required by its preflight.

## Files to Modify

| File                                                        | Change                                                                                        |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `extensions/deliberation/src/history-read.ts`               | Capture channel/thread watermark and merge only the root-cutoff authority.                    |
| `extensions/deliberation/src/history-read.test.ts`          | Add the root/reply matrix, bounds, dedupe, ordering, pagination, and fail-closed regressions. |
| `src/plugin-sdk/channel-runtime-context.ts`                 | Add the generic bounded channel-page method.                                                  |
| `extensions/slack/src/monitor/deliberation-history.ts`      | Map that method to authenticated `conversations.history`.                                     |
| `extensions/slack/src/monitor/deliberation-history.test.ts` | Assert exact Web API arguments, normalization, and cursor handling.                           |
| `extensions/deliberation/src/orchestration.test.ts`         | Expand the runtime fake and prove plugin-level root/reply authority.                          |
| `extensions/deliberation/contracts/history-read-v2.json`    | State Slack root/reply freshness authority explicitly.                                        |
| `extensions/deliberation/src/contract.test.ts`              | Assert the checked-in v2 semantic rule if the contract lacks direct coverage.                 |
| `docs/plugins/reference/deliberation.md`                    | Replace the contradictory one-thread freshness claim.                                         |
| `extensions/deliberation/README.md`                         | Update bounded smoke expectations for root channel freshness.                                 |

## TDD

Implementation follows `skill:tdd`; record RED/GREEN evidence in `plans/checkpoints/wild-reef-5195.red-green-proof.md`.

**Test files:** `extensions/deliberation/src/history-read.test.ts`, `extensions/slack/src/monitor/deliberation-history.test.ts`  
**Focused command:** `pnpm test extensions/deliberation/src/history-read.test.ts extensions/slack/src/monitor/deliberation-history.test.ts -- --reporter=verbose`

Append this behavior test inside the existing Deliberation history suite:

```ts
it("admits a newer top-level message for a root cutoff", async () => {
  const sourceTarget = "v1:slack:workspace-a:C123";
  const readChannelPage = vi.fn().mockResolvedValue({
    messages: [{ id: "1723640000.000200", content: "new root", senderId: "U2" }],
  });
  const result = await createHistoryReadHandler({
    config,
    openclawConfig: {},
    historyStore: {
      lookup: vi.fn().mockResolvedValue({
        sourceTarget,
        providerEventId: "1723640000.000100",
        threadId: "1723640000.000100",
      }),
    } as never,
    resolveChannelHistory: vi.fn().mockReturnValue({
      readMessage: vi.fn().mockResolvedValue({
        id: "1723640000.000100",
        content: "cutoff root",
        senderId: "U1",
      }),
      readChannelPage,
      readThreadPage: vi.fn().mockResolvedValue({ messages: [] }),
    }),
  })({ schemaVersion: 2, sourceTarget, after: "1723640000.000100" });

  expect(result.watermarkProviderEventId).toBe("1723640000.000200"); // RED: currently cutoff.
  expect(result.messages.map((message) => message.providerEventId)).toEqual(["1723640000.000200"]);
});
```

Append this API-boundary test inside the Slack runtime context suite:

```ts
it("reads one bounded channel page through conversations.history", async () => {
  const history = vi.fn().mockResolvedValue({
    messages: [{ ts: "1723640000.000200", text: "new root", user: "U2" }],
    response_metadata: { next_cursor: " next " },
  });
  const context = createSlackChannelHistoryContext({
    client: { conversations: { history } } as unknown as WebClient,
    token: "test-token",
  });

  await expect(
    context.readChannelPage({
      channelId: "C123",
      cursor: "cursor-1",
      oldest: "1723640000.000100",
      latest: "1723640000.000300",
      inclusive: true,
      limit: 50,
    }),
  ).resolves.toMatchObject({ nextCursor: "next" }); // RED: method does not exist.
  expect(history).toHaveBeenCalledWith({
    token: "test-token",
    channel: "C123",
    cursor: "cursor-1",
    oldest: "1723640000.000100",
    latest: "1723640000.000300",
    inclusive: true,
    limit: 50,
  });
});
```

| Case                                | RED                                            | GREEN                                                                                        |
| ----------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Root cutoff plus newer channel root | Returns complete empty evidence at the cutoff. | Returns the newer root and advances the stable watermark.                                    |
| Runtime channel page                | `readChannelPage` is absent.                   | Calls `conversations.history` with exact token/channel/bounds/cursor.                        |
| Root cutoff plus same-thread reply  | Matrix not explicit.                           | Merges the reply with admitted channel roots and deduplicates exact IDs.                     |
| Reply cutoff                        | No channel-path assertion.                     | Reads only later replies in the mapped thread.                                               |
| Unrelated evidence                  | Channel/thread distinction untested.           | Rejects malformed/threaded channel rows and off-thread replies; exact channel remains fixed. |

## Verification

1. `pnpm test extensions/deliberation/src/history-read.test.ts extensions/slack/src/monitor/deliberation-history.test.ts extensions/deliberation/src/orchestration.test.ts extensions/deliberation/src/contract.test.ts -- --reporter=verbose`
2. `pnpm test extensions/deliberation`
3. `pnpm docs:check-mdx && pnpm docs:check-links`
4. `pnpm lint:extensions && pnpm tsgo:extensions && pnpm tsgo:extensions:test`
5. `pnpm build`
6. `git diff --check`
7. From the clean committed candidate: `pnpm test:deliberation:full-gate`
