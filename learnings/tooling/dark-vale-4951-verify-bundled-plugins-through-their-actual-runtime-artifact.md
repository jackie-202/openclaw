---
title: "Verify bundled plugins through their actual runtime artifact"
date: 2026-08-25
category: tooling
component: tooling
tags: [build-artifacts, plugins, dist, smoke-tests]
---

Source tests alone did not prove that the corrected routing code reached the deployed plugin. The effective artifact was found under `dist/extensions/deliberation`, while `dist-runtime/extensions/deliberation` acted as the runtime overlay rather than containing independently searchable source text. Reuse the combination of full build, inspection of the emitted bundle, and `test-built-plugin-singleton.mjs` to prove both code emission and runtime loading.
