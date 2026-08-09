---
title: "Discord READY retries must return control to the provider owner"
date: 2026-08-06
category: architecture
component: backend
tags: [openclaw, discord, reconnect, lifecycle, health-monitor, readiness]
file_type: rules
---

# Discord READY retries must return control to the provider owner

The Discord lifecycle has two recovery layers with different ownership. The gateway object may perform one clean reconnect for a transient socket failure, but the channel manager owns destruction and reconstruction of the full provider instance, including client listeners, supervisor, status, and per-account startup staggering.

An unbounded READY retry loop inside `runDiscordGatewayLifecycle` prevents that outer recovery layer from running. The account remains `running` while the same initialized client repeatedly reconnects without becoming ready, which matches incidents where the health monitor reports a restart but message intake never resumes.

For startup or post-restart READY failures:

- bound retries on the same gateway object;
- throw after the bounded clean retry so the provider task settles;
- disconnect the gateway in lifecycle-final cleanup on every exit path;
- let `server-channels` recreate the account through its existing restart/backoff path;
- log account-qualified close/error, retry start, READY success, and terminal timeout transitions;
- test the Discord lifecycle owner directly, because a generic health-monitor stop/start mock cannot prove provider teardown.

Keep the fix plugin-local. Multi-account staggering remains correct when reconstruction re-enters `extensions/discord/src/channel.ts` rather than adding a second Discord-specific restart scheduler.
