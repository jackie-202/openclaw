---
title: "Resolve Discord thread parents before debounce policy"
date: 2026-08-21
category: architecture
component: shared
tags: [discord, threads, debounce, routing, plugin-hooks]
---

Discord gateway `Message` objects expose `channelId` but not the parent channel object. The initial pre-debounce ownership policy therefore received no parent identity for child-thread messages, causing configured parent-channel sources to remain eligible for aggregation.

Resolve channel metadata through the canonical cached `resolveDiscordChannelInfo(client, channelId)` path before evaluating source ownership. Pass the authenticated parent conversation ID into the policy and cover child-thread events with a same-window regression test. Do not infer parent identity from transformed message fields or assume it is present on the gateway message.
