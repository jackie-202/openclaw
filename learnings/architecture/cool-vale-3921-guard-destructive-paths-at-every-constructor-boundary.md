---
title: "Guard destructive paths at every constructor boundary"
date: 2026-08-09
category: architecture
component: e2e
tags: [path-isolation, sqlite, cross-repo, defense-in-depth]
---

The integration listener rejected production spool paths, but its Python spool probe could still construct `DeliberationSpool` and mutate production state before the listener guard ran. Apply isolation checks in every process that can open or initialize state, before constructing database or spool objects. Resolve symlinks, reject overlap with the canonical production root, require containment in the temporary fixture root, and validate a fixture sentinel where practical.
