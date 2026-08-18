---
title: "Use the generic outbound runtime adapter for cross-plugin channel sends"
date: 2026-08-13
category: architecture
component: shared
tags: [plugins, channel-outbound, lifecycle, deliberation, discord]
file_type: rules
---

# Use the generic outbound runtime adapter for cross-plugin channel sends

When a non-channel plugin must invoke a configured channel account, do not import that channel plugin's `runtime-api.ts` or deprecated provider-specific SDK facade. Use `api.runtime.channel.outbound.loadAdapter(channelId)`, require the narrow send method, and pass the active `api.config`, exact account ID, canonical target, and payload.

For Deliberation final delivery, this keeps responsibilities separated:

- KM owns readiness, reservation, idempotency, invocation evidence, recovery, and terminal state.
- The Deliberation adapter owns the one bounded provider invocation.
- The Discord outbound adapter owns account resolution, target normalization, native send behavior, and receipt production.
- A plugin service owns scheduling and cleanup. It must serialize ticks, clear its timer on stop, and await an in-flight tick so reload cannot create overlapping senders.

This boundary avoids a second delivery protocol and avoids moving Discord authority into KM or core.
