---
title: "Acceptance follow-ups do not create missing cross-repository authority"
date: 2026-08-23
category: tooling
component: tooling
tags: [acceptance-fix, cross-repository, authority, tdd, provenance]
file_type: rules
---

# Acceptance follow-ups do not create missing cross-repository authority

An acceptance-fix task can require the same immutable owner bundle that blocked its parent without actually supplying that bundle. Before editing consumer mirrors, run `task-evidence` for the follow-up and inspect the explicitly referenced predecessor evidence. A new task ID and preserved local implementation do not authorize treating current owner `main`, divergent hashes, truncated commands, or repository-local passing tests as canonical authority.

For owner-backed TDD, keep three outcomes distinct:

- Historical behavioral RED may be linked when the plan explicitly identifies it.
- Repository-local focused tests and builds are supporting verification only.
- GREEN requires the approved full owner revision, required runtime hashes, exact named scenario assignment, exact owner selectors, and a clean readable checkout running the owner-backed command.

If lineage still has no verification evidence, update the checkpoint with the exact missing bundle fields and leave GREEN absent. This prevents an automated acceptance retry from converting the same provenance gap into fabricated convergence evidence.
