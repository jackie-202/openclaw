# Plan 2026-08-16: Repair Slack Intake Acceptance Evidence

Make Slack child/root identity normalization explicit in this task's production diff, then submit bounded proof that includes the implementation.

*Status: DRAFT*
*Created: 2026-08-16*

## Analysis

- `extensions/slack/src/monitor/message-handler/prepare.ts:1256` already sets `providerEventId = message.ts ?? message.event_ts` and passes Slack's normalized thread identity through the inbound context.
- `extensions/deliberation/src/route-match.ts:70` already admits configured Slack routes, validates Slack timestamps, keeps the child `providerEventId`, and normalizes the thread to `event.threadId ?? providerEventId`.
- `extensions/deliberation/src/intake.ts:62` persists child-to-thread correlation before sending the unchanged KM intake body.
- `extensions/deliberation/src/route-match.test.ts:53`, `extensions/deliberation/src/route-match.test.ts:86`, and `extensions/deliberation/src/hooks.test.ts:44` already cover configured replies, roots, and intake ordering.
- `plans/checkpoints/acceptance-runs/cool-wave-6078-acceptance-001/result.json` rejects attribution, not observed behavior: the supplied task-scoped diff omitted the production paths above.
- `plans/checkpoints/calm-vale-7471.red-green-proof.md` is the genuine historical RED; do not manufacture another RED after the implementation exists.
- `docs/plugins/reference/deliberation.md:82` documents the accepted child-event/thread split; no documentation change is needed.

## Knowledge Base

- `learnings/patterns/cool-wave-6078-validate-provider-hook-metadata.md`: validate provider metadata as `unknown`, require strings before parsing, and fail closed on malformed identities.
- `learnings/tooling/acceptance-retries-separate-inherited-work-from-target-tdd-proof.md`: distinguish inherited implementation from target attribution and reuse historical proof without reconstructing RED.
- `learnings/architecture/2026-07-28_residue-audits-require-activation-proof.md`: trace registration and callers rather than relying on literal or diff-only evidence.
- Recall used the deterministic local fallback because the `openclaw-fork-learnings` QMD collection was unavailable; the other returned learnings were not applicable to this bounded admission repair.

## Available Skills

- `task-evidence`: extract exact parent commands/outcomes without rerunning historical suites.
- `tdd`: record historical RED provenance and fresh follow-up GREEN.
- `validate-implementation`: check the bounded refactor against plugin boundaries and task requirements.
- `acceptance`: evaluate the immutable repair bundle containing production code, tests, and proof.
- `save-learning`: mandatory final implementation-session action.

## Implementation

1. Trace `prepareSlackMessage` -> inbound hook payload -> `admitInboundSource` -> `createInboundClaimHandler` once and record the exact production hunks that establish `providerEventId = message.ts` when present and `threadId = thread_ts ?? message.ts`.
2. Refactor only the existing Slack identity branch in `extensions/deliberation/src/route-match.ts` into one local normalization result that validates the child/root timestamps and returns `{ providerEventId, threadId: threadId ?? providerEventId }`; preserve all rejection reasons, chronology checks, Discord behavior, and KM payload shape. This supplies attributable production implementation without adding a second path.
3. Reuse the existing configured root/reply assertions in `extensions/deliberation/src/route-match.test.ts`; change tests only if the refactor reveals an uncovered output or regression. Do not duplicate passing cases solely to create a test diff.
4. Verify `extensions/slack/src/monitor/message-handler/prepare.ts` still prefers `message.ts` over `event_ts`, and verify `extensions/deliberation/src/intake.ts` persists the normalized thread before KM intake. Do not modify either file unless a focused test proves a gap.
5. Generate `plans/checkpoints/swift-dune-5344.red-green-proof.md` with a link to the genuine parent RED and fresh GREEN results. Generate `plans/checkpoints/swift-dune-5344.evidence.md` with exact commands, outcomes, and production file/line evidence.
6. Build the acceptance bundle from the route admission implementation, Slack preparation caller, intake callee, focused tests, and proof artifacts. Exclude unrelated final-delivery, KM contract, changelog, and documentation hunks.
7. Run `validate-implementation`, then `acceptance`; address only findings tied to goal-001.
8. Invoke `save-learning` last and save at least one non-duplicate learning about making inherited production behavior attributable in acceptance retries.

## Files to Modify

| Path | Change |
| --- | --- |
| `extensions/deliberation/src/route-match.ts` | Consolidate existing Slack child/thread validation and normalization into one explicit local result. |
| `extensions/deliberation/src/route-match.test.ts` | Reuse root/reply coverage; edit only for a newly demonstrated gap. |
| `plans/checkpoints/swift-dune-5344.red-green-proof.md` | Link historical RED and record fresh GREEN. |
| `plans/checkpoints/swift-dune-5344.evidence.md` | Record exact verification and task-scoped production evidence. |

## TDD

Implement the cycle with `skill:tdd`. Do not run a fake new RED: reuse the genuine failure captured in `plans/checkpoints/calm-vale-7471.red-green-proof.md`, then run fresh GREEN for this follow-up.

**Target:** `extensions/deliberation/src/route-match.test.ts`  
**Run:** `pnpm test extensions/deliberation/src/route-match.test.ts extensions/deliberation/src/hooks.test.ts extensions/slack/src/monitor/message-handler/prepare.test.ts`

Historical RED regression skeleton already present in the target file:

```ts
import { describe, expect, it } from "vitest";
import { parseDeliberationConfig } from "./config.js";
import { admitInboundSource } from "./route-match.js";

it("keeps a Slack reply's child identity separate from its normalized thread identity", () => {
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
    providerEventId: "1723640000.000200",
    threadId: "1723640000.000100",
  });
});
```

| Test | Historical RED | Follow-up GREEN |
| --- | --- | --- |
| Configured Slack reply | Parent run failed before Slack config/admission existed. | Child timestamp remains `providerEventId`; root timestamp remains `threadId`. |
| Configured Slack root | Parent run failed before Slack config/admission existed. | Message timestamp is both `providerEventId` and `threadId`. |
| Intake registration | Parent run failed before child-to-thread registration existed. | Mapping is stored before the unchanged KM intake call. |

## Verification

```bash
pnpm test extensions/deliberation/src/route-match.test.ts extensions/deliberation/src/hooks.test.ts extensions/slack/src/monitor/message-handler/prepare.test.ts
pnpm tsgo:extensions
pnpm tsgo:extensions:test
pnpm format:check -- extensions/deliberation/src/route-match.ts extensions/deliberation/src/route-match.test.ts
git diff --check
```

Transcribe actual outcomes into the task proof. Report the known unrelated final-delivery timer and Slack boundary-export failures only if a broader command encounters them; do not modify those surfaces.
