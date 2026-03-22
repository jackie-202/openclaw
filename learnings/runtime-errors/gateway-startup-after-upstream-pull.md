---
title: "Gateway failures after pulling upstream commits"
date: 2026-04-07
category: runtime-errors
component: general
tags: [gateway, sqlite, plugins, workspace-links, pnpm, build, chunk-hash, restart]
---

# Gateway failures after pulling upstream commits

After `git pull` from upstream openclaw, the gateway may fail to start or malfunction with three common symptoms. They are caused by stale build artifacts / stale process and should be resolved together.

## Symptom 1: Plugin module not found

```
[plugins] acpx failed to load: Error: Cannot find module 'acpx/runtime'
Require stack: dist/register.runtime-*.js
```

**Cause:** Workspace symlinks in `node_modules/` are stale. The plugin's `package.json` exports `./runtime` pointing to `./dist/runtime.js`, but pnpm workspace links need to be refreshed after upstream changes to workspace packages.

**Fix:** `pnpm install` restores workspace links, then `pnpm build` rebuilds all dist output.

## Symptom 2: SQLite database disk image is malformed

```
Unhandled promise rejection: Error: database disk image is malformed
  at withWriteTransaction → upsertTaskWithDeliveryState
```

**Cause:** The task registry SQLite database at `~/.openclaw/tasks/runs.sqlite` became corrupted (possibly from a crash or schema change).

**Fix:** Delete the file. It is safely recreated on next gateway startup.

```bash
rm ~/.openclaw/tasks/runs.sqlite
```

The flow registry lives at `~/.openclaw/flows/registry.sqlite` (separate file, check independently if needed).

## Symptom 3: Chunk hash mismatch after rebuild (ERR_MODULE_NOT_FOUND)

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '.../dist/route-reply.runtime-j8DdrSg2.js'
  imported from .../dist/dispatch-9wSs7rOK.js
```

**Cause:** The gateway process was started before or during `pnpm build`. The running process still references old chunk filenames with old content hashes (e.g. `-j8DdrSg2`), but the rebuild produced new hashes (e.g. `-MKjyvwtM`). The old chunk files no longer exist in `dist/`.

**Fix:** Restart the gateway after the build finishes. On macOS, restart via the OpenClaw Mac app or `scripts/restart-mac.sh`. Do not just rebuild -- the running process must be restarted to pick up new chunks.

**Key insight:** This symptom appears _after_ a successful build, not before. If the gateway was already running when you ran `pnpm build`, it will break mid-session because its in-memory module graph still points to old filenames.

## Combined fix procedure

```bash
rm ~/.openclaw/tasks/runs.sqlite   # only if corrupted
pnpm install && pnpm build
# THEN restart the gateway (Mac app or scripts/restart-mac.sh)
```

## When to suspect this

- Gateway crashes immediately after pulling new upstream commits
- Repeated plugin load errors in logs (same module, many retries)
- SQLite "malformed" errors in task registry operations
- `ERR_MODULE_NOT_FOUND` for `dist/*.js` chunks with hash suffixes after a rebuild
