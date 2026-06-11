---
title: "Prove linked CLI fixes with realpath and direct import first"
date: 2026-06-10
category: tooling
component: tooling
tags: [cli, verification, runtime-deps, symlink, esm]
---

A runtime-fix verification worked best when it started with two cheap probes before any broader test run: resolve `openclaw` with `command -v` plus `realpath` to confirm the shell is executing the intended fork, then run a direct ESM probe like `node -e "import('global-agent')..."`. In this task, `openclaw --version` confirmed the linked executable pointed at the fork's `openclaw.mjs`, and the direct `import('global-agent')` proved the missing runtime dependency was actually loadable. Reuse this sequence whenever fixing linked CLI/runtime alias issues; avoid relying on test success alone, because tests can pass while the shell still points at the wrong binary or while the runtime dependency path is not the one users will execute.
