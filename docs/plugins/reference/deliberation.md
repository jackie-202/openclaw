---
summary: "Fail-closed Discord and Slack intake backed by the Deliberation Knowledge Manager."
read_when:
  - You are installing, configuring, or auditing the deliberation plugin
title: "Deliberation plugin"
---

# Deliberation plugin

The Deliberation plugin keeps configured Discord and Slack sources silent in ordinary dispatch and submits eligible inbound messages to an external Knowledge Manager (KM). The KM owns workflow controls and delivery state. Slack intake keeps the child message timestamp separate from its thread timestamp and reads only that thread for history evidence. Final delivery uses the provider in the KM-authorized durable destination.

## Distribution

- Package: `@openclaw/deliberation`
- Install route: included in OpenClaw

## Surface

plugin

<!-- openclaw-plugin-reference:manual-start -->

## Configure

Every pipeline needs a stable unique ID and exactly one canonical source. The processing route must differ from every pipeline source. Credentials must be structured SecretRefs; plaintext credentials are rejected.

```json5
{
  plugins: {
    entries: {
      deliberation: {
        enabled: true,
        config: {
          enabled: true,
          failClosed: true,
          pipelines: [
            {
              id: "discord-root-target",
              source: {
                channel: "discord",
                accountId: "<account-id>",
                target: "<source-channel-id>",
              },
              target: {
                channel: "discord",
                accountId: "<delivery-account-id>",
                target: "<delivery-channel-id>",
              },
            },
            {
              id: "slack-thread-target",
              source: {
                channel: "slack",
                accountId: "<workspace-account-id>",
                target: "<source-channel-id>",
              },
              target: {
                channel: "slack",
                accountId: "<workspace-account-id>",
                target: "<delivery-channel-id>",
                threadId: "1770000000.000001",
              },
            },
            {
              id: "slack-source-default",
              source: {
                channel: "slack",
                accountId: "<workspace-account-id>",
                target: "<second-source-channel-id>",
              },
            },
          ],
          processingSource: {
            channel: "discord",
            accountId: "<account-id>",
            target: "<processing-channel-id>",
          },
          km: {
            endpoint: "https://<km-host>",
            credential: { source: "env", provider: "default", id: "KM_TOKEN" },
            requestTimeoutMs: 1000,
          },
          restrictedSessionKeys: ["<restricted-session-key>"],
        },
      },
    },
  },
}
```

See [SecretRef credential surface](/reference/secretref-credential-surface) for credential setup.

An explicit pipeline target uses canonical `channel`, `accountId`, and `target` fields. Omitting `threadId` represents root delivery; providing it selects that exact target thread. At authenticated intake, the plugin selects the pipeline whose source matches the provider, account, and channel evidence. An omitted target resolves to that authenticated source and its source thread. For a Discord root message, this is a source-message anchor: Discord creates or reuses the thread attached to that message before sending one reply. Each accepted request carries the selected pipeline ID and effective target, so pipelines can use different explicit or source-default destinations.

No tagged release through `v2026.8.1-beta.2` included this plugin. Later tagged builds accept only canonical `pipelines` at startup. If an untagged fork build wrote a legacy `sources` array or global `deliveryTarget`, run `openclaw doctor --fix` before starting the Gateway. The plugin-owned migration creates one stable `v1:<provider>:<account>:<channel>` pipeline per source, copies the global target to each pipeline, removes the legacy keys, and reports the change. It refuses to choose between mixed legacy fields and `pipelines`; remove one authority manually and rerun doctor. Runtime intake has no legacy fallback or global common-target projection.

## Wire contract

Every request sends `X-Deliberation-Protocol-Version: 1`. The canonical KM API has exactly six operations:

- `GET /deliberation/v1/health`
- `GET /deliberation/v1/ready`
- `POST /deliberation/v1/intake`
- `POST /deliberation/v1/reservations`
- `POST /deliberation/v1/invocations`
- `POST /deliberation/v1/completions`

Request and response objects are closed schemas. The KM owns the `source-intake`, `claims`, `review`, and `sender` controls. Change them with KM operator tooling, not OpenClaw Gateway methods or plugin CLI commands.

Accepted Discord and Slack intake uses `v1:<provider>:<account>:<channel>` as the canonical `sourceTarget`. For example, Slack account `work` and channel `C123` produce `v1:slack:work:C123`. Account and channel components are both part of the KM record, deduplication, and correlation domain. Slack thread timestamps are routing identities and are not encoded into `sourceTarget`; a reply's own `message.ts` remains its `providerEventId`.

A pipeline `target` is optional and operator-owned. It is a closed Discord or Slack destination with `channel`, `accountId`, `target`, and optional `threadId`. Slack thread IDs must be canonical timestamps such as `1770000000.000001`. Explicit targets are converted exactly; without `threadId` they represent root delivery and never inherit the source thread. When `target` is omitted, authenticated admission derives the destination from the selected source pipeline and source thread.

The durable wire target includes `mode`: `root` for an exact channel root, `thread` for an exact existing thread, or `source_anchor` for a Discord root message whose attached thread must be created or reused. `threadId` is absent for `root` and required for the other modes. The plugin sends the selected `pipelineId` and effective `deliveryTarget` with intake. KM persists both in the ready item, reservation, invocation, completion, and historical attempt evidence. Message content, reviewer output, model output, and later configuration changes cannot select or replace either value.

## Probe intake

Use the fork-owned producer probe to exercise the same handler and KM client as a Discord intake hook. Put the credential in `OPENCLAW_DELIBERATION_KM_CREDENTIAL`; never include it in the event JSON or command arguments.

```bash
export OPENCLAW_DELIBERATION_KM_CREDENTIAL='<KM_CREDENTIAL>'
printf '%s\n' '{"pipelines":[{"id":"discord-source","source":{"channel":"discord","accountId":"default","target":"<SOURCE_CHANNEL_ID>"}}],"processingSource":{"channel":"discord","accountId":"default","target":"<PROCESSING_CHANNEL_ID>"},"event":{"provider":"discord","eventType":"message","eventKind":"user_request","accountId":"default","conversationId":"<SOURCE_CHANNEL_ID>","messageId":"<DISCORD_MESSAGE_ID>","senderId":"<DISCORD_SENDER_ID>","timestamp":"2026-08-04T12:50:19.483Z","content":"probe message"},"context":{"channelId":"discord","accountId":"default","conversationId":"<SOURCE_CHANNEL_ID>","messageId":"<DISCORD_MESSAGE_ID>","senderId":"<DISCORD_SENDER_ID>"}}' \
  | node --import tsx extensions/deliberation/scripts/intake-producer.ts \
      --endpoint 'http://127.0.0.1:8765'
```

The command writes one bounded JSON object to stdout:

```json
{ "handled": true, "providerEventId": "<DISCORD_MESSAGE_ID>", "duplicate": false }
```

The configured pipelines and processing source are separate from the authenticated event and hook context so the probe can exercise wrong-account, contradictory-evidence, no-match, and processing-route rejection before any KM request. Message content is never routing authority. Run the same accepted input again to exercise listener idempotency. A conforming listener returns `"duplicate":true`; the external listener harness must also assert that its canonical store contains exactly one record for the provider event ID. The probe does not inspect listener storage and cannot send Discord messages or activate the KM sender control.

Failed KM requests return `"handled":false` with a bounded `diagnostic` object. `stage` is one of `credential`, `transport`, `response-json`, `http`, or `response-schema`; `status` is present when an HTTP response exists; and `code` is a protocol-v1 KM error code or `UNKNOWN`. Output never includes the credential, endpoint, event content, sender ID, or a KM error message. Malformed probe input exits nonzero with a fixed `input` diagnostic.

## Operate

Run `openclaw deliberation health` or `openclaw deliberation status` for the same read-only KM health response. The response includes protocol version, KM status, and all four controls. CLI failures use the standard command error path; Gateway health and status methods report them as unavailable. Neither path exposes request bodies or credentials.

## Fail-closed behavior

Configured source traffic remains terminally silent when KM is unavailable or the plugin's KM work is disabled. The processing route is excluded before intake. Restricted sessions cannot use configured send tools or canonical outbound delivery to source targets.

Deliberation claims configured Discord and Slack sources before channel debounce. Each authenticated provider event ID remains a separate intake call, including events received inside one configured debounce window; history is context only and never combines provider events into one intake. Unconfigured traffic retains the normal channel debounce behavior.

Discord auto-thread delivery keeps the authenticated parent channel as source authority while the created child thread remains the reply and session target. Source ownership runs before conversation-bound plugin dispatch, fast-abort confirmation, and all ordinary reply or model dispatch paths.

Discord removes exact self-authored messages before `inbound_claim`: the authenticated `botUserId` is compared with `author.id` in the Discord monitor and preflight paths. The hook payload does not expose authoritative bot/self evidence, so Deliberation does not infer bot identity from names, display text, or other unstable metadata. Other accepted bot-authored events remain subject to Discord's channel policy before reaching this plugin.

Runtime intake warnings use the same bounded KM stage, status, and code fields. They omit credentials, request and response bodies, endpoint values, Discord message content, and raw KM error messages.

The Gateway plugin service polls the KM ready queue at a bounded interval and processes at most one item per non-overlapping tick. It validates the ready pipeline and destination, reserves them, verifies exact deep equality with the durable reservation, and records invocation evidence before requesting one native text attempt from the selected Discord or Slack adapter. The canonical durable `deliveryTarget` selects the exact provider, account, channel, and delivery mode for the adapter attempt, invocation evidence, and completion evidence. The adapter renders the final provider-specific text and mentions before preflighting the single-message limit. Over-limit output is rejected before a native message-create request.

The strict attempt never retries, rechunks, or changes delivery routes. Discord does not fall back from a selected webhook to the bot. Slack does not retry DNS/request failures or remove message identity and retry. Discord bot delivery passes the durable provider-attempt key as the native nonce with nonce enforcement. Discord webhooks and Slack report native idempotency as unsupported because their message-create contracts do not accept that key.

A confirmed send must return evidence for exactly one platform message. A definitive preflight or platform rejection becomes a KM `FAILED` completion. A timeout, request failure, accepted-then-error possibility, or malformed/multipart success receipt remains unresolved for KM recovery; Deliberation does not issue another send. OpenClaw does not recompute the route from source provenance or current configuration after reservation.

The KM remains authoritative for sender disablement, reservation conflicts, durable invocation identity, crash recovery, and terminal `SENT` or `FAILED` state. Disabled or conflicted reservations do not call a provider. Malformed, unsupported, or mismatched destinations stop before invocation and send; exact one-message receipts and definitive bounded provider rejections are completed through KM against the same durable target. Gateway stop or plugin reload clears the polling timer and waits for the active tick before releasing the service.

<!-- openclaw-plugin-reference:manual-end -->
