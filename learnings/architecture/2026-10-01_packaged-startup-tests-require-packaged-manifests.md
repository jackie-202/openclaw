---
title: "Packaged startup tests must not reuse source manifest fixtures"
date: 2026-10-01
category: architecture
component: tooling
tags: [plugins, packaging, tests, externalization]
file_type: rules
---

In this fork, src/plugins/bundled-plugin-metadata.test.ts builds a registry from source manifests, while scripts/lib/bundled-plugin-build-entries.mjs and package.json control the distributable set. If extensions/<id> remains checked in during externalization, a source-backed startup assertion still sees that id even when the package intentionally excludes it. Assert packaged startup and explicit-enable behavior against an isolated packaged fixture; keep source-checkout hook tests labeled as source-only, and separately assert that unrelated bundled entries remain. Avoid filtering the source fixture merely to produce a passing packaged expectation.
