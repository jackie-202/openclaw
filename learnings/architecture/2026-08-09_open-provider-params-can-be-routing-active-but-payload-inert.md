---
title: "Open provider params can be routing-active but payload-inert"
date: 2026-08-09
category: architecture
component: backend
tags: [openclaw, provider-params, routing, reasoning-effort, payload]
file_type: rules
---

# Open provider params can be routing-active but payload-inert

An open `params` schema proves only that configuration can be stored. It does not prove that an arbitrary key reaches the provider payload.

In OpenClaw's embedded agent path, provider params are merged and passed to provider preparation hooks, but the generic stream wrapper projects a fixed set of recognized fields. A raw key such as `params.reasoningEffort` can therefore survive config parsing and merge while never becoming `options.reasoningEffort` or an outbound reasoning field.

The same inert key can still have a runtime side effect. OpenAI routing classifies unrecognized model params as authored provider request overrides. That classification can disable implicit Codex reproduction and select the embedded OpenClaw runtime even though the key is not forwarded to the request. A setting can be payload-inert and routing-active at the same time.

When auditing an open provider params bag, prove these stages independently:

1. Schema acceptance.
2. Merge precedence.
3. Runtime-routing classification.
4. Projection into typed stream options or provider hook consumption.
5. Final payload mutation after all wrappers.
6. Status and telemetry visibility.

Do not infer stage 4 from stage 1 or 2. Add a focused test that captures both selected runtime and final payload whenever an arbitrary provider param can affect routing.
