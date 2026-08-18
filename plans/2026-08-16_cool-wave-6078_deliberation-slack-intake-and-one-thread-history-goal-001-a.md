# Plan 2026-08-16: Repair Deliberation Slack Intake Acceptance

Use the preserved Slack implementation, close only proven gaps, and supply an attributable acceptance bundle with complete proof.

*Status: DRAFT*

## Analysis

- `extensions/deliberation/src/config.ts`, `route-match.ts`, `intake.ts`, `history-read.ts`, `slack-timestamp.ts`, and `thread-identity-store.ts` already implement Slack source config, child/thread separation, durable correlation, exact timestamp handling, one-thread reads, and fail-closed validation.
- `extensions/slack/src/monitor/message-handler/prepare.ts`, `deliberation-history.ts`, and `provider.ts` already preserve `message.ts ?? event_ts`, own Slack Web API access, and register an account-scoped history capability through `src/plugin-sdk/channel-runtime-context.ts`.
- Existing focused tests cover roots, replies, exact decimal ordering, account/channel/thread isolation, malformed/conflicting data, pagination, byte/count bounds, and Discord parity.
- Acceptance rejected the supplied material because it omitted those production paths, supplied incomplete proof/final-note artifacts, and mixed unrelated final-delivery/KM contract changes into the target diff.
- Historical proof is genuine at `plans/checkpoints/calm-vale-7471.red-green-proof.md`; `plans/checkpoints/calm-vale-7471.evidence.md` confirms the parent GREEN but reports truncated command lines. Do not reconstruct another RED.

## Available Skills

- `task-evidence`: cite historical parent proof and its gaps.
- `tdd`: capture fresh follow-up GREEN; create RED only for a newly discovered behavior gap.
- `openclaw-testing`: select repository-supported focused gates.
- `validate-implementation` and `autoreview`: mandatory behavior/scope closeout.
- `acceptance`: evaluate only the immutable, correctly attributed repair bundle.
- `save-learning`: mandatory last implementation-session action.

## Implementation

1. Audit the preserved implementation against goals 001-005 before editing. Trace Slack prepare -> inbound hook mapping -> `admitInboundSource` -> keyed-state registration -> `deliberation.history.read` -> account-scoped Slack reader, and confirm Discord still uses its existing branch.
2. Run the focused suite once as a baseline. If it exposes a real goal gap, add one failing assertion first and make the smallest production correction; otherwise do not rewrite or touch working production merely to manufacture a task diff.
3. Keep the accepted identities invariant: `providerEventId = message.ts` with `event_ts` only when `ts` is absent; `threadId = thread_ts ?? providerEventId`; `sourceTarget = v1:slack:<account>:<channel>`.
4. Preserve the unchanged KM wire. Persist `sourceTarget + providerEventId -> threadId` before intake; never add `threadId` to KM intake/history payloads or encode it in `sourceTarget`.
5. Confirm history resolves the stored thread under the exact configured account/channel, rejects malformed/conflicting/off-thread data, compares decimal timestamps exactly, and independently enforces page, message, and byte bounds.
6. Build the acceptance input from only the Slack intake/history implementation and focused tests listed below. Keep `cutover-controls-v1.json`, final sender/delivery changes, and unrelated KM contract churn outside this target; use supplied concurrent-task attribution where ownership is proven, otherwise report attribution ambiguity rather than reverting shared work.
7. Capture fresh GREEN evidence for `cool-wave-6078`, then write `plans/checkpoints/cool-wave-6078.final-note.md` with every exact command/outcome, the parent proof link and evidence gap, and the stable KM handoff details from steps 3-4.
8. Run `validate-implementation` and fresh `autoreview` until no accepted actionable finding remains. Re-run acceptance with the target production diff, complete proof, final note, and explicit concurrent context.
9. Invoke `save-learning` last and save at least one learning about acceptance attribution/evidence repair; do not duplicate the existing Slack identity learning.

## Files to Modify

| Path | Action |
| --- | --- |
| `extensions/deliberation/src/{config,route-match,intake,history-read,slack-timestamp,thread-identity-store}.ts` | Preserve and include in target evidence; edit only for a test-proven gap. |
| `extensions/deliberation/index.ts` | Include only the keyed-store/history wiring hunk; exclude unrelated final-delivery hunks from this task. |
| `extensions/slack/src/monitor/message-handler/prepare.ts` | Preserve child event identity and root thread identity. |
| `extensions/slack/src/monitor/deliberation-history.ts`, `extensions/slack/src/monitor/provider.ts` | Preserve exact-thread Web API reads and account-scoped lifecycle registration. |
| `src/plugin-sdk/channel-runtime-context.ts` | Preserve the generic typed history capability; do not add Slack-specific core policy. |
| `extensions/deliberation/src/{config,route-match,source-identity,history-read,hooks,contract}.test.ts` | Reuse focused behavior coverage; add only a missing acceptance assertion found during audit. |
| `extensions/slack/src/monitor/{deliberation-history,provider.allowlist}.test.ts`, `extensions/slack/src/monitor/message-handler/prepare.test.ts` | Reuse provider-boundary and timestamp fallback coverage. |
| `plans/checkpoints/cool-wave-6078.red-green-proof.md` | Link historical RED and record fresh follow-up GREEN per `tdd`; never fabricate RED. |
| `plans/checkpoints/cool-wave-6078.final-note.md` | Record exact results and KM-facing stable wire details. |

## TDD

Implement any newly found correction with `skill:tdd`. Because the preserved implementation already exists, reuse the genuine parent RED at `plans/checkpoints/calm-vale-7471.red-green-proof.md`; the follow-up proof records that provenance plus fresh GREEN.

**Target:** `extensions/deliberation/src/route-match.test.ts`  
**Focused run:** `pnpm test extensions/deliberation/src/route-match.test.ts extensions/deliberation/src/history-read.test.ts extensions/deliberation/src/hooks.test.ts`

Historical RED assertion now retained as regression coverage:

```ts
import { describe, expect, it } from "vitest";
import { parseDeliberationConfig } from "./config.js";
import { admitInboundSource } from "./route-match.js";

it("keeps a Slack reply child separate from its thread root", () => {
  const config = parseDeliberationConfig({
    enabled: true,
    failClosed: true,
    sources: [{ channel: "slack", accountId: "work", target: "C123" }],
    processingSource: { channel: "discord", accountId: "work", target: "processing" },
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
        accountId: "work",
        conversationId: "C123",
        messageId: "1723640000.000200",
        threadId: "1723640000.000100",
        senderId: "U123",
      },
      {
        channelId: "slack",
        accountId: "work",
        conversationId: "C123",
        messageId: "1723640000.000200",
        senderId: "U123",
      },
    ),
  ).toMatchObject({
    accepted: true,
    sourceTarget: "v1:slack:work:C123",
    providerEventId: "1723640000.000200",
    threadId: "1723640000.000100",
  });
});
```

| Proof | RED | GREEN |
| --- | --- | --- |
| Parent identity/history implementation | Existing parent proof records Slack config/admission/history failures. | Existing parent proof records 6 files and 111 tests passing. |
| Follow-up acceptance repair | No new RED unless audit finds a still-missing assertion. | Fresh focused command passes and is captured under `cool-wave-6078`. |

## Verification

```bash
pnpm test \
  extensions/deliberation/src/config.test.ts \
  extensions/deliberation/src/route-match.test.ts \
  extensions/deliberation/src/source-identity.test.ts \
  extensions/deliberation/src/history-read.test.ts \
  extensions/deliberation/src/hooks.test.ts \
  extensions/deliberation/src/contract.test.ts \
  extensions/slack/src/monitor/message-handler/prepare.test.ts \
  extensions/slack/src/monitor/deliberation-history.test.ts \
  extensions/slack/src/monitor/provider.allowlist.test.ts
pnpm tsgo:core
pnpm tsgo:extensions
pnpm tsgo:extensions:test
pnpm format:check -- extensions/deliberation/src extensions/slack/src/monitor src/plugin-sdk/channel-runtime-context.ts
pnpm format:docs:check
pnpm build
```

The final note must transcribe actual outcomes, not expected counts. Record unrelated failures separately without changing their files.

## Acceptance Handoff

- Supply the preserved production implementation, not only docs/checkpoints.
- Supply both parent RED provenance and fresh follow-up GREEN.
- Supply `plans/checkpoints/cool-wave-6078.final-note.md`.
- State that the KM intake/history wire remains closed and unchanged; Slack thread correlation is plugin SQLite state keyed by canonical source plus child event ID.
- Exclude or independently attribute unrelated final-delivery and contract changes before finalizing acceptance.
