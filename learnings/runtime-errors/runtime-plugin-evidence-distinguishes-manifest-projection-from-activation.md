---
title: "Runtime plugin evidence must distinguish manifest projection from activation"
date: 2026-08-18
category: runtime-errors
component: backend
tags: [openclaw, plugins, activation, deliberation, artifact-drift]
file_type: rules
---

# Runtime plugin evidence must distinguish manifest projection from activation

OpenClaw's cold plugin status snapshot can report `status: "loaded"`, `hookNames`, and `hookCount` from manifest `expectedHooks` without executing plugin code. The same snapshot initializes `services` as empty, so a loaded-looking status does not prove that a lifecycle sender exists in the running Gateway.

For queue consumers such as Deliberation, diagnose a stuck READY record in this order:

1. Use `openclaw plugins inspect <id> --runtime --json` to prove actual typed-hook and service registrations.
2. Confirm the active Gateway process/build identity and resolved plugin source path.
3. Compare that artifact with fresh `dist-runtime` output and assert the service in the built singleton test.
4. Only inspect queue/client behavior after proving the sender service is present and started.

This avoids duplicating a correct sender when the real defect is a stale linked artifact or unrestarted Gateway. A missing reservation row is especially strong evidence that execution never crossed the sender's KM reservation boundary.
