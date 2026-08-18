---
title: "Fresh plugin inspection is not active Gateway lifecycle proof"
date: 2026-08-18
category: runtime-errors
component: backend
tags: [openclaw, plugins, gateway, deliberation, deployment]
file_type: checklist
---

# Fresh plugin inspection is not active Gateway lifecycle proof

`openclaw plugins inspect <id> --runtime --json` loads the selected artifact in a fresh CLI process. It proves that the artifact can register typed hooks and services, but it does not prove that an already-running Gateway loaded the same artifact or started those services.

For a stuck durable queue item, combine three read-only evidence planes:

1. `openclaw gateway status --deep --require-rpc --json` identifies the active process, build path, and RPC health.
2. A plugin-owned Gateway RPC proves that the active process loaded at least the plugin method and can expose owner controls and queue state.
3. Fresh runtime inspection plus a built-singleton assertion proves the staged artifact contains the expected hooks and lifecycle service.

If the active RPC reports enabled sender controls and pending work while the durable store has no reservation attempt, but only the fresh artifact proves the sender service, classify deployment/process drift before changing queue or sender code. Use the owner-approved deploy verifier and a full Gateway restart; do not add a poller, manually reserve the record, or treat out-of-process inspection as proof of active service startup.
