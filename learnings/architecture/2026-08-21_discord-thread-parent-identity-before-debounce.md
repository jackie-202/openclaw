---
title: "Discord: rodičovská identita vlákna před debounce"
date: 2026-08-21
category: architecture
component: shared
tags: [discord, deliberation, debounce, routing, plugin-hooks]
file_type: rules
---

# Discord thread ownership must resolve channel metadata before debounce

Discord gateway `Message` objects expose `channelId`, not a hydrated `channel` object. Reading `message.channel.parentId` at the pre-debounce boundary therefore silently loses the authenticated parent channel and causes parent-owned thread events to retain normal aggregation.

Use `resolveDiscordChannelInfo(client, channelId)` before evaluating plugin ownership policy. This path uses `Client.fetchChannel`, which is already cached by both the Discord entity cache and the monitor channel-info cache, and preflight reuses the same channel-info resolver. The resulting `parentId` can safely remain routing authority while the child channel ID remains the event conversation and eventual reply target.

Regression proof should use two child-thread message IDs in one debounce window and assert all three facts:

- the policy sees the same authenticated parent for both events;
- each event reaches processing with its own provider message ID;
- ordinary unowned channel events still aggregate.

Do not infer thread ownership from fields absent from the actual gateway structure type, even if test fixtures or another Discord library expose similarly named convenience properties.
