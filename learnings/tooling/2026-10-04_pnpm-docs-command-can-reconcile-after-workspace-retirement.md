---
title: "Pnpm docs příkaz může po odstranění workspace změnit závislosti"
date: 2026-10-04
category: tooling
component: tooling
tags: [pnpm, workspace, plugin-retirement, source-only-verification]
---

# Pnpm docs commands can reconcile dependencies after workspace retirement

During manifest-backed removal of `extensions/deliberation`, updating `pnpm-lock.yaml` and removing the workspace package changed pnpm's dependency status. Running the otherwise read-only `pnpm docs:list` triggered automatic `pnpm install` reconciliation before the docs script. Output reported 170 removed packages, no downloads, and lifecycle scripts; the wrapper timed out before completing docs-list.

For a source-only retirement task whose policy forbids installation or writes to live `dist`, inspect command routing before invoking pnpm after workspace changes. Use the existing direct script (`node scripts/docs-list.js`) and curated Node test/type/lint wrappers when reconciliation is possible. Do not assume a docs command cannot mutate dependencies.

Report any unintended reconciliation explicitly. Do not silently reinstall to repair it when the task forbids installs. Keep production build/reload under host ownership and distinguish verified source tests from missing public package integration proof.
