---
title: "External delivery recovery must return to the canonical reserve path"
date: 2026-07-28
category: architecture
component: general
tags: [openclaw, plugins, delivery, reconciliation, cas, fail-closed]
file_type: decisions
---

# External delivery recovery must return to the canonical reserve path

When a plugin delegates durable delivery authority to an external system, reconciliation must not create a second direct-send path. A `NOT_SENT` proof should requeue the delivery, after which the normal worker performs the same control-aware CAS reservation used for first attempts and receives a fresh attempt ID.

This avoids an otherwise unavoidable race between reading emergency controls and calling the provider. Repeated `senderEnabled` or `safeSilence` snapshots cannot make a later send atomic. The external authority must own the transition back to queued work, while the plugin keeps one canonical `list -> reserve -> send -> complete` path.

Related invariants:

- Validate every externally supplied destination against normalized configured routes immediately before provider send.
- Keep the provider send abortable by service shutdown, but use a separate bounded signal for KM completion once a provider outcome exists.
- Treat thrown or unknown-stage sends as `unknown`; only explicit pre-send proof is retryable.
- Preserve queue intent IDs, sanitized multipart receipt identities, and closed suppression reasons in completion.
- Terminal source silence remains local and fail-closed even when intake or sender work is disabled.
