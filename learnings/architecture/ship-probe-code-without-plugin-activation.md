---
title: "Ship probe code without making it a plugin entry"
date: 2026-08-25
category: architecture
component: tooling
tags: [openclaw, plugins, build, probe, deployment]
file_type: rules
---

# Ship probe code without making it a plugin entry

Bundled-plugin build discovery combines `openclaw.extensions` with tracked top-level public TypeScript files. Plugin discovery, however, selects only `openclaw.extensions`.

For a deployed test-only boundary that must never start with the Gateway, use an existing non-plugin top-level entry such as `extensions/<id>/api.ts` and export the probe there. Keep the implementation under `src/`, import it from `api.ts`, and do not import it from `index.ts` or add it to `openclaw.extensions`.

Verify both sides after a fresh build:

- Import `dist-runtime/extensions/<id>/api.js` and assert the probe export exists.
- Load the normal plugin entry and assert its hooks/services are unchanged.

A newly created untracked top-level file may not appear in a local build because bundled entry discovery prefers `git ls-files`. Reusing a tracked public entry also avoids that pre-commit build-proof trap.
