---
title: "Opravte source link bez pnpm setup"
date: 2026-08-25
category: tooling
component: tooling
tags: [openclaw, pnpm, global-link, gateway, deployment]
file_type: checklist
---

# Repair a source link without running pnpm setup

On a machine where `openclaw` was already globally linked, bare `pnpm link --global` failed with `ERR_PNPM_NO_GLOBAL_BIN_DIR` even though the shell PATH already contained `$HOME/Library/pnpm` and `/opt/homebrew/bin/openclaw` resolved to the intended checkout.

Do not run `pnpm setup` automatically during deployment verification because it edits shell configuration. First verify the existing executable with `command -v`, inspect its symlink, and resolve its real path. If the intended pnpm home directory already exists and is on PATH, scope the repair to the command:

```bash
PNPM_HOME="$HOME/Library/pnpm" pnpm link --global
```

Then re-resolve the executable and compare it with the managed Gateway service command/root before restarting. A successful link alone is not activation proof; the restarted Gateway PID must still start after the final artifact mtime.
