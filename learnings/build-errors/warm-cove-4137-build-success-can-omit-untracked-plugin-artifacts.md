---
title: "Bundled plugin builds can omit untracked public artifacts"
date: 2026-08-22
category: build-errors
component: tooling
tags: [openclaw, bundled-plugins, build-inventory, git-ls-files, doctor-contract]
file_type: checklist
---

# Bundled plugin builds can omit untracked public artifacts

OpenClaw's bundled plugin build inventory is derived from `git ls-files`, not a raw directory scan, when the checkout is a Git repository. A newly created top-level plugin surface such as `doctor-contract-api.ts` can therefore exist on disk, import successfully in direct tests, and coexist with a green full build while still being absent from the built plugin.

This creates a misleading proof pattern:

1. A focused test imports the source artifact directly and passes.
2. `pnpm build` passes because the untracked artifact is not an input.
3. Runtime discovery cannot load the artifact from the built package.

For any new bundled plugin public or control-plane surface, inspect the actual entry inventory in addition to running the build:

```bash
node --input-type=module -e "import { collectBundledPluginBuildEntries } from './scripts/lib/bundled-plugin-build-entries.mjs'; console.log(collectBundledPluginBuildEntries().find((item) => item.id === '<plugin-id>')?.sourceEntries)"
```

The entry must contain the new surface, and a built-runtime test should exercise discovery rather than importing the source file directly. A green build proves only that the selected inventory builds; it does not prove that an omitted untracked artifact was selected.
