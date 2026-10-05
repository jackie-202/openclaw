---
title: "Obnova plánu ověřuje úvodní nadpis a sekce odděleně"
date: 2026-10-04
category: tooling
component: tooling
tags: [compound-plan, recovery, headers, planning, scope]
file_type: checklist
---

# Validate both layers of the planning artifact contract

The `calm-fork-3432` retirement plan used valid `##` section names but still failed recovery with `invalid_header`: its first line was `# Deliberation plugin retirement plan`. Repairing it to `# Plan 2026-10-04: Deliberation plugin: retire replaced bundled implementation and host path coupling` preserved the existing technical research and satisfied the dated-title convention.

- Run the caller's exact canonical path helper before editing; read and revise the returned existing plan rather than creating another artifact.
- Check the first-line `# Plan YYYY-MM-DD: Title` separately from the accepted second-level section names. Valid sections do not imply a valid title.
- Prefer explicit caller heading restrictions over skill-template headings and status markers; keep skill discovery, prerequisites and state links inside accepted sections.
- Read an untracked plan directly: `git diff --check -- <path>` can exit successfully without validating its contents.
- Preserve accepted external-suite evidence while recording missing runnable public-package inputs separately; repairing artifact formatting must not erase source-retirement gates or imply fresh implementation proof.

Evidence: `plans/2026-10-04_calm-fork-3432_deliberation-plugin-retire-replaced-bundled-implementation.md` and `plans/handoffs/deliberation-plugin-retirement/accepted-host-contract.md`. This recovery changed planning artifacts only; it did not execute host tests or retire sources.
