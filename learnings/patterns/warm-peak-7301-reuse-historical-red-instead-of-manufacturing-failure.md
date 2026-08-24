---
title: "Reuse historical RED instead of manufacturing failure"
date: 2026-08-24
category: patterns
component: tooling
tags: [tdd, red-green, provenance, acceptance-followup]
---

This evidence-repair follow-up inherited a genuine RED/GREEN implementation history from its parent task. Instead of inventing a new failing test, it created a provenance artifact linking the historical RED and reran the exact historical command for fresh GREEN evidence. The command passed 24 focused tests, while the canonical-only OR-23 integrity test remained conditionally skipped outside a full gate run.

For acceptance follow-ups, preserve and cite authentic historical RED evidence, then reproduce GREEN with the same behavioral command. Treat canonical-only conditional tests separately; a focused pass does not substitute for the canonical gate.
