---
title: "OpenClaw sessions.send versus channel delivery"
date: 2026-06-10
category: architecture
component: backend
tags: [openclaw, gateway, sessions, discord, embedded-runner]
file_type: rules
---

# OpenClaw sessions.send versus channel delivery

When investigating Mission Control or Gateway flows that are expected to post back to a channel, separate session execution from channel delivery.

`sessions.send` is a Gateway/session dispatch contract. It validates against `SessionsSendParamsSchema`, rejects unknown fields, and does not expose or forward `deliver` to `chat.send`. A turn launched through `sessions.send` can still route through auto-reply and `runEmbeddedAgent`, so embedded-runner incomplete-turn policy may be covered even though no Discord delivery is requested.

For Discord-visible confirmation behavior, trace both paths independently:

- Discord inbound should flow through the Discord monitor, shared channel turn kernel, auto-reply dispatch, and embedded runner.
- Mission Control `sessions.send` should flow through the Gateway sessions handler, `chat.send`, auto-reply dispatch, and embedded runner.
- If the embedded-runner policy is present but Discord still does not receive a final confirmation, the likely issue is delivery contract mismatch, not raw `packages/agent-core` semantics.

The safe follow-up is to test and document that `sessions.send` does not accept `deliver`; do not silently overload `sessions.send` to post to Discord.
