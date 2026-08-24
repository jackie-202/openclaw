# Deliberation plugin

## Local KM integration

Run the real intake serializer and HTTP client against an isolated KM listener
and disposable canonical spool:

```bash
OPENCLAW_DELIBERATION_KM_ROOT=/absolute/path/to/km-system \
  pnpm test:deliberation:km-integration
```

The command is intentionally separate from the hermetic extension unit suite.
It fails with an actionable `plugin:` error when the KM checkout is missing,
uses only a random loopback port, generates a temporary credential, and removes
the listener and all temporary state on success or failure. The listener's test
mode requires a sentinel and rejects any path overlapping the production spool
before opening SQLite.

## Slack source-only pilot

Do not activate the pilot until its readiness review is `READY`. Passing local
tests is insufficient: the review must also have stable, non-contradictory
contract and final verification evidence for every preceding batch slice.

### Check prerequisites

- Confirm the accepted contract provenance hashes pass in
  `src/contract.test.ts` and match the KM-owned contract evidence.
- Confirm the Slack intake/history, structured target, Discord delivery, and
  dormant Slack delivery slices each have stable final evidence.
- Confirm the configured Slack app can read the single allowed source channel
  and its threads. Keep the allowlist to `<slack-channel-id>` only.
- Confirm `<discord-account-id>` can post one message in the private
  `<test-deliberation-channel-id>` destination and its optional test thread.
- Confirm KM intake, history freshness, reservation, invocation, completion,
  and sender controls report the expected pilot state.

### Review the source-only shape

Use this as a review template for `plugins.entries.deliberation.config`, not as
an activation command:

```json5
{
  enabled: true,
  failClosed: true,
  pipelines: [
    {
      id: "slack-pilot",
      source: {
        channel: "slack",
        accountId: "<slack-account-id>",
        target: "<slack-channel-id>",
      },
      // Explicit target without threadId represents root delivery.
      target: {
        channel: "discord",
        accountId: "<discord-account-id>",
        target: "<test-deliberation-channel-id>",
      },
    },
    {
      id: "discord-threaded",
      source: {
        channel: "discord",
        accountId: "<discord-account-id>",
        target: "<second-source-channel-id>",
      },
      target: {
        channel: "discord",
        accountId: "<discord-account-id>",
        target: "<test-deliberation-channel-id>",
        threadId: "<explicit-test-thread-id>",
      },
    },
    {
      id: "discord-source-default",
      source: {
        channel: "discord",
        accountId: "<discord-account-id>",
        target: "<third-source-channel-id>",
      },
      // Omitted target marks this pipeline for authenticated source-default resolution.
    },
  ],
  processingSource: {
    channel: "discord",
    accountId: "<processing-account-id>",
    target: "<processing-channel-id>",
  },
  km: {
    endpoint: "<loopback-or-approved-km-endpoint>",
    credential: {
      source: "env",
      provider: "default",
      id: "<km-credential-environment-variable>",
    },
    requestTimeoutMs: 1000,
  },
  restrictedSessionKeys: ["<review-session-key>"],
}
```

Authenticated intake selects the pipeline matching the provider, account, and
source channel evidence, then sends its ID and effective target to KM. An
omitted target resolves to the authenticated source and source thread. A
Discord root becomes `mode: "source_anchor"`, which creates or reuses the thread
attached to the source message before one text send. Discord child messages and
Slack source defaults become `mode: "thread"`. Explicit targets are sent
exactly: an omitted `threadId` becomes `mode: "root"`, while a present
`threadId` becomes `mode: "thread"`. Pipelines may therefore use different
explicit or source-default destinations. Message content cannot select a
pipeline or replace its target.

No tagged release through `v2026.8.1-beta.2` included the Deliberation plugin.
Later tagged builds accept only canonical `pipelines` at startup. If an untagged
fork build wrote `sources` or a global `deliveryTarget`, run
`openclaw doctor --fix` before starting the Gateway. The plugin-owned doctor
migration creates one stable `v1:<provider>:<account>:<channel>` pipeline per
source, copies the global target to each pipeline, removes the legacy keys, and
refuses mixed legacy and canonical authority for manual repair. There is no
runtime legacy fallback, common-target projection, or reservation-time override.

### Bound the smoke cases

Evaluate only these cases during a separately approved pilot window:

| Case                      | Required observation                                                                                                                                       |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Slack root                | One intake identity where message and thread timestamps are equal; one bounded thread history; at most one Discord target call; one matching KM receipt.   |
| Slack child reply         | Child `message.ts` remains the provider event ID while `thread_ts` selects history; unrelated channel threads are absent; at most one Discord target call. |
| Duplicate event           | KM reports a duplicate or reservation conflict; no additional provider call occurs.                                                                        |
| Invalid or stale evidence | Malformed target, identity drift, incomplete freshness, stale replay, or timestamp-bound failure closes the run with no provider call.                     |

For each case, inspect the canonical Slack source identity, child/root timestamp
separation, history `complete` flag, message and 32 KiB bounds, immutable target
and pipeline ID at ready/reservation/invocation/completion, provider attempt ID, Discord message
ID, completion receipt, and total Discord/Slack provider call counts. The Slack
provider call count must remain zero.

### Abort and disable

Abort immediately on target or provenance drift, incomplete history, a
timestamp outside the captured cutoff/watermark, more than one provider call,
any Slack provider call, a missing or mismatched receipt, an unexpected source
channel, or contradictory contract evidence.

To disable the pilot, set `plugins.entries.deliberation.config.enabled` to
`false`, remove `<slack-channel-id>` from the separately managed pilot
allowlist, and keep the configured pipeline so source traffic remains
fail-closed. Keep its Slack target absent. Confirm the final delivery
service is not registered, no reservation is invoked, and both provider call
counts stay at zero. Preserve KM records and receipts for audit; do not retry or
reroute an invoked attempt manually.
