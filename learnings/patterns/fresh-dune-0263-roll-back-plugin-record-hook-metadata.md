---
title: "Roll back plugin record metadata with registry registrations"
date: 2026-08-04
category: patterns
component: backend
tags: [plugins, rollback, hooks, registry, testing]
file_type: rules
---

# Roll back plugin record metadata with registry registrations

When plugin registration fails after partially adding typed hooks, restoring only the registry arrays is insufficient. Registration also mutates the in-progress `PluginRecord` by appending `hookNames` and incrementing `hookCount`; the failed record is subsequently published for diagnostics.

Snapshot the record's hook metadata before calling `register()`, then restore it in the same catch path that restores the registry and global side effects. Otherwise status can report a failed plugin with hooks that no longer exist in the runtime registry.

A useful regression fixture declares one expected hook but registers a different hook. It should finish with:

- plugin status `error`
- empty `hookNames`
- `hookCount: 0`
- no entries in `registry.typedHooks`

This catches incomplete rollback that a fixture registering no hooks cannot expose.
