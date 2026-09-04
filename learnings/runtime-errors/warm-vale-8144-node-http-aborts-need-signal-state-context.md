---
title: "Node HTTP aborts need signal-state context"
date: 2026-08-25
category: runtime-errors
component: backend
tags: [openclaw, deliberation, node-http, abort, timeout, diagnostics]
file_type: rules
---

# Node HTTP aborts need signal-state context

OpenClaw's Deliberation KM client uses `node:http`, not global `fetch`, to preserve a closed transport-header contract. When the request signal aborts, this transport rejects with a Node `AbortError` carrying `code: "ABORT_ERR"`; it does not necessarily reject with a DOM `TimeoutError` or `AbortError`.

Classifying only `DOMException` therefore collapses both request timeouts and caller cancellations into a generic transport failure. At the request boundary, retain the dedicated timeout signal and classify a Node abort using both the closed error name/code and `timeout.aborted`:

- `ABORT_ERR` plus `timeout.aborted === true` means `timeout`.
- `ABORT_ERR` plus `timeout.aborted === false` means caller `aborted`.
- Never log the raw error message, because socket and abort errors can include endpoint or operator data.

Tests should emulate the production Node rejection shape. Cover a pre-aborted caller signal and a timeout-triggered combined signal separately; a mock that rejects only with a DOM exception does not prove the `node:http` path.
