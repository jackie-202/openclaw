---
title: "Source-only investigation reports for bundled plugin crashes"
date: 2026-05-04
category: tooling
component: tooling
tags: [investigation, plugins, whatsapp, baileys]
file_type: checklist
---

# Source-only investigation reports for bundled plugin crashes

When a crash report points at a built `dist/server.impl-*.js:<line>` bundle but the task forbids external logs and says the bundle may not exist, keep the investigation source-only and map behavior through the plugin source instead of chasing generated output.

## Pattern

- Start with exact source greps for the suspect expression, such as `result\.error`, under the owning bundled plugin.
- Trace event flow from the provider/runtime callback into the plugin-owned controller before blaming the reconnect loop.
- For WhatsApp/Baileys disconnects, `connection.update` with `connection === "close"` can carry `lastDisconnect`; `waitForWaConnection` rejects that object, and login/monitor paths handle it differently.
- Check upstream commits named in the task, but verify the exact source after the commit; related commits may route output or improve logging without hardening the unsafe dereference.

## Gotcha

If TypeScript declares a helper result as a closed union, a production crash can still show that the runtime bundle violated or bypassed that contract. Investigation reports should call out both facts: the typed source path and the defensive boundary needed if runtime data is malformed.
