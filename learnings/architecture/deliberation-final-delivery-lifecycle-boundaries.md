---
title: "Deliberation final delivery aligns lifecycle, KM, and provider boundaries"
date: 2026-08-13
category: architecture
component: backend
tags: [openclaw, deliberation, plugin-lifecycle, discord, km, idempotency]
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
# Deliberation final delivery must align three owner boundaries

When a plugin consumes a durable queue owned by another service, keep the runtime integration narrow:

- The plugin lifecycle owns only scheduling: one immediate tick, one bounded unref'd interval, one in-flight promise, timer cleanup, and stop-time drain.
- KM remains the sole owner of ready selection, reservation conflict/disablement, invocation evidence, idempotency, crash recovery, and terminal completion.
- The channel plugin remains the sole provider authority through `api.runtime.channel.outbound.loadAdapter("discord")`, with the exact reservation account and target passed to `sendText`.

Two boundary validations are easy to miss even when unit tests pass:

1. Parse the reservation destination with the existing canonical source-identity parser. Splitting on `:` and checking non-empty fields accepts whitespace and characters forbidden by the wire contract.
2. Build failure evidence from the closed KM schema. For Deliberation v1, diagnostics belong in bounded `providerEvidence.detail`; an intuitive key such as `message` is rejected as `SCHEMA_INVALID` and prevents terminal `FAILED` recording.

The most useful lifecycle test starts with an empty successful startup tick, then blocks a later interval tick. Advancing multiple intervals while it is blocked proves non-overlap, and calling `stop()` before releasing it proves shutdown waits for the active operation.
