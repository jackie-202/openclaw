---
title: "Balíčkové migrace ověřují odmítnutí i karanténu doctoru"
date: 2026-08-23
category: test-failures
component: e2e
tags: [openclaw, doctor, migration, packaging, plugins]
file_type: checklist
---

# Test package migrations at both ownership boundaries

A source-level compatibility normalizer test is not enough for a bundled plugin migration. OpenClaw derives top-level bundled plugin build entries from `git ls-files`, so an untracked `doctor-contract-api.ts` can pass direct-import tests while disappearing from a successful build and npm tarball.

The reliable proof sequence is:

1. Build and pack through `scripts/package-openclaw-for-docker.mjs`.
2. Install that tarball under a temporary prefix.
3. Point `HOME`, `OPENCLAW_STATE_DIR`, `OPENCLAW_CONFIG_PATH`, `OPENCLAW_OAUTH_DIR`, and `OPENCLAW_BUNDLED_PLUGINS_DIR` at temporary/package paths.
4. Invoke the installed `openclaw.mjs doctor --fix`, then installed `config validate`.
5. Assert the contract artifact exists in `dist/extensions/<plugin>/doctor-contract-api.js` and verify a second doctor run is byte-idempotent.

Invalid plugin config has two distinct ownership outcomes. The plugin normalizer can correctly refuse mixed or invalid authority by returning no mutation, after which generic doctor repair may still quarantine the invalid plugin by disabling it and pruning its config. Package tests should therefore validate invalid fixtures before repair and assert doctor did not report or synthesize the plugin migration. Exact no-mutation assertions belong in the focused normalizer tests.
