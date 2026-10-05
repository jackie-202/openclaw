---
title: "Export plugin-sdk test surface so external plugins can run their own test lane"
type: implementation
---

# Export plugin-sdk test surface so external plugins can run their own test lane

## Goal

Make `openclaw/plugin-sdk/plugin-test-api` and `openclaw/plugin-sdk/test-env` resolvable from a package that depends on this fork, so an externalized plugin can run its test suite outside the fork tree.

## Exact files/functions

- `package.json` (repository root): the `exports` map and the `files` array. Verified on 2026-09-30: `exports` has `./plugin-sdk`, `./plugin-sdk/channel-runtime-context`, `./plugin-sdk/discord` and ~40 more, but has no `./plugin-sdk/plugin-test-api` and no `./plugin-sdk/test-env` entry. There are no wildcard export keys. The `files` array at lines ~46-47 and ~62-63 actively excludes `!dist/plugin-sdk/plugin-test-api.js`, `!dist/plugin-sdk/plugin-test-api.d.ts`, `!dist/plugin-sdk/test-env.js`, `!dist/plugin-sdk/test-env.d.ts`.
- The build entry configuration that decides which `src/plugin-sdk/*` modules are emitted into `dist/plugin-sdk/`. Locate the current owner before editing; do not assume a path.

## Verified cause / intended change

The Deliberation plugin was moved to `~/Projects/deliberation-pipeline/plugins/openclaw-deliberation` and now depends on this fork through a local `file:` dependency. Its production build and runtime load already work. Its tests do not: `src/delivery-composition.test.ts`, `src/orchestration.test.ts` and `src/plugin.test.ts` import `openclaw/plugin-sdk/plugin-test-api` and `openclaw/plugin-sdk/test-env`, and Node rejects both with `Package subpath './plugin-sdk/plugin-test-api' is not defined by "exports"`. Reproduced directly:

```
node -e "import('openclaw/plugin-sdk/plugin-test-api')"
# ERR Package subpath './plugin-sdk/plugin-test-api' is not defined by "exports"
```

Add both subpaths to `exports` and stop excluding their built artifacts from `files`, mirroring exactly how a neighboring `./plugin-sdk/<name>` entry is shaped (same `types`/`import` condition structure, same dist filenames). Also verify the build actually emits `dist/plugin-sdk/plugin-test-api.js|.d.ts` and `dist/plugin-sdk/test-env.js|.d.ts`; if the build entry list omits them, add them there too.

Decide and record explicitly whether these are published as a normal public subpath or intentionally test-only. If there is an established convention in this repo for test-only SDK surface, follow it rather than inventing a new one.

## Boundaries / non-goals

- Do not change any existing `exports` entry, and do not introduce wildcard export keys.
- Do not change the runtime behavior of `plugin-test-api` or `test-env` themselves.
- Do not move, rename, or refactor plugin-sdk modules.
- Do not touch `extensions/deliberation/`, the bundled-plugin registration surface, or anything related to unbundling. That is a separate task.
- Do not run build/link/doctor/deploy against the live installation.

## Verification

- `import("openclaw/plugin-sdk/plugin-test-api")` from a package whose `node_modules/openclaw` resolves to this fork → resolves and returns the module namespace (currently throws `ERR_PACKAGE_PATH_NOT_EXPORTED`) → proving check.
- Same for `openclaw/plugin-sdk/test-env`.
- An existing already-exported subpath such as `openclaw/plugin-sdk/channel-runtime-context` → still resolves identically, proving no regression in the exports map.
- `npm pack --dry-run` (or the repo's existing equivalent) lists `dist/plugin-sdk/plugin-test-api.js` and `dist/plugin-sdk/test-env.js` instead of excluding them.

From the repository root, run the repo's existing canonical test command for package metadata/build entries (locate it; candidates include `test/scripts/bundled-plugin-build-entries.test.ts` and any package.json exports test) plus the smallest broader suite that covers `exports`.

Record the exact commands, results, and the explicit public-vs-test-only decision in the final note.

## Scope boundary

Repository-local to `~/Projects/openclaw-fork` only. Do not inspect or modify `~/Projects/deliberation-pipeline` or any other repository; the consumer-side evidence above is already recorded here. If you need consumer information beyond what is written in this task, record it as an unknown/follow-up instead of crossing the boundary.
