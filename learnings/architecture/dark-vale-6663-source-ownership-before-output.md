---
title: "Vlastnictví zdroje musí předcházet všem výstupním cestám"
date: 2026-08-21
category: architecture
component: shared
tags: [deliberation, discord, debounce, inbound-hooks, dispatch]
file_type: rules
---

# Source ownership must govern every pre-output dispatch path

An inbound ownership hook that only disables channel debounce is insufficient. Conversation-bound plugin handlers can emit replies before generic `inbound_claim` and `before_dispatch`, so configured source traffic can leak even when model and fast-abort output are suppressed later.

Use one synchronous policy result for both boundaries:

- `aggregation: "separate"` preserves one provider event per dispatch before transforms.
- `dispatch: "exclusive"` prevents earlier binding output and lets broadcast intake own the event first.
- Events without exclusive ownership retain existing binding-first behavior.

Discord parent authority also needs fail-closed handling. Reject parent identity equal to the direct conversation because it turns a root event into a channel-named thread. If channel metadata cannot be resolved, disable aggregation rather than invoking source matching without the parent; merged provider IDs cannot be recovered later.

Tests should cover the invariant in layers: real loader-backed owner registration and matching, monitor propagation of authenticated parent/event facts, exact per-event queue behavior, ordinary debounce and binding regressions, and zero output after intake failure or source suppression.
