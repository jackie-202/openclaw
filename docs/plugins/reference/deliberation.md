---
summary: "Fail-closed Discord intake backed by the Deliberation Knowledge Manager."
read_when:
  - You are installing, configuring, or auditing the deliberation plugin
title: "Deliberation plugin"
---

# Deliberation plugin

The Deliberation plugin keeps configured Discord sources silent in ordinary dispatch and submits eligible inbound messages to an external Knowledge Manager (KM). The KM owns workflow controls and delivery state. OpenClaw does not currently activate an outbound sender because the canonical KM reservation does not identify an authorized Discord account and target.

## Distribution

- Package: `@openclaw/deliberation`
- Install route: included in OpenClaw

## Surface

plugin

<!-- openclaw-plugin-reference:manual-start -->

## Configure

The processing route must differ from every source route. Credentials must be structured SecretRefs; plaintext credentials are rejected.

```json5
{
  plugins: {
    entries: {
      deliberation: {
        enabled: true,
        config: {
          enabled: true,
          failClosed: true,
          sources: [
            { channel: "discord", accountId: "<account-id>", target: "<source-channel-id>" },
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

## Wire contract

Every request sends `X-Deliberation-Protocol-Version: 1`. The canonical KM API has exactly six operations:

- `GET /deliberation/v1/health`
- `GET /deliberation/v1/ready`
- `POST /deliberation/v1/intake`
- `POST /deliberation/v1/reservations`
- `POST /deliberation/v1/completions`
- `POST /deliberation/v1/reconciliations`

Request and response objects are closed schemas. The KM owns the `source-intake`, `claims`, `review`, and `sender` controls. Change them with KM operator tooling, not OpenClaw Gateway methods or plugin CLI commands.

Accepted Discord intake uses `v1:<provider>:<account>:<channel>` as the canonical `sourceTarget`. For example, account `default` and channel `123456` produce `v1:discord:default:123456`. Account and channel components are both part of the KM record, deduplication, and correlation domain; an account-less `discord:channel:<id>` target is not accepted for new intake.

## Probe intake

Use the fork-owned producer probe to exercise the same handler and KM client as a Discord intake hook. Put the credential in `OPENCLAW_DELIBERATION_KM_CREDENTIAL`; never include it in the event JSON or command arguments.

```bash
export OPENCLAW_DELIBERATION_KM_CREDENTIAL='<KM_CREDENTIAL>'
printf '%s\n' '{"routes":{"sources":[{"provider":"discord","accountId":"default","channelId":"<SOURCE_CHANNEL_ID>"}],"processing":{"provider":"discord","accountId":"default","channelId":"<PROCESSING_CHANNEL_ID>"}},"event":{"provider":"discord","eventType":"message","eventKind":"user_request","channelId":"<SOURCE_CHANNEL_ID>","accountId":"default","messageId":"<DISCORD_MESSAGE_ID>","senderId":"<DISCORD_SENDER_ID>","timestamp":"2026-08-04T12:50:19.483Z","content":"probe message"}}' \
  | node --import tsx extensions/deliberation/scripts/intake-producer.ts \
      --endpoint 'http://127.0.0.1:8765'
```

The command writes one bounded JSON object to stdout:

```json
{ "handled": true, "providerEventId": "<DISCORD_MESSAGE_ID>", "duplicate": false }
```

The configured routes are separate from the event so the probe can exercise wrong-account and processing-route rejection before any KM request. Run the same accepted input again to exercise listener idempotency. A conforming listener returns `"duplicate":true`; the external listener harness must also assert that its canonical store contains exactly one record for the provider event ID. The probe does not inspect listener storage and cannot send Discord messages or activate the KM sender control.

Failed KM requests return `"handled":false` with a bounded `diagnostic` object. `stage` is one of `credential`, `transport`, `response-json`, `http`, or `response-schema`; `status` is present when an HTTP response exists; and `code` is a protocol-v1 KM error code or `UNKNOWN`. Output never includes the credential, endpoint, event content, sender ID, or a KM error message. Malformed probe input exits nonzero with a fixed `input` diagnostic.

## Operate

Run `openclaw deliberation health` or `openclaw deliberation status` for the same read-only KM health response. The response includes protocol version, KM status, and all four controls. CLI failures use the standard command error path; Gateway health and status methods report them as unavailable. Neither path exposes request bodies or credentials.

## Fail-closed behavior

Configured source traffic remains terminally silent when KM is unavailable or the plugin's KM work is disabled. The processing route is excluded before intake. Restricted sessions cannot use configured send tools or canonical outbound delivery to source targets.

Discord removes exact self-authored messages before `inbound_claim`: the authenticated `botUserId` is compared with `author.id` in the Discord monitor and preflight paths. The hook payload does not expose authoritative bot/self evidence, so Deliberation does not infer bot identity from names, display text, or other unstable metadata. Other accepted bot-authored events remain subject to Discord's channel policy before reaching this plugin.

Runtime intake warnings use the same bounded KM stage, status, and code fields. They omit credentials, request and response bodies, endpoint values, Discord message content, and raw KM error messages.

Outbound delivery is intentionally inactive. Reactivate it only after a later immutable KM contract carries the authorized destination through the ready or reservation flow. Do not infer a route, choose a default source, or maintain a second destination map in OpenClaw.

<!-- openclaw-plugin-reference:manual-end -->
