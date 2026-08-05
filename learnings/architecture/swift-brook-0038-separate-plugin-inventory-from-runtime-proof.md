---
title: "Separate plugin inventory metadata from runtime activation proof"
date: 2026-08-03
category: architecture
component: tooling
tags: [plugins, manifest, runtime, activation, testing]
file_type: rules
---

# Separate plugin inventory metadata from runtime activation proof

`openclaw plugins list --json` uses the manifest-only snapshot path in `src/plugins/status-snapshot.ts`. It deliberately does not import plugin runtime modules, so empty runtime-derived fields such as `hookCount` do not prove that a plugin's `register(api)` failed.

For hook-only bundled plugins, verify three surfaces independently:

1. Build and inspect the actual `dist/extensions/<id>/index.js` export shape.
2. Load the staged artifact through the full production loader and assert typed hooks plus the global hook runner.
3. Use static manifest contracts when non-importing inventory must report expected hooks, then enforce those declarations after full registration.

Do not make inventory eagerly execute plugin code or add an entry compatibility shim based only on snapshot output. In this incident, the built Deliberation artifact had a valid default object with `register`, and a full loader probe registered all four hooks; the zero-hook list result came from the snapshot path.
