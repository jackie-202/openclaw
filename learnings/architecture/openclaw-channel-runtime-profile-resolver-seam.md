---
title: "OpenClaw: per-channel runtime profile resolver seam"
date: 2026-06-04
category: architecture
component: backend
tags: [openclaw, channels, runtime-profiles, status, config]
file_type: rules
---

# OpenClaw: per-channel runtime profiles need one effective resolver

When adding persistent per-channel runtime settings, do not only patch `sessions.json` or status rendering. The durable source of truth should be config, and runtime/status/session rows should all call the same channel matching seam.

## Useful seam

`src/channels/model-overrides.ts` already has the provider normalization and channel candidate matching needed for `channels.modelByChannel`: direct channel id, thread/parent candidates, channel/subject names, and wildcard fallback. Extending this seam into a full `resolveChannelRuntimeProfile` avoids duplicating channel-id matching in status, Gateway rows, and reply runtime.

## Precedence that worked

For `channels.runtimeByChannel`, keep legacy `channels.modelByChannel` as a model-only fallback:

1. Agent/model defaults remain the baseline.
2. `channels.modelByChannel.<provider>.<target>` can fill only `model`.
3. `channels.runtimeByChannel.<provider>.<target>` can fill `model`, `thinkingLevel`, `reasoningLevel`, and `textVerbosity`.
4. Explicit persisted session overrides still win over profile fields.
5. Per-turn/directive overrides win over everything.

## Gotchas

- Inbound reply code had a guard that only called the channel model resolver when `cfg.channels.modelByChannel` existed. Profile-only model routing needs that guard widened to also check `cfg.channels.runtimeByChannel`.
- `session_status` can reconstruct status from a session entry that lacks `thinkingLevel`/`reasoningLevel`; it must resolve the channel profile before passing values into `buildStatusText`.
- Gateway session rows also need the effective profile, otherwise the Control UI/session APIs can still show inherited fields as missing even when runtime/status are correct.
- `textVerbosity` status params use a strict `low | medium | high` union, while a generic runtime profile resolver may return strings. Narrow or type the resolver field before passing it into status params.
- Shared channel config keys must be updated in multiple places (`validation`, plugin auto-enable, channel presence, uninstall, doctor stale-plugin cleanup), otherwise core-owned `runtimeByChannel` can be mistaken for plugin-owned channel config.

## Validation pattern

Use focused tests across all affected seams:

- config schema accepts strict runtime profiles and rejects unknown profile keys
- model-ref validation collects `channels.runtimeByChannel.*.*.model`
- resolver tests prove runtime profile model wins over legacy `modelByChannel`
- `session_status` test proves reconstructed channel sessions show effective model/think/reasoning/text
- Gateway session row test proves API/UI rows inherit profile values without mutating persisted session state
