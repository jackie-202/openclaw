---
title: "Fresh built-plugin proof cannot coexist with a no-build claim"
date: 2026-08-24
category: tooling
component: tooling
tags: [openclaw, plugins, build, package-testing, evidence]
file_type: rules
---

# Fresh built-plugin proof cannot coexist with a no-build claim

When a change affects bundled plugin registration, source-loader assertions do not prove the emitted runtime. `scripts/test-built-plugin-singleton.mjs` imports `dist/plugins/build-smoke-entry.js` and stages `dist/extensions`, so its result is valid only after a fresh local build. Running it against pre-existing `dist` can falsely prove the old source.

Package proof is stronger but has another side effect: `test/scripts/deliberation-doctor-package.e2e.test.ts` requires a fresh tarball and installs it into an isolated temporary prefix. This is not a live deployment, but it is still a build and an install.

During planning, treat requirements for fresh built/package proof and a final statement that no build or install occurred as contradictory. Obtain an explicit owner choice: authorize local artifact-only build/temporary-install proof and report it accurately, or preserve the no-build/no-install boundary and report emitted/package proof as blocked. Never satisfy the contradiction with stale artifacts or misleading final wording.
