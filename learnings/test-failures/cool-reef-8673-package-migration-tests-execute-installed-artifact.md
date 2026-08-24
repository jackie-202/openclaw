---
title: "Package migration tests must execute the installed artifact"
date: 2026-08-23
category: test-failures
component: ci-cd
tags: [openclaw, doctor, migration, package-artifact, temporary-config, tdd]
file_type: checklist
---

# Package migration tests must execute the installed artifact

For bundled plugin doctor migrations, source-level tests can pass while the package is unusable because bundled build entries come from `git ls-files`. A migration acceptance test should therefore build and install the real tarball, assert the expected `dist/extensions/<plugin>/doctor-contract-api.js` exists, and invoke the installed `openclaw.mjs doctor --fix`.

Run the packaged CLI with `HOME`, `OPENCLAW_STATE_DIR`, `OPENCLAW_CONFIG_PATH`, `OPENCLAW_OAUTH_DIR`, and `OPENCLAW_BUNDLED_PLUGINS_DIR` all pointed at one temporary root. This both prevents live-state access and ensures discovery resolves the packaged plugin rather than checkout source.

Use the identical tarball-test command for RED and GREEN. RED should show the missing package artifact or unchanged legacy config; GREEN should additionally prove deterministic writeback, byte-stable second execution, refusal of mixed or canonically invalid authority, and successful installed `config validate` without starting the Gateway.
