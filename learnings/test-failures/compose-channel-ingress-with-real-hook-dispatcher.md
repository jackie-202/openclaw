---
title: "Compose channel ingress with the real hook dispatcher"
date: 2026-08-02
category: test-failures
component: shared
tags: [discord, plugins, hooks, integration-tests, runtime-registry]
file_type: rules
---

# Compose channel ingress with the real hook dispatcher

A direct plugin handler test plus a mocked generic dispatch test does not prove a live channel invokes the hook. In the Discord monitor suite, `openclaw/plugin-sdk/reply-runtime` is mocked so `processDiscordMessage` stops at a fake `dispatchInboundMessage`; this bypasses runtime plugin loading, the global hook runner, canonical hook mapping, and `before_dispatch` ordering.

For channel-hook regressions, add one composed boundary test that keeps platform REST and outbound delivery mocked but delegates to the production shared reply dispatcher and activates the real plugin through the loader. Assert the activated hook inventory, canonical event fields, invocation count and ordering, terminal behavior, and unrelated-channel fallthrough in that single path.

When source tests pass but live behavior differs, also compare the loaded plugin/SDK module source and active registry identity. An external channel package or stale runtime copy can execute a different dispatcher than the source alias used by Vitest; direct handler assertions cannot detect that split.
