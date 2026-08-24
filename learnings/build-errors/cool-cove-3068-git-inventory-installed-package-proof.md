---
title: "Package sidecar proof crosses git inventory and installed CLI boundaries"
date: 2026-08-23
category: build-errors
component: ci-cd
tags: [openclaw, plugins, packaging, doctor-migration, git-inventory, e2e]
file_type: checklist
---

# Package-sidecar proof must cross the git inventory and installed CLI boundaries

OpenClaw's bundled-plugin collector prefers `git ls-files` over directory scans. A valid top-level plugin sidecar can therefore exist, pass direct-import tests, and still be absent from `dist`, `dist-runtime`, and the npm tarball when it is not in the git index.

For a doctor migration sidecar, use this proof sequence:

1. Capture RED from a tarball built from the current git-derived inventory.
2. Verify the sidecar source with `git ls-files --error-unmatch`.
3. Assert both the build entry and packed artifact in `bundled-plugin-build-entries.test.ts`.
4. Build and require the sidecar in both `dist` and `dist-runtime`.
5. Repack, install under an isolated npm prefix, and invoke the installed `openclaw.mjs` with isolated HOME/config/state/plugin paths.
6. Assert canonical writeback, byte-identical second doctor execution, canonical validation, plugin discovery, and exact no-mutation refusal cases.

A successful source build is not package proof. The installed CLI boundary is what proves discovery and execution of the emitted doctor contract.

In heavily dirty integration worktrees, commit-scoped review can also misclassify a layered task when its required preceding baseline is not yet independently committed. Keep the review bundle bounded, state the integration baseline explicitly, and verify findings against the actual historical config contract before accepting them.
