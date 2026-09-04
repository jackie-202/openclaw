---
title: "Keep textual sender hints non-authoritative"
date: 2026-08-31
category: architecture
component: shared
tags: [identity, trust-boundary, discord, slack, deliberation]
---

Trusted display names, usernames, and aliases were propagated separately from the opaque authenticated `senderId`. The hints were sourced only from authenticated provider metadata, never message text, and did not affect routing, deduplication, or delivery authority. They remained optional for backward compatibility and were normalized with UTF-8 byte limits, control-character rejection, alias count limits, case-insensitive deduplication, and a total serialized-size bound.

Reuse this separation whenever adding human-readable identity metadata: preserve the stable provider identity as the authority and treat textual names strictly as bounded presentation hints.
