---
title: "Použij aktivní checkpoint jako evidenční ledger acceptance"
date: 2026-07-19
category: tooling
component: ci-cd
tags: [acceptance, evidence, checkpoint, grep]
file_type: checklist
---

# Use the active checkpoint as the acceptance evidence ledger

For an evidence-only acceptance repair, a completion claim in a checkpoint is not enough. Persist the exact required command output in the active task checkpoint, then add an exhaustive classification whose category counts sum to the raw line count.

For `modelByChannel`, the useful proof shape was:

1. Run the exact required command, `git grep -n modelByChannel src/`.
2. Preserve all 112 output lines verbatim.
3. Classify every file and line into contract/schema, legacy resolver/caller, maintenance/metadata, or tests.
4. Reconcile `2 + 3 + 45 + 62 = 112`.
5. Separately search the forbidden runtime subtree and state that its sole match is a negative test fixture.
6. Record the upstream compatibility decision so retained references are not mistaken for incomplete removal.

This makes the evidence durable across monitor sessions and lets semantic acceptance distinguish an intentionally retained compatibility surface from a forbidden runtime read without relying on transient terminal output.
