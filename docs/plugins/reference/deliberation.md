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

## Operate

Run `openclaw deliberation health` or `openclaw deliberation status` for the same read-only KM health response. The response includes protocol version, KM status, and all four controls. CLI failures use the standard command error path; Gateway health and status methods report them as unavailable. Neither path exposes request bodies or credentials.

## Fail-closed behavior

Configured source traffic remains terminally silent when KM is unavailable or the plugin's KM work is disabled. The processing route is excluded before intake. Restricted sessions cannot use configured send tools or canonical outbound delivery to source targets.

Outbound delivery is intentionally inactive. Reactivate it only after a later immutable KM contract carries the authorized destination through the ready or reservation flow. Do not infer a route, choose a default source, or maintain a second destination map in OpenClaw.

<!-- openclaw-plugin-reference:manual-end -->
