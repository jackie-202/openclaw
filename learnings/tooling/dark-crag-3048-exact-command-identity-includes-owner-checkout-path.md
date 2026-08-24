---
title: "Exact TDD command identity includes the owner checkout path"
date: 2026-08-23
category: tooling
component: ci-cd
tags: [tdd, acceptance, cross-repository, provenance]
file_type: checklist
---

# Exact TDD command identity includes the owner checkout path

When an evidence-only acceptance follow-up must reuse a historical RED and produce matching-command GREEN, the checkout path embedded in the command is part of command identity. Pointing the same test at a newly approved owner checkout under a different path does not satisfy an exact-command proof helper.

Before GREEN:

1. Read the command from proof metadata rather than reconstructing it.
2. Require an owner-approved immutable revision and semantic convergence.
3. Provision that checkout at the recorded path without changing command arguments.
4. Record revision and owner-file hashes with the GREEN result.
5. Stop rather than rewriting proof metadata or treating fresh owner main as approval.

This keeps dependency provenance and TDD command provenance independently reviewable.
