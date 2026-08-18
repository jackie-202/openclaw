# Plan 2026-08-16: Deliberation Slack intake and one-thread history

*Status: DRAFT*

## Progress

- [x] Phase 0: Config + init
- [x] Phase 1: Research
- [x] Phase 2: Knowledge
- [x] Phase 3: Synthesis

## Analysis

### Codebase context

- `extensions/deliberation/src/config.ts:5-20` and `extensions/deliberation/openclaw.plugin.json:49-69` make every route Discord-only; duplicate and processing-source checks already key provider/account/channel.
- `extensions/deliberation/src/route-match.ts:64-108` fail-closes duplicated route/message/sender disagreement but hard-codes Discord. `PluginHookInboundClaimEvent.threadId` is available; `extensions/slack/src/monitor/message-handler/prepare.ts:1256-1277` keeps reply `message.ts` and root `thread_ts` separate.
- `extensions/deliberation/src/intake.ts:80-92` preserves the closed KM intake shape but hard-codes `provider: "discord"`; the wire has no thread field.
- `extensions/deliberation/src/history-read.ts:81-219` is Discord-only. V2 ordering/cursors use snowflake `BigInt`; responses are capped at 50 messages and flagged incomplete over 32 KiB, but currently are not byte-trimmed.
- `deliberation.history.read` requests carry only `sourceTarget` plus the admitted provider event cursor. Preserve that wire by recording Slack event-to-thread routing locally in the plugin SQLite keyed store, then resolving it at read time.
- Slack can register an account-scoped history reader through the existing channel runtime-context registry. The reader must own Web API calls and token/account state; Deliberation must not import Slack internals.
- Slack `conversations.history` can read the exact root and expose its latest reply watermark; `conversations.replies` returns cursor-paginated thread messages. Existing action/thread helpers establish the calls but swallow errors or omit cursor details, so Deliberation needs a narrow fail-closed runtime capability.
- Existing tests already pin Discord source/account/channel admission, v1 history normalization, v2 watermark exclusion, count bounds, and the closed wire keys. Missing characterization is byte-bound output and provider-neutral refactor parity.

### Relevant documentation

- `docs/plugins/reference/deliberation.md` documents Discord-only config and intake and must describe Slack sources without implying Slack delivery.
- `docs/plugins/sdk-runtime.md` documents SQLite-backed plugin keyed state and injected channel runtime helpers.
- `docs/plugins/sdk-subpaths.md` and `src/plugin-sdk/AGENTS.md` require a narrow typed SDK seam rather than cross-plugin imports.
- Slack official `conversations.replies` and `conversations.history` contracts confirm exact thread/root arguments, timestamp bounds, cursor pagination, ordering differences, and required history scopes.
- The proposal file was not opened because it is outside the mandated repository boundary; the proposal decisions embedded in the task are treated as authoritative.

### Knowledge base

- Preserve routing identities separately: configured route is provider/account/channel, KM `sourceTarget` is canonical `v1:<provider>:<account>:<channel>`, provider event identity is the child message timestamp, and Slack thread routing is `thread_ts ?? message.ts`.
- Normalize provider target prefixes once at admission and reuse the result for matching, silence, intake provenance, and history lookup.
- Do not invent an external wire field. Keep thread correlation in OpenClaw-owned SQLite state and leave the accepted KM request/response keys unchanged.
- Fail closed on absent runtime capability, mapping, malformed Slack timestamps/messages, conflicting duplicate IDs, provider errors, non-advancing cursors, and account/channel mismatch.
- Recall used local fallback (`openclaw-fork-learnings` QMD collection missing); directly relevant project learnings override older pre-v1 identity notes where current source/contracts differ.

## Available Skills

- `tdd`: implement characterization and Slack behavior through recorded RED/GREEN cycles.
- `openclaw-testing`: choose repo-supported focused Vitest, formatting, lint, and tsgo commands.
- `autoreview`: mandatory fresh pre-handoff review after implementation.
- `validate-implementation`: check the completed change against task, plugin boundaries, docs, and accepted wire contracts.

## Approach

Keep Discord as the unchanged strategy and add Slack as a closed provider strategy. Slack admission returns both the exact child `providerEventId` (`message.ts`, falling back to `event_ts` only when absent) and `threadId = thread_ts ?? providerEventId`; Deliberation persists that pair under the canonical source identity before KM intake. The unchanged history request then resolves the thread root, obtains an account-scoped Slack runtime reader, and returns the same bounded response shape.

Expose the reader through a typed generic channel runtime-context capability. Slack owns token resolution, `conversations.history` root/watermark lookup, `conversations.replies` pagination, and raw Slack message shape; Deliberation owns configured-source authorization, exact decimal timestamp comparison, dedupe/conflict checks, provenance, output bounds, and `complete`.

## Implementation

1. Using `skill:tdd`, add and run passing Discord characterization for route normalization, v1/v2 provenance, and current `complete` semantics before production edits. Then add failing byte-bound and Slack source/admission cases for roots, replies, `event_ts` fallback, malformed timestamps, duplicate-field conflicts, unconfigured account/channel, and multiple configured Slack sources.
2. Split config schemas so `sources` accepts only `discord | slack`, while processing/final-delivery routes remain Discord-only. Keep strict keys, canonical components, duplicate detection, processing overlap, and manifest/runtime parity. Update plugin descriptions and the Deliberation reference without claiming Slack delivery.
3. Refactor route matching around the agreed configured provider. Normalize only canonical bare/`channel:` targets, require `message` + `user_request`, validate Discord IDs as before, validate Slack timestamps exactly, and return Slack `threadId` separately from `providerEventId` and `sourceTarget`.
4. In Slack preparation, use `message.ts ?? message.event_ts` for canonical message identity without replacing reply IDs with `thread_ts`; retain existing `MessageThreadId` root behavior. Add focused prepare tests for missing `ts` fallback and `ts != thread_ts`.
5. Open one bounded Deliberation keyed-state namespace in `index.ts`. Before Slack KM intake, atomically register `sourceTarget + providerEventId -> threadId`; accept identical duplicate mappings and fail closed on conflicts or state errors. Inject lookup into history handling; never encode the thread in `sourceTarget` or the KM body.
6. Add the typed channel-history capability key and contracts to the existing `channel-runtime-context` SDK subpath. Register an account-scoped implementation from the Slack monitor lifecycle and dispose it with the monitor abort signal. Use exact-root `conversations.history` reads to validate/capture the thread watermark and cursor-paginated `conversations.replies` reads for the bounded thread; propagate provider errors and reject repeated cursors.
7. Refactor `createHistoryReadHandler` into shared authorization/normalization/bounds plus Discord and Slack strategies. Parse request keys before provider dispatch, then validate Discord snowflakes or Slack decimal timestamps with provider-specific exact comparators. For Slack, require the stored thread mapping, reject off-thread rows and malformed sender/content/timestamps, preserve stable chronological order, and set `complete: false` when count or byte limits truncate while returning no oversized payload.
8. Extend focused tests for Slack root/reply history, exact API account/channel/thread arguments, root-only and multi-page threads, child/root separation, decimal ordering, cutoff/watermark inclusion, concurrent post-watermark exclusion, duplicate conflicts, malformed rows, provider failure, cursor non-progress, and count/byte bounds. Keep accepted KM contract files and method/response keys unchanged; add contract assertions only for that compatibility.
9. Verify with repo-supported commands. Use `skill:openclaw-testing` if scope expands, then run `skill:validate-implementation` and mandatory fresh `skill:autoreview` until no accepted actionable findings remain.

## Files to Modify

| Path | Change |
| --- | --- |
| `extensions/deliberation/src/config.ts`, `extensions/deliberation/openclaw.plugin.json` | Add strict Slack source routes while retaining Discord-only processing/delivery. |
| `extensions/deliberation/src/route-match.ts`, `extensions/deliberation/src/intake.ts`, `extensions/deliberation/index.ts` | Carry provider event/thread identities, persist correlation, and send the unchanged KM intake body. |
| `extensions/deliberation/src/history-read.ts` | Add provider dispatch, exact Slack timestamp logic, thread-only reads, and bounded output. |
| `extensions/deliberation/src/{config,route-match,source-identity,history-read,hooks,plugin,contract}.test.ts` | Characterize Discord and prove Slack admission/history/contract behavior. |
| `extensions/slack/src/monitor/message-handler/prepare.ts` and its focused test | Preserve child `ts`, add `event_ts` fallback, retain root thread identity. |
| `extensions/slack/src/monitor/deliberation-history.ts` and test, `extensions/slack/src/monitor/provider.ts` | Implement and register the fail-closed account-scoped Web API reader. |
| `src/plugin-sdk/channel-runtime-context.ts`, `src/infra/channel-runtime-context.test.ts` | Add the narrow capability key and typed reader/page contract on the existing registry subpath. |
| `docs/plugins/reference/deliberation.md`, `docs/plugins/sdk-subpaths.md` | Document Slack source intake/history and the generic runtime seam. |

## TDD

Implement the cycle with `skill:tdd`; record RED/GREEN evidence in `plans/checkpoints/calm-vale-7471.red-green-proof.md`.

**Target:** `extensions/deliberation/src/route-match.test.ts`  
**Run:** `pnpm test extensions/deliberation/src/route-match.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { parseDeliberationConfig } from "./config.js";
import { admitInboundSource } from "./route-match.js";

describe("Deliberation Slack source admission", () => {
  it("keeps a reply timestamp separate from its normalized thread root", () => {
    const config = parseDeliberationConfig({
      enabled: true,
      failClosed: true,
      sources: [{ channel: "slack", accountId: "acct", target: "C123" }],
      processingSource: { channel: "discord", accountId: "acct", target: "processing" },
      km: {
        endpoint: "https://km.invalid",
        credential: { source: "env", provider: "default", id: "KM_TOKEN" },
        requestTimeoutMs: 1000,
      },
      restrictedSessionKeys: ["agent:reviewer"],
    });

    expect(
      admitInboundSource(
        config,
        {
          provider: "slack",
          channel: "slack",
          eventType: "message",
          eventKind: "user_request",
          accountId: "acct",
          conversationId: "C123",
          messageId: "1770000001.000002",
          threadId: "1770000000.000001",
          senderId: "U123",
        },
        {
          channelId: "slack",
          accountId: "acct",
          conversationId: "C123",
          messageId: "1770000001.000002",
          senderId: "U123",
        },
      ),
    ).toEqual({
      accepted: true,
      route: { channel: "slack", accountId: "acct", target: "C123" },
      sourceTarget: "v1:slack:acct:C123",
      providerEventId: "1770000001.000002",
      threadId: "1770000000.000001",
      senderId: "U123",
    });
  });
});
```

| Test | RED | GREEN |
| --- | --- | --- |
| Slack reply admission | Config rejects `channel: "slack"` | Child event ID and root thread ID are returned separately with canonical provenance. |
| Slack history fixtures | No Slack reader/strategy exists | Only mapped thread rows are returned in exact timestamp order. |
| Byte-bound characterization | Oversized v2 payload is returned | Payload remains within 32 KiB and `complete` is false. |

Verification:

```bash
pnpm test \
  extensions/deliberation/src/config.test.ts \
  extensions/deliberation/src/route-match.test.ts \
  extensions/deliberation/src/source-identity.test.ts \
  extensions/deliberation/src/history-read.test.ts \
  extensions/deliberation/src/hooks.test.ts \
  extensions/deliberation/src/plugin.test.ts \
  extensions/deliberation/src/contract.test.ts \
  extensions/slack/src/monitor/message-handler/prepare.test.ts \
  extensions/slack/src/monitor/deliberation-history.test.ts
pnpm format:check -- extensions/deliberation extensions/slack/src/monitor src/plugin-sdk/channel-runtime-context.ts src/infra/channel-runtime-context.test.ts docs/plugins/reference/deliberation.md docs/plugins/sdk-subpaths.md
pnpm lint:extensions
pnpm tsgo:extensions
pnpm tsgo:extensions:test
pnpm build
```

These replace the task's raw Vitest, Prettier, and `tsc --noEmit` examples with the repository-required test wrapper, oxfmt wrapper, and tsgo lanes.

## Dependencies

- Slack monitor startup must register the runtime reader for every configured account; missing registration is `SOURCE_HISTORY_UNAVAILABLE`, never a channel-wide fallback.
- The accepted KM intake and history request/response keys remain unchanged. Any KM-side provider validation not defined by the embedded proposal context must be recorded for sequence 2, not implemented here.
- No live Slack/Discord message or configuration change is part of verification.
