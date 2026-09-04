# Plan 2026-08-25: Fix Slack Deliberation history read and verify against the configured channel

Trace the configured default account through Slack admission, public reads, monitor history registration, and Deliberation, then fix only the first demonstrated divergence and prove it with one read-only live lookup.

_Status: DRAFT_

## Analysis

### Codebase Context

- `extensions/slack/src/action-runtime.ts:167` authorizes exact channel IDs from `ResolvedSlackAccount.config`; read actions prefer `userToken ?? botToken` at `extensions/slack/src/action-runtime.ts:224`.
- `extensions/slack/src/accounts.ts:131` is the canonical root/account config merger. Tests must use the real shape with `accounts.default`, root `groupPolicy: "allowlist"`, and `channels.C0BJW0FALSC.enabled: true` instead of a flattened approximation.
- Slack inbound admission uses the monitor's resolved `channelsConfig` and `groupPolicy` through `extensions/slack/src/monitor/context.ts:497`.
- `extensions/slack/src/monitor/provider.ts:548` registers the account-scoped Deliberation history context, but currently passes `botToken` unconditionally. This differs from public read-token selection and is the primary RED hypothesis.
- `extensions/deliberation/src/history-read.ts:315` resolves `v1:slack:<account>:<channel>` to the matching account context and exact channel/thread; `extensions/deliberation/index.ts:171` currently collapses every cause to `SOURCE_HISTORY_UNAVAILABLE` without a safe provider classification.
- `extensions/slack/src/errors.ts:116` already understands Slack Web API platform errors and redacts sensitive text; diagnostics should reuse its error shape and expose only an allowlisted classification/scope summary.

### Relevant Documentation

- `docs/channels/slack.md:848` documents user-token read precedence and the history/read scopes that can remain an external blocker.
- `docs/cli/gateway.md:414` defines the read-only `gateway call <method> --params <json>` seam used for bounded live verification.
- `docs/reference/test.md:11` requires focused `pnpm test <path>` proof before the changed gate.

### Knowledge Base

- Keep one canonical account/config resolver and one effective read-token rule; do not add a Deliberation-only fallback.
- Preserve the registered account-scoped runtime context and exact route identity; never fall back to another account or channel.
- Repository activation proof requires tracing registration and callers, not only testing the Slack API wrapper (`learnings/architecture/2026-07-28_residue-audits-require-activation-proof.md`).
- Recall used deterministic local fallback because QMD collection `openclaw-fork-learnings` was unavailable; the other returned architecture stubs contained no additional actionable rules.

## Available Skills

- `tdd`: capture the account/token mismatch as RED before production edits.
- `openclaw-testing`: run focused plugin tests, then the changed check lane.
- `validate-implementation`: verify policy, account, and owner boundaries after the fix.
- `code-review`: perform the required pre-handoff review if `autoreview` is unavailable to the implementing agent.
- `save-learning`: required final implementation action.

## Implementation

1. With `skill:tdd`, add the configured-shape tests before editing production code. Prove that the public `read` action authorizes `C0BJW0FALSC` for account `default`, inbound admission accepts the same channel, and the registered `channel.history.v1` context is selected for `default`.
2. Make the monitor-history test invoke `readMessage` and assert the same effective read credential as the public action. Expected initial RED: the public action selects the account user token while `monitorSlackProvider` registers history with the bot token.
3. If the allowlist test itself fails before provider access, trace the exact `channelId` and `accountId` through `message-action-dispatch.ts`, `resolveSlackAccount`, and `resolveSlackChannelConfig`; fix the first mapping/config-resolution defect only. Do not open policy, add wildcard behavior, or bypass `isSlackChannelAllowedByPolicy`.
4. Centralize the effective Slack read-token choice in the smallest Slack-owned helper and use it from both `handleSlackAction` and monitor history registration. Keep writes on the existing bot-token path and preserve account-scoped runtime registration/disposal.
5. Add safe causal classification for Slack history failures. Pass through only `missing_scope`, `not_in_channel`, or `channel_not_found` plus syntactically valid Slack scope names from the SDK error shape; keep the Gateway code `SOURCE_HISTORY_UNAVAILABLE` and generic fallback for every other error. Add redaction tests proving tokens, headers, and message text are absent.
6. Extend Deliberation history tests with `v1:slack:default:C0BJW0FALSC` to prove exact account/context resolution and exact channel/root arguments. Keep Discord cases and all pagination, bounds, route matching, and sole-send assertions unchanged.
7. Run focused tests and the changed gate, then `skill:validate-implementation` and the mandatory fresh `skill:autoreview` until no actionable finding remains.
8. Perform one read-only live call against source `v1:slack:default:C0BJW0FALSC` and timestamp `1787683185.523829`. Filter the output immediately to source/account/channel/root or watermark IDs, completion, classification, and needed/provided scopes; do not print content or credentials. Do not invoke intake, delivery, replay, provider writes, or any config/spool/cron mutation.
9. Record exact commands/results, changed files, and the live result in the final note. If Slack still rejects the fixed path, report the sanitized API code and required operator scope/membership action without broadening permissions or claiming acceptance.
10. Invoke `skill:save-learning` last and save at least one learning.

## Files to Modify

| Path                                                        | Change                                                                                                                     |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `extensions/slack/src/action-runtime.ts`                    | Reuse the canonical effective read-token rule; change policy mapping only if the configured-shape RED proves it defective. |
| `extensions/slack/src/accounts.ts`                          | Host a small shared read-token resolver if no narrower existing Slack-owned helper fits.                                   |
| `extensions/slack/src/monitor/provider.ts`                  | Register account history with the same effective read credential as public reads.                                          |
| `extensions/slack/src/action-runtime.test.ts`               | Characterize exact-ID reads for the real default-account/allowlist shape.                                                  |
| `extensions/slack/src/monitor/provider.allowlist.test.ts`   | Join configured admission, account-scoped history registration, and effective read-token proof.                            |
| `extensions/slack/src/monitor/deliberation-history.test.ts` | Preserve exact API parameters and classify representative Slack API failures safely.                                       |
| `extensions/deliberation/src/history-read.test.ts`          | Prove default-account context lookup and exact configured channel/root correlation.                                        |
| `extensions/deliberation/src/plugin.test.ts`                | Assert sanitized Gateway failure details while retaining `SOURCE_HISTORY_UNAVAILABLE`.                                     |
| `extensions/deliberation/index.ts`                          | Add the narrow safe history-error classification at the Gateway boundary if needed.                                        |

Do not edit `~/.openclaw/openclaw.json`, KM state/spool, cron, provider messages, public docs, SDK contracts, Discord delivery, or final-delivery ownership.

## TDD

Implement the cycle with `skill:tdd`; record RED/GREEN evidence in `plans/checkpoints/swift-dune-6107.red-green-proof.md`.

**Primary test file:** `extensions/slack/src/monitor/provider.allowlist.test.ts`  
**Run command:** `pnpm test extensions/slack/src/monitor/provider.allowlist.test.ts`

Append this test using the file's existing runtime capture and monitor lifecycle helpers:

```ts
import { CHANNEL_HISTORY_RUNTIME_CONTEXT_CAPABILITY } from "openclaw/plugin-sdk/channel-runtime-context";
import { expect, it } from "vitest";
import {
  getSlackClient,
  getSlackHandlerOrThrow,
  resetSlackTestState,
  startSlackMonitor,
  stopSlackMonitor,
} from "../monitor.test-helpers.js";

it("uses the default account read credential for configured allowlist history", async () => {
  resetSlackTestState({
    channels: {
      slack: {
        groupPolicy: "allowlist",
        channels: { C0BJW0FALSC: { enabled: true, requireMention: false } },
        accounts: {
          default: {
            botToken: "xoxb-test",
            appToken: "xapp-test",
            userToken: "xoxp-read-test",
          },
        },
      },
    },
  });
  const { channelRuntime, register } = createRuntimeContextCapture();
  const monitor = startSlackMonitor(monitorSlackProvider, { channelRuntime });
  try {
    await getSlackHandlerOrThrow("message");
    const registration = register.mock.calls.find(
      ([value]) => value.capability === CHANNEL_HISTORY_RUNTIME_CONTEXT_CAPABILITY,
    )?.[0];
    await registration?.context.readMessage({
      channelId: "C0BJW0FALSC",
      messageId: "1787683185.523829",
    });
    // RED: monitor history currently sends xoxb-test while public reads select xoxp-read-test.
    expect(getSlackClient().conversations.history).toHaveBeenCalledWith(
      expect.objectContaining({
        token: "xoxp-read-test",
        channel: "C0BJW0FALSC",
        oldest: "1787683185.523829",
        latest: "1787683185.523829",
      }),
    );
  } finally {
    await stopSlackMonitor(monitor);
  }
});
```

| Case                         | RED                                                                    | GREEN                                                                                         |
| ---------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Effective history credential | Registered history sends the bot token.                                | Public action and Deliberation history both use the resolved account read token.              |
| Exact-ID allowlist           | Any account/parameter mismatch rejects before provider access.         | `default` + `C0BJW0FALSC` is accepted; an unlisted/disabled ID remains rejected.              |
| Deliberation context         | Wrong/missing account context or channel argument fails the assertion. | `default` context receives only `C0BJW0FALSC` and the mapped root timestamp.                  |
| Safe diagnosis               | Gateway returns only generic failure or leaks raw error data.          | Terminal code remains unchanged and only an allowlisted API/scope classification is returned. |

## Verification

1. `pnpm test extensions/slack/src/action-runtime.test.ts extensions/slack/src/monitor/provider.allowlist.test.ts extensions/slack/src/monitor/deliberation-history.test.ts extensions/slack/src/monitor/message-handler.deliberation.test.ts`
2. `pnpm test extensions/deliberation/src/history-read.test.ts extensions/deliberation/src/plugin.test.ts extensions/deliberation/src/route-match.test.ts extensions/deliberation/src/sole-send.test.ts`
3. `pnpm changed:lanes --json`
4. `pnpm check:changed`
5. Read-only live proof through the running Gateway:

```bash
pnpm openclaw gateway call deliberation.history.read --json \
  --params '{"schemaVersion":2,"sourceTarget":"v1:slack:default:C0BJW0FALSC","after":"1787683185.523829"}' \
  | jq '{schemaVersion,sourceTarget,provenance,cutoffProviderEventId,watermarkProviderEventId,messageIds:[.messages[]?.providerEventId],complete,errorCode:(.error.code? // null),classification:(.error.message? // null)}'
```

Success requires exact provenance and successful root correlation. A remaining `missing_scope`, `not_in_channel`, or `channel_not_found` result is recorded as the external blocker and operator action, not converted to success.
