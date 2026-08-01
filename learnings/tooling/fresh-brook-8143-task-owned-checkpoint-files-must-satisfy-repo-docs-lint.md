---
title: "Task-owned checkpoint files must satisfy repo docs lint"
date: 2026-07-29
category: tooling
component: tooling
tags: [markdownlint, checkpoints, docs]
---

`pnpm lint:docs plans/checkpoints/fresh-brook-8143.checkpoint.md` linted the checkpoint plus the wider docs set and failed on the newly created checkpoint due to missing blank lines around headings and lists. Fixing only checkpoint spacing made the same lint command pass.

When creating task checkpoint/proof markdown files, format them as first-class docs from the start: blank line after headings, blank lines around lists, and no compressed heading/list blocks. This avoids noisy verification failures unrelated to production code.
