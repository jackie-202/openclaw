---
title: "Normalize canonical channel identities at the plugin boundary"
date: 2026-08-01
category: architecture
component: backend
tags: [discord, route-matching, inbound-claim, normalization]
---

Discord inbound events exposed conversation targets as `channel:<id>`, while Deliberation configuration stored bare channel IDs. Exact comparison silently rejected valid events, so intake was never called. Normalize the provider-specific prefix once at the plugin boundary, then reuse the normalized value for both route matching and downstream `sourceTarget`. Regression tests should use the canonical runtime payload rather than a simplified synthetic shape.
