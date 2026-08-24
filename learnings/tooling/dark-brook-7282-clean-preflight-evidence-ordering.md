---
title: "Capture evidence only after clean preflight"
date: 2026-08-23
category: tooling
component: ci-cd
tags: [acceptance, provenance, clean-worktree, fail-closed]
file_type: rules
---

# Capture evidence only after clean preflight

Canonical acceptance runners that reject dirty worktrees impose an ordering constraint on evidence-only follow-ups. A direct prerequisite run may need fresh GREEN provenance, but writing that provenance into the repository before the canonical run makes the checkout dirty and prevents the gate from starting.

Keep the direct run's command, timestamps, exit code, and complete output in an external or workspace-excluded capture until the canonical command has passed its clean-checkout preflight and created its immutable ledger. Append the TDD GREEN and completion checkpoint afterward. Alternatively, commit the proof through an authorized workflow before canonical execution; never weaken the cleanliness guard.

This ordering preserves both contracts: fresh behavioral proof remains genuine, and canonical authority is still bound to a clean committed revision.
