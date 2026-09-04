---
title: "Compare credentials across registered runtime contexts"
date: 2026-08-25
category: runtime-errors
component: shared
tags: [slack, deliberation, account-resolution, runtime-context, diagnostics]
file_type: rules
---

# Compare credentials across registered runtime contexts

When a channel can accept inbound events but a secondary runtime capability cannot read provider history, do not infer missing provider scopes from the terminal error alone.

Trace both paths from the same resolved account. In Slack, the public read action selects `userToken ?? botToken`, while a monitor-registered history context can accidentally capture a different token during startup. Both paths may use the same account and channel policy yet reach Slack with different authorization.

Characterize the mismatch with one configured-shape test that joins:

- the real default account config,
- exact channel-ID allowlist admission,
- account-scoped runtime-context registration,
- the token and channel passed to the provider client.

Only after those internal values agree should a live read be used to classify `missing_scope`, `not_in_channel`, or `channel_not_found`. Keep those diagnostics allowlisted and sanitized, and preserve the caller's fail-closed terminal class.
