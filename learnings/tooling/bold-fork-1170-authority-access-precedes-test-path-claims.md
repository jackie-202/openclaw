---
title: "Authority access precedes owner-test planning claims"
date: 2026-08-02
category: tooling
component: shared
tags: [planning, external-contract, tdd, permissions, provenance]
file_type: rules
---

# Authority Access Precedes Owner-Test Planning Claims

When an acceptance repair must modify an externally owned listener, a consumer repository can identify the owner module and required behaviors but cannot honestly provide owner-test imports, paths, or commands while access to that authority is denied.

The plan should:

1. Make authority access the first hard dependency.
2. Require reading scoped owner instructions, production code, and existing tests before naming the test edit.
3. Preserve any genuine historical RED instead of manufacturing a local replacement.
4. Keep consumer mirror tests as synchronization proof only.
5. Block mirror provenance updates until owner tests and a live supported-client probe are GREEN.

An exact runnable consumer skeleton can still document the downstream regression, but it must not be presented as evidence that the owner listener changed.
