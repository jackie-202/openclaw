---
title: "Public SDK test subpaths require package-runtime dependency proof"
date: 2026-09-30
category: architecture
component: shared
tags: [plugin-sdk, packaging, vitest, bundling]
file_type: checklist
---

# Publishing test-oriented SDK subpaths has a second dependency boundary

When two existing `src/plugin-sdk` test helpers are promoted to public package exports, alignment of `scripts/lib/plugin-sdk-private-local-only-subpaths.json`, the export generator, `package.json#files`, and build entries is necessary but does not prove every helper works as an installed-package API. The build uses `publicPluginSdkEntrypoints`, so changing classification automatically adds both JS and declaration build entries. The `plugin-sdk:api:check` hash then changes and needs explicit baseline approval.

Check actual package imports from a separate repo-local consumer whose `node_modules/openclaw` points at the checkout, and assert all four emitted artifacts appear in `npm pack --dry-run --json`. Also inspect the built runtime's dependency imports and mock targets. For example, `test-env.js` imports `vitest` at runtime (currently a root devDependency rather than a declared optional peer), and its exported DNS mocks use `vi.spyOn` against a bundled namespace with non-configurable getters. A successful `import()` check does not prove those particular helpers work from a packed plugin test runner. Treat resolving peer ownership and mockability as separate boundary work if changes to helper runtime are excluded by task scope.
