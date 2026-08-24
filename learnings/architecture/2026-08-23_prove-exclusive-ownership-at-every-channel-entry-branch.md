---
title: "Prove exclusive ownership at every channel entry branch"
date: 2026-08-23
category: architecture
component: shared
tags: [openclaw, channels, deliberation, exclusive-ownership, testing]
file_type: rules
---

# Prove exclusive ownership at every channel entry branch

Channel-level exclusive ownership cannot be certified from the main message processor alone. Discord recognized system messages and Slack message subtypes can enqueue system events and return before their ordinary message processors run; empty-content guards can do the same without any owner result.

When adding exclusive source ownership:

- Inventory all authenticated exits between provider callback and ordinary dispatch, including subtype/system handlers and empty-content drops.
- Carry system-event data to the canonical claim boundary, then perform the unchanged ordinary enqueue only after a nonterminal claim.
- For attributed sources, bypass debounce, seen-state, thread routing, and other ordinary mutations until the targeted claim terminalizes.
- Test through the real plugin loader and provider handler. Directly testing a late preparation/processing function can pass while an earlier provider branch still bypasses ownership.
- Pair every configured-source assertion with a non-configured control that proves ordinary behavior is unchanged.
