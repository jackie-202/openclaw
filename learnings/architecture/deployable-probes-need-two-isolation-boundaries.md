---
title: "Deployable probes need two independent isolation boundaries"
date: 2026-08-25
category: architecture
component: backend
tags: [plugins, probe, isolation, build-identity, redaction]
file_type: decisions
---

# Deployable probes need two independent isolation boundaries

A plugin deployment probe should be importable from a built public API without being discoverable as a plugin startup entry. In Deliberation, exporting the probe from `extensions/deliberation/api.ts` while leaving `package.json#openclaw.extensions` and `index.ts` unchanged lets an isolated harness execute the emitted artifact without adding a Gateway mode or service.

Network loopback alone is not enough for a state-mutating probe. A loopback URL can still identify a privileged or long-running local service. Require literal loopback HTTP, an explicit high ephemeral port, and an environment-backed probe credential reference before constructing the production client. Keep providers internal and non-injectable so no caller can substitute Discord or Slack execution.

Deployment evidence should identify the executing artifact rather than only the checkout. Report the package version, build commit when available, source-versus-built artifact class, and SHA-256 of the executing probe module. Keep lifecycle diagnostics closed to stage, canonical operation/path/status/code, and safe causes; never return endpoint authority, credentials, payload text, response bodies, or raw errors.

The strongest proof combines three paths:

- A stateful loopback test proves the production ready/reserve/invoke/complete requests, idempotency keys, one synthetic provider call, and zero-call replay.
- The owner-backed integration gate invokes the public API against the canonical disposable listener and verifies its accepted contract hashes.
- A built singleton smoke imports `dist-runtime/extensions/<plugin>/api.js` while separately asserting normal plugin discovery still registers only the existing hooks and services.
