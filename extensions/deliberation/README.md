# Deliberation plugin

## Repository boundary

OpenClaw owns the Deliberation channel/provider hooks, intake and history
adapters, final-delivery behavior, and the public HTTP adapter contract. Run
the repository-local coverage without another checkout:

```bash
pnpm test extensions/deliberation
pnpm test:deliberation:full-gate
```

An external orchestrator may depend on this public boundary and run integration
tests against OpenClaw. Its implementation, storage, migration, restart, and
cross-repository end-to-end gates belong to that caller's repository and are
not prerequisites for OpenClaw verification.

### Probe final delivery from a built artifact

An external caller-owned harness can import
`dist-runtime/extensions/deliberation/api.js` and call
`runDeliberationDeliveryProbe`. This test-only API composes the production KM
client and final-delivery adapter with internal synthetic Discord and Slack
providers. It is not listed in `openclaw.extensions`, is not exported from the
plugin entry, and cannot be selected by Gateway startup.

The input is a strict object with exactly these fields:

```js
{
  endpoint: "http://127.0.0.1:<random-port>",
  credential: { source: "env", provider: "default", id: "KM_PROBE_TOKEN" },
  requestTimeoutMs: 5000,
}
```

The endpoint must use plain HTTP and the literal host `127.0.0.1` or `[::1]`
with an explicit high ephemeral port in the range `32768-65535`. The credential must be an environment-backed
SecretRef; literal credentials, provider selection, provider injection, public
hosts, HTTPS, URL credentials, query strings, fragments, and extra fields are
refused before a KM client is created.

The returned JSON contains `ok`, ordered `stages`, a synthetic-provider
`callCount` and provider/root-or-thread target classification, and `build`
identity with package version, commit, artifact class, and executing module
SHA-256. Failures include only the stage plus a canonical KM operation, path,
status, protocol code, or safe cause when available. Endpoint authority,
credentials, ready-item text, request/response bodies, raw errors, receipts,
and message IDs are not returned. Synthetic receipt and message IDs are
deterministically derived from the production provider-attempt ID and cannot
reach Discord or Slack.

## Slack source-only pilot

Do not activate the pilot until its readiness review is `READY`. Passing local
tests is insufficient: the review must also have stable, non-contradictory
contract and final verification evidence for every preceding batch slice.

### Check prerequisites

- Confirm the OpenClaw-owned adapter contract and local fixture hashes pass in
  `src/contract.test.ts`.
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

| Case                      | Required observation                                                                                                                                                                                 |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Slack root                | One intake identity where message and thread timestamps are equal; bounded freshness merges exact-channel roots with replies in that root; at most one Discord target call; one matching KM receipt. |
| Slack child reply         | Child `message.ts` remains the provider event ID while `thread_ts` selects history; unrelated channel threads are absent; at most one Discord target call.                                           |
| Duplicate event           | KM reports a duplicate or reservation conflict; no additional provider call occurs.                                                                                                                  |
| Invalid or stale evidence | Malformed target, identity drift, incomplete freshness, stale replay, or timestamp-bound failure closes the run with no provider call.                                                               |

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
