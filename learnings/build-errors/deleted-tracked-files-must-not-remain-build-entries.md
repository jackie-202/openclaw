---
title: "Smazané sledované soubory nesmí zůstat v build inventory"
date: 2026-09-07
category: build-errors
component: tooling
tags: [git-ls-files, bundled-plugins, build-inventory, deletion-first]
file_type: rules
---

# Deleted tracked files must not remain build entries

OpenClaw's bundled plugin build inventory prefers `git ls-files` over directory scanning. In a dirty implementation checkout, deleting a tracked top-level plugin sidecar does not immediately remove that path from `git ls-files`, so a deletion-first test can still see a build entry for a source file that no longer exists.

## Symptom

After deleting a tracked plugin sidecar, an inventory assertion such as this still fails:

```ts
expect(entries).not.toHaveProperty("extensions/example/retired-sidecar");
```

The collector is reading tracked names, not proving that each source is present in the working tree.

## Fix

When converting tracked paths into current-checkout build entries, ignore paths for which `fs.existsSync(path.join(cwd, line))` is false. This keeps the tracked-file optimization while preventing builds and package inventories from advertising deleted source files before an external commit or staging mechanism updates the index.

## Verification

Use a deletion-first inventory test that fails while the sidecar exists and passes after deletion. Also run the full build and package integrity check so stale tracked names cannot produce missing-input failures or packaged residue.
